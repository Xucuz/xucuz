'use client';

import Image from 'next/image';
import { useLanguage, type Language } from './language-provider';
import { SportsCenter } from './sports-center';

const homeCopy: Record<Language, { title: string; genieAlt: string }> = {
  tr: { title: 'Xucuz maç merkezi', genieAlt: 'Dönen dünyaya dokunan Xucuz cin maskotu' },
  en: { title: 'Xucuz live sports', genieAlt: 'Xucuz genie touching a rotating globe' },
  de: { title: 'Xucuz Live-Sport', genieAlt: 'Xucuz-Dschinn berührt einen rotierenden Globus' },
  es: { title: 'Deportes en directo Xucuz', genieAlt: 'El genio de Xucuz toca un globo giratorio' },
  ru: { title: 'Спорт Xucuz в прямом эфире', genieAlt: 'Джинн Xucuz касается вращающегося глобуса' },
  fr: { title: 'Sports en direct Xucuz', genieAlt: 'Le génie Xucuz touche un globe en rotation' },
  ar: { title: 'رياضة Xucuz المباشرة', genieAlt: 'جني Xucuz يلمس كرة أرضية دوّارة' },
  zh: { title: 'Xucuz 体育直播', genieAlt: 'Xucuz 精灵触碰旋转的地球仪' },
};

export function XucuzWorldHome() {
  const { language } = useLanguage();
  const copy = homeCopy[language];

  return <div className="trends-home">
    <h1 className="trends-home-sr-only">{copy.title}</h1>
    <div className="trends-home-layout home-stadium-layout">
      <div className="trends-home-art">
        <Image className="trends-home-mascot" src="/xucuz-genie-globe.webp" alt={copy.genieAlt} width={745} height={1089} priority sizes="(max-width: 700px) 58vw, 30vw" />
        <div className="trends-home-globe" aria-hidden="true" />
      </div>
      <SportsCenter embedded />
    </div>
  </div>;
}
