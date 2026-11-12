'use client';

import {useState} from 'react';
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

function distanceLabel(meters: number) {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toLocaleString('tr-TR', {maximumFractionDigits: 1})} km`;
}

export function RadarRouteFinder(){
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [cameras, setCameras] = useState<NearbyCamera[] | null>(null);

  async function findNearby() {
    setStatus('');
    setCameras(null);
    if (!navigator.geolocation) {
      setStatus('Bu tarayıcı konum bulmayı desteklemiyor. Resmî rota sorgusunu kullanabilirsiniz.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async position => {
      try {
        const response = await fetch('/api/radars/nearby', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
          cache: 'no-store',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Yakın çevre sorgulanamadı.');
        const result = data as NearbyResult;
        setCameras(result.cameras);
        setStatus(result.cameras.length
          ? `${distanceLabel(result.radiusMeters)} çevrede OpenStreetMap'e kaydedilmiş ${result.cameras.length} sabit kamera kaydı.`
          : 'OpenStreetMap’te bu 5 km çevrede sabit kamera kaydı bulunamadı. Haritadaki kayıtlar eksik veya güncel olmayabilir.');
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
      <h2 className={styles.title} id="radar-route-title">Yakınımdaki radarlar</h2>
      <p className={styles.description}>İl veya ilçe seçmeden, yalnızca sen istediğinde cihaz konumundan 5 km çevredeki harita kayıtlarını ara.</p>
    </div>
    <button className={styles.link} type="button" onClick={findNearby} disabled={loading}>
      <Navigation size={17} aria-hidden="true"/>{loading ? 'Konum aranıyor…' : 'Konumumdan bul'}
    </button>
    {status && <div className={styles.results} role="status" aria-live="polite">
      <p className={styles.status}>{status}</p>
      {cameras && cameras.length > 0 && <ul className={styles.cameraList}>
        {cameras.map(camera => <li key={camera.id} className={styles.cameraItem}>
          <span className={styles.cameraIcon} aria-hidden="true"><MapPin size={17}/></span>
          <span className={styles.cameraLabel}>{camera.label}</span>
          <strong className={styles.distance}>{distanceLabel(camera.distanceMeters)}</strong>
          <a href={`https://www.openstreetmap.org/${camera.type}/${camera.id}`} target="_blank" rel="noopener noreferrer">Haritada aç</a>
        </li>)}
      </ul>}
    </div>}
    <p className={styles.note}>Konum izni yalnızca arama başlatınca istenir; koordinat sorgu için kullanılır ve Xucuz hesabına kaydedilmez. Bu, topluluk haritasındaki sabit kamera kayıtlarıdır; resmî veya eksiksiz liste değildir ve hareketli radar uyarısı vermez.</p>
    <p className={styles.source}>Kaynak: <a href={osmCopyrightUrl} target="_blank" rel="noopener noreferrer">© OpenStreetMap katkıcıları</a> · <Link href={officialRadarUrl} target="_blank" rel="noopener noreferrer">Resmî rota sorgusu</Link></p>
  </section>;
}
