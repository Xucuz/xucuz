'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="wrap section empty-state"><h1>Şu anda sonuçları getiremiyoruz.</h1><p>Bir süre sonra tekrar deneyebilirsin.</p><button className="btn" onClick={reset}>Tekrar dene</button></div>;}
