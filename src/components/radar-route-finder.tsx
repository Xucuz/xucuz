import Link from 'next/link';
import {ArrowUpRight,Radar} from 'lucide-react';

const officialRadarUrl='https://www.icisleri.gov.tr/iller-arasi-radar-ve-kontrol-noktasi-uygulama-sayilari';

export function RadarRouteFinder(){
  return <section className="radar-route" aria-labelledby="radar-route-title">
    <div className="radar-route-icon" aria-hidden="true"><Radar size={24}/></div>
    <div className="radar-route-content">
      <p className="community-kicker">YOLA ÇIKMADAN ÖNCE</p>
      <h2 id="radar-route-title">Radar nerede?</h2>
      <p>Güzergâhındaki radar, hız koridoru ve trafik kontrol noktası bilgilerini İçişleri Bakanlığı’nın resmî rota sorgusunda incele.</p>
      <p className="radar-route-note">Bu bölüm resmî kaynağa yönlendirir; Xucuz canlı radar takibi veya kendi radar konum listesini sunmaz. Hız sınırlarına her zaman uy.</p>
    </div>
    <Link className="radar-route-link" href={officialRadarUrl} target="_blank" rel="noopener noreferrer">
      Resmî radar sorgusunu aç <ArrowUpRight size={17} aria-hidden="true"/>
    </Link>
    <p className="radar-route-source">Kaynak: <Link href={officialRadarUrl} target="_blank" rel="noopener noreferrer">T.C. İçişleri Bakanlığı</Link></p>
  </section>;
}
