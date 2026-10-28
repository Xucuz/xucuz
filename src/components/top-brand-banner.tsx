import Link from 'next/link';
// Both viewports show unmodified regions of the same approved poster:
// the product-collage X and its original wordmark/tagline.
export function TopBrandBanner(){return <section className="top-brand-band" aria-label="Xucuz marka görseli"><Link href="/" className="top-brand-card" aria-label="Ürün simgeli Xucuz.com logosu — ana sayfa"><span className="top-brand-symbol"><svg viewBox="55 215 920 900" aria-hidden="true" focusable="false"><image href="/brand-intro.webp" width="1024" height="1536"/></svg></span><span className="top-brand-wordmark"><svg viewBox="45 1160 925 270" aria-hidden="true" focusable="false"><image href="/brand-intro.webp" width="1024" height="1536"/></svg></span></Link></section>;}
