'use client';

import {useEffect, useRef, useState} from 'react';
import {MapPin,Navigation,Zap} from 'lucide-react';
import styles from './radar-route-finder.module.css';

type Coordinates = {latitude: number; longitude: number};
type ChargingStation = {
  id: number;
  type: 'node' | 'way' | 'relation';
  latitude: number;
  longitude: number;
  distanceMeters: number;
  name: string;
  operator: string;
  fee: string;
  sockets: string;
};

type SearchResult = {radiusMeters: number; stations: ChargingStation[]};

function distanceMeters(a: Coordinates, b: Coordinates) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = radians(b.latitude - a.latitude);
  const dLon = radians(b.longitude - a.longitude);
  const arc = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

function distanceLabel(meters: number) {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toLocaleString('tr-TR', {maximumFractionDigits: 1})} km`;
}

function createMapUrl(latitude: number, longitude: number) {
  const latitudeOffset = 0.27;
  const longitudeOffset = latitudeOffset / Math.max(Math.cos(latitude * Math.PI / 180), 0.25);
  const west = (longitude - longitudeOffset).toFixed(5);
  const south = (latitude - latitudeOffset).toFixed(5);
  const east = (longitude + longitudeOffset).toFixed(5);
  const north = (latitude + latitudeOffset).toFixed(5);
  return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${latitude.toFixed(5)}%2C${longitude.toFixed(5)}`;
}

function feeLabel(fee: string) {
  return fee === 'no' ? 'Ücretsiz (harita kaydına göre)' : fee === 'yes' ? 'Ücretli; tutar belirtilmemiş' : fee;
}

