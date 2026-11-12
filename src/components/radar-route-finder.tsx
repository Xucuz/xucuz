'use client';

import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {Car,MapPin,Navigation} from 'lucide-react';
import styles from './radar-route-finder.module.css';

const officialRadarUrl='https://www.icisleri.gov.tr/iller-arasi-radar-ve-kontrol-noktasi-uygulama-sayilari';
const osmCopyrightUrl='https://www.openstreetmap.org/copyright';

type NearbyCamera = {
  id: number;
  type: 'node' | 'way' | 'relation';
  latitude: number;
  longitude: number;
  distanceMeters: number;
  label: string;
};

type NearbyResult = {
  radiusMeters: number;
  cameras: NearbyCamera[];
};

type Coordinates = {latitude: number; longitude: number};

function distanceLabel(meters: number) {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toLocaleString('tr-TR', {maximumFractionDigits: 1})} km`;
}

function distanceMeters(a: Coordinates, b: Coordinates) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = radians(b.latitude - a.latitude);
  const dLon = radians(b.longitude - a.longitude);
  const arc = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

function createMapUrl(latitude: number, longitude: number) {
  const latitudeOffset = 0.01;
  const longitudeOffset = latitudeOffset / Math.max(Math.cos(latitude * Math.PI / 180), 0.25);
  const west = (longitude - longitudeOffset).toFixed(5);
  const south = (latitude - latitudeOffset).toFixed(5);
  const east = (longitude + longitudeOffset).toFixed(5);
  const north = (latitude + latitudeOffset).toFixed(5);
  return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${latitude.toFixed(5)}%2C${longitude.toFixed(5)}`;
}

