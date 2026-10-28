import Image from 'next/image';

export function Logo(){return <span className="brand-lockup"><Image className="brand-wordmark" src="/logo.webp" width={1200} height={218} alt="Xucuz.com" unoptimized/><span className="brand-tagline">— Etikete değil, gerçek maliyete bak.</span></span>;}