export function RadarRouteFinder() {
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [status, setStatus] = useState('');
  const [mapStatus, setMapStatus] = useState('');
  const watchId = useRef<number | null>(null);
  const lastMapLocation = useRef<Coordinates | null>(null);
  const lastMapUpdateAt = useRef(0);
  const lastSearchLocation = useRef<Coordinates | null>(null);
  const lastSearchAt = useRef(0);

  async function searchStations(coords: Coordinates) {
    setLoading(true);
    lastSearchLocation.current = coords;
    lastSearchAt.current = Date.now();
    try {
      const response = await fetch('/api/charging-stations/nearby', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(coords),
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Şarj üniteleri alınamadı.');
      const result = data as SearchResult;
      setStations(result.stations);
      setStatus(result.stations.length
        ? `${result.stations.length} şarj ünitesi bulundu; arama çevresi ${(result.radiusMeters / 1000).toLocaleString('tr-TR')} km.`
        : 'Bu çevrede OpenStreetMap’e kaydedilmiş şarj ünitesi bulunamadı. Harita kayıtları eksik olabilir.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Şarj üniteleri şu anda alınamıyor.');
    } finally {
      setLoading(false);
    }
  }

  function acceptPosition(position: GeolocationPosition) {
    const next = {latitude: position.coords.latitude, longitude: position.coords.longitude};
    const now = Date.now();
    const mapMovedEnough = !lastMapLocation.current || distanceMeters(lastMapLocation.current, next) >= 100;
    const mapWaitedEnough = now - lastMapUpdateAt.current >= 10000;
    if (!lastMapLocation.current || (mapMovedEnough && mapWaitedEnough)) {
      lastMapLocation.current = next;
      lastMapUpdateAt.current = now;
      setLocation(next);
    }

    const lastSearch = lastSearchLocation.current;
    if (!lastSearch || (distanceMeters(lastSearch, next) >= 10000 && now - lastSearchAt.current >= 180000)) {
      void searchStations(next);
    }
    setMapStatus('Canlı harita açık; konum hareket ettikçe harita izni dahilinde güncellenir.');
  }

  function stopLiveMap(message = 'Canlı harita durduruldu.') {
    if (watchId.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setTracking(false);
    setMapStatus(message);
  }

  function startLiveMap() {
    if (!navigator.geolocation) {
      setMapStatus('Bu tarayıcı konum özelliğini desteklemiyor.');
      return;
    }
    if (watchId.current !== null) return;
    setTracking(true);
    setMapStatus('Konum izni bekleniyor…');
    watchId.current = navigator.geolocation.watchPosition(acceptPosition, error => {
      const message = error.code === error.PERMISSION_DENIED
        ? 'Konum izni verilmedi. Tarayıcı ayarlarından izin verip tekrar deneyin.'
        : error.code === error.TIMEOUT
          ? 'Konum alınması zaman aşımına uğradı. Yeniden deneyebilirsiniz.'
          : 'Konum alınamadı. Cihazınızın konum ayarını kontrol edin.';
      stopLiveMap(message);
    }, {enableHighAccuracy: false, timeout: 15000, maximumAge: 5000});
  }

  useEffect(() => () => {
    if (watchId.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId.current);
  }, []);

  function searchOnce() {
    if (!navigator.geolocation) {
      setStatus('Bu tarayıcı konum özelliğini desteklemiyor.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(position => {
      acceptPosition(position);
      void searchStations({latitude: position.coords.latitude, longitude: position.coords.longitude});
    }, error => {
      setLoading(false);
      setStatus(error.code === error.PERMISSION_DENIED
        ? 'Konum izni verilmedi. Tarayıcı ayarlarından izin verip tekrar deneyin.'
        : 'Konum alınamadı. Cihazınızın konum ayarını kontrol edin.');
    }, {enableHighAccuracy: false, timeout: 12000, maximumAge: 30000});
  }

  return <section className={styles.panel} aria-labelledby="charging-title">
    <div className={styles.icon} aria-hidden="true"><Zap size={24}/></div>
    <div className={styles.content}>
      <p className={styles.kicker}>YAKININDAKİ HİZMETLER</p>
      <h2 className={styles.title} id="charging-title">Elektrikli araç şarj üniteleri</h2>
      <p className={styles.description}>Konum izniyle canlı haritayı aç; yakın istasyonları, işletmecileri ve kaynakta varsa ücret bilgisini gör.</p>
    </div>
    <div className={styles.actions}>
      <button className={styles.link} type="button" onClick={tracking ? () => stopLiveMap() : startLiveMap} aria-pressed={tracking}>
        <Navigation size={17} aria-hidden="true"/>{tracking ? 'Canlı haritayı durdur' : 'Canlı haritayı aç'}
      </button>
      <button className={styles.link} type="button" onClick={searchOnce} disabled={loading}>
        <Zap size={17} aria-hidden="true"/>{loading ? 'İstasyonlar aranıyor…' : 'Yakındaki üniteleri ara'}
      </button>
    </div>
    {location && <div className={styles.map}>
      <iframe className={styles.mapFrame} title="Yakındaki elektrikli araç şarj üniteleri haritası" src={createMapUrl(location.latitude, location.longitude)} loading="lazy"/>
      <p className={styles.mapCaption}>{mapStatus || 'Harita cihaz konumunuzu gösterir.'} Konum OpenStreetMap haritası için iletilir; Xucuz hesabınızda saklanmaz.</p>
    </div>}
    {(status || stations.length > 0) && <div className={styles.results} role="status" aria-live="polite">
      {status && <p className={styles.status}>{status}</p>}
      {stations.length > 0 && <ul className={styles.cameraList}>
        {stations.map(station => <li key={`${station.type}-${station.id}`} className={styles.cameraItem}>
          <span className={styles.cameraIcon} aria-hidden="true"><MapPin size={17}/></span>
          <span className={styles.cameraLabel}>
            <strong>{station.name}</strong><br/>
            {station.operator}
          </span>
          <strong className={styles.distance}>{distanceLabel(station.distanceMeters)}</strong>
          <span>{feeLabel(station.fee)}{station.sockets ? ` · ${station.sockets}` : ''}</span>
          <a href={`https://www.openstreetmap.org/${station.type}/${station.id}`} target="_blank" rel="noopener noreferrer">Haritada aç</a>
        </li>)}
      </ul>}
    </div>}
    <p className={styles.note}>İstasyon ve ücret bilgileri OpenStreetMap katkıcılarının kayıtlarından gelir; gerçek zamanlı tarife garantisi yoktur. Ücret belirtilmemişse tahmin edilmez; ödeme öncesi işletmecinin uygulamasından doğrulayın. İstasyon listesi canlı konum açıkken yaklaşık 10 km hareket ve 3 dakika geçince yenilenir.</p>
    <p className={styles.source}>Kaynak: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap katkıcıları</a></p>
  </section>;
}
