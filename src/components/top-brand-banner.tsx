import Link from 'next/link';
import Image from 'next/image';
export function TopBrandBanner(){return <section className="top-brand-band" aria-label="Xucuz marka görseli"><Link href="/" className="top-brand-card" aria-label="Xucuz.com logosu — ana sayfa"><Image className="top-brand-symbol" src="/xucuz-logo.svg" width={96} height={96} alt="Xucuz.com siyah X logosu" unoptimized/><span className="top-brand-tagline">Etikete değil gerçek maliyete bak</span></Link></section>;}
