import Link from 'next/link';
import {Car} from 'lucide-react';
import styles from './radar-route-finder.module.css';

const officialRadarUrl='https://www.icisleri.gov.tr/iller-arasi-radar-ve-kontrol-noktasi-uygulama-sayilari';

export function RadarRouteFinder(){
  return <section className={styles.panel} aria-labelledby="radar-route-title">
    <div className={styles.icon} aria-hidden="true"><Car size={24}/></div>
    <div className={styles.content}>
      <p className={styles.kicker}>YOLA ÇIKMADAN ÖNCE</p>
      <h2 className={styles.title} id="radar-route-title">Radar nerede?</h2>
      <p className={styles.description}>Güzergâhındaki radar, hız koridoru ve trafik kontrol noktası bilgilerini resmî rota sorgusunda incele.</p>
    </div>
    <Link className={styles.link} href={officialRadarUrl} target="_blank" rel="noopener noreferrer">
      Yol radarları <Car size={17} aria-hidden="true"/>
    </Link>
    <p className={styles.note}>Resmî sorguya yönlendirir. Xucuz konum izni istemez ve hareket hâlinde yakınlık uyarısı vermez. Hız sınırlarına her zaman uy.</p>
    <p className={styles.source}>Kaynak: <Link href={officialRadarUrl} target="_blank" rel="noopener noreferrer">T.C. İçişleri Bakanlığı</Link></p>
  </section>;
}
