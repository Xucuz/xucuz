import Link from 'next/link';
export default function NotFound(){return <div className="wrap section empty-state"><h1>Bu sayfa veya güncel teklif bulunamadı.</h1><p>Teklifin süresi dolmuş olabilir. Yeni bir arama yapabilirsin.</p><Link href="/" className="btn">Ana sayfaya dön</Link></div>;}