export function RadarRouteFinder(){
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [mapStatus, setMapStatus] = useState('');
  const [tracking, setTracking] = useState(false);
  const [cameras, setCameras] = useState<NearbyCamera[] | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const watchId = useRef<number | null>(null);
  const lastMapUpdate = useRef<Coordinates | null>(null);
  const lastMapUpdateAt = useRef(0);

  function stopLiveMap(message = 'Canlı konum haritası durduruldu.') {
    if (watchId.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setTracking(false);
    setMapStatus(message);
  }

  useEffect(() => () => {
    if (watchId.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
    }
  }, []);

  function startLiveMap() {
    if (!navigator.geolocation) {
      setMapStatus('Bu tarayıcı canlı konum haritasını desteklemiyor.');
      return;
    }
    if (watchId.current !== null) return;
    setTracking(true);
    setMapStatus('Konum izni bekleniyor…');
    watchId.current = navigator.geolocation.watchPosition(position => {
      const next = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      const now = Date.now();
      const movedEnough = !lastMapUpdate.current || distanceMeters(lastMapUpdate.current, next) >= 100;
      const waitedEnough = now - lastMapUpdateAt.current >= 10000;
      if (!lastMapUpdate.current || (movedEnough && waitedEnough)) {
        lastMapUpdate.current = next;
        lastMapUpdateAt.current = now;
        setLocation(next);
      }
      setMapStatus('Canlı harita açık; konum değiştikçe harita güncellenir.');
    }, error => {
      const message = error.code === error.PERMISSION_DENIED
        ? 'Konum izni verilmedi. Haritayı açmak için tarayıcı ayarlarından izin verin.'
        : error.code === error.TIMEOUT
          ? 'Konum alınması zaman aşımına uğradı. Yeniden deneyebilirsiniz.'
          : 'Konum alınamadı. Cihazınızın konum ayarını kontrol edin.';
      stopLiveMap(message);
    }, {enableHighAccuracy: false, timeout: 15000, maximumAge: 5000});
  }

  function findNearby() {
    setStatus('');
    setCameras(null);
    if (!navigator.geolocation) {
      setStatus('Bu tarayıcı konum bulmayı desteklemiyor. Resmî rota sorgusunu kullanabilirsiniz.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async position => {
      const currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      lastMapUpdate.current = currentLocation;
      lastMapUpdateAt.current = Date.now();
      setLocation(currentLocation);
      try {
        const response = await fetch('/api/radars/nearby', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(currentLocation),
          cache: 'no-store',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Yakın çevre sorgulanamadı.');
        const result = data as NearbyResult;
        setCameras(result.cameras);
        setStatus(result.cameras.length
          ? `${distanceLabel(result.radiusMeters)} çevrede OpenStreetMap'e kaydedilmiş ${result.cameras.length} sabit kamera kaydı.`
          : 'OpenStreetMap’te bu 30 km çevrede sabit kamera kaydı bulunamadı. Haritadaki kayıtlar eksik veya güncel olmayabilir.');
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Yakın çevre sorgulanamadı. Biraz sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    }, error => {
      setLoading(false);
      if (error.code === error.PERMISSION_DENIED) {
        setStatus('Konum izni verilmedi. İsterseniz resmî rota sorgusunu açabilirsiniz.');
      } else if (error.code === error.TIMEOUT) {
        setStatus('Konum almak zaman aşımına uğradı. Açık alanda tekrar deneyin.');
      } else {
        setStatus('Konum alınamadı. Cihazınızın konum ayarını kontrol edin.');
      }
    }, {enableHighAccuracy: false, timeout: 12000, maximumAge: 30000});
  }

  return <section className={styles.panel} aria-labelledby="radar-route-title">
    <div className={styles.icon} aria-hidden="true"><Car size={24}/></div>
    <div className={styles.content}>
      <p className={styles.kicker}>YOLA ÇIKMADAN ÖNCE</p>
      <h2 className={styles.title} id="radar-route-title">Konum haritası</h2>
      <p className={styles.description}>Canlı harita yalnızca sen başlattığında açılır; hareket ettikçe konum işaretin güncellenir. Radar sorgusu ayrı olarak 30 km ile sınırlıdır.</p>
    </div>
    <div className={styles.actions}>
      <button className={styles.link} type="button" onClick={tracking ? () => stopLiveMap() : startLiveMap} aria-pressed={tracking}>
        <Navigation size={17} aria-hidden="true"/>{tracking ? 'Canlı haritayı durdur' : 'Canlı haritayı aç'}
      </button>
      <button className={styles.link} type="button" onClick={findNearby} disabled={loading}>
        <Car size={17} aria-hidden="true"/>{loading ? 'Konum aranıyor…' : 'Radarları ara (30 km)'}
      </button>
    </div>
    {location && <div className={styles.map}>
      <iframe
        className={styles.mapFrame}
        title="Canlı konum yol haritası"
        src={createMapUrl(location.latitude, location.longitude)}
        loading="lazy"
      />
      <p className={styles.mapCaption}>{mapStatus || 'Harita, konumunuzu gösterir; canlı takip cihazınızda yapılır.'} Harita görüntüsü için konum OpenStreetMap’e gönderilir, Xucuz hesabınızda saklanmaz.</p>
    </div>}
    {status && <div className={styles.results} role="status" aria-live="polite">
      <p className={styles.status}>{status}</p>
      {cameras && cameras.length > 0 && <ul className={styles.cameraList}>
        {cameras.map(camera => <li key={`${camera.type}-${camera.id}`} className={styles.cameraItem}>
          <span className={styles.cameraIcon} aria-hidden="true"><MapPin size={17}/></span>
          <span className={styles.cameraLabel}>{camera.label}</span>
          <strong className={styles.distance}>{distanceLabel(camera.distanceMeters)}</strong>
          <a href={`https://www.openstreetmap.org/${camera.type}/${camera.id}`} target="_blank" rel="noopener noreferrer">Haritada aç</a>
        </li>)}
      </ul>}
    </div>}
    <p className={styles.note}>Canlı konum takibi yalnızca tarayıcı izniyle ve bu cihazda çalışır; durdur düğmesiyle istediğin an kapatabilirsin. Radar sorgusu, yalnızca ayrı düğmeye bastığında konumu tek sefer kullanarak 30 km çevredeki topluluk kayıtlarını arar. Kayıtlar resmî veya eksiksiz değildir; hareketli radar uyarısı verilmez.</p>
    <p className={styles.source}>Kaynak: <a href={osmCopyrightUrl} target="_blank" rel="noopener noreferrer">© OpenStreetMap katkıcıları</a> · <Link href={officialRadarUrl} target="_blank" rel="noopener noreferrer">Resmî rota sorgusu</Link></p>
  </section>;
}
