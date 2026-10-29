import Image from 'next/image';

/** The original, unmodified Xucuz logo artwork supplied by the user. */
export function Logo({placement='header'}:{placement?:'header'|'footer'}){
 return <Image
  src="/xucuz-original-logo.jpg"
  alt="Xucuz.com — Türkiye’nin en ucuzunu birlikte bulalım!"
  width={1280}
  height={466}
  priority={placement==='header'}
  unoptimized
  sizes={placement==='header'?'(max-width: 700px) 155px, 230px':'210px'}
  className={`xucuz-original-logo xucuz-original-logo-${placement}`}
 />;
}
