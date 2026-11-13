'use client';

import {useEffect,useMemo,useState} from 'react';
import {Sparkles} from 'lucide-react';
import {useLanguage} from './language-provider';

const signs = [
  {key:'aries',symbol:'♈',names:{tr:'Koç',en:'Aries',ru:'Овен'}},
  {key:'taurus',symbol:'♉',names:{tr:'Boğa',en:'Taurus',ru:'Телец'}},
  {key:'gemini',symbol:'♊',names:{tr:'İkizler',en:'Gemini',ru:'Близнецы'}},
  {key:'cancer',symbol:'♋',names:{tr:'Yengeç',en:'Cancer',ru:'Рак'}},
  {key:'leo',symbol:'♌',names:{tr:'Aslan',en:'Leo',ru:'Лев'}},
  {key:'virgo',symbol:'♍',names:{tr:'Başak',en:'Virgo',ru:'Дева'}},
  {key:'libra',symbol:'♎',names:{tr:'Terazi',en:'Libra',ru:'Весы'}},
  {key:'scorpio',symbol:'♏',names:{tr:'Akrep',en:'Scorpio',ru:'Скорпион'}},
  {key:'sagittarius',symbol:'♐',names:{tr:'Yay',en:'Sagittarius',ru:'Стрелец'}},
  {key:'capricorn',symbol:'♑',names:{tr:'Oğlak',en:'Capricorn',ru:'Козерог'}},
  {key:'aquarius',symbol:'♒',names:{tr:'Kova',en:'Aquarius',ru:'Водолей'}},
  {key:'pisces',symbol:'♓',names:{tr:'Balık',en:'Pisces',ru:'Рыбы'}},
] as const;

const dailyNotes = [
  {title:{tr:'Odak',en:'Focus',ru:'Фокус'},text:{tr:'Bugün önceliklerini sadeleştir. Küçük bir işi tamamlamak gününü rahatlatabilir.',en:'Simplify your priorities today. Finishing one small task may make the day feel lighter.',ru:'Сегодня упростите свои приоритеты. Завершение небольшого дела может сделать день легче.'}},
  {title:{tr:'İletişim',en:'Communication',ru:'Общение'},text:{tr:'Açık ve sakin iletişim bugün işini kolaylaştırabilir. Dinlemeye de zaman ayır.',en:'Clear, calm communication may help today. Make time to listen, too.',ru:'Спокойное и ясное общение может помочь сегодня. Найдите время и для того, чтобы выслушать.'}},
  {title:{tr:'Denge',en:'Balance',ru:'Баланс'},text:{tr:'Kısa bir mola verip planını gözden geçirmek iyi gelebilir. Temponu kendine göre ayarla.',en:'A short pause to review your plans may help. Set a pace that works for you.',ru:'Небольшая пауза, чтобы пересмотреть планы, может быть полезна. Выберите свой темп.'}},
  {title:{tr:'Yaratıcılık',en:'Creativity',ru:'Творчество'},text:{tr:'Alışılmış bir konuya farklı açıdan bakmayı dene. Küçük bir fikir yeni bir yol açabilir.',en:'Try looking at a familiar matter from a different angle. A small idea can open a new path.',ru:'Попробуйте взглянуть на знакомый вопрос под другим углом. Небольшая идея может открыть новый путь.'}},
  {title:{tr:'Planlama',en:'Planning',ru:'Планирование'},text:{tr:'Bir sonraki adımını belirle, ama her şeyi bugün bitirmek zorunda değilsin.',en:'Choose your next step, but remember: you do not have to finish everything today.',ru:'Определите следующий шаг, но помните: не обязательно закончить всё сегодня.'}},
] as const;

const copy = {
  tr:{kicker:'GÜNLÜK BURÇ',title:'Günün burç yorumu',description:'Burcunu seç, bugünün kısa yorumunu gör.',choose:'Burcunu seç',disclaimer:'Eğlence amaçlıdır; bilimsel tahmin veya kişisel tavsiye değildir.'},
  en:{kicker:'DAILY HOROSCOPE',title:'Your daily horoscope',description:'Choose your sign for a short note for today.',choose:'Choose your sign',disclaimer:'For entertainment only; not a scientific forecast or personal advice.'},
  ru:{kicker:'ГОРОСКОП НА ДЕНЬ',title:'Гороскоп на сегодня',description:'Выберите знак, чтобы увидеть короткий прогноз на день.',choose:'Выберите знак',disclaimer:'Только для развлечения; это не научный прогноз и не личная рекомендация.'},
} as const;

function istanbulTodayKey() {
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul'}).format(new Date());
}

function dayNumber(dateKey: string) {
  const [year,month,day]=dateKey.split('-').map(Number);
  return Math.floor(Date.UTC(year,month-1,day)/86400000);
}

export function DailyHoroscope() {
  const {language}=useLanguage();
  const t=copy[language];
  const [signKey,setSignKey]=useState('');
  const [today,setToday]=useState(istanbulTodayKey);
  useEffect(()=>{
    const interval=window.setInterval(()=>setToday(istanbulTodayKey()),60_000);
    return ()=>window.clearInterval(interval);
  },[]);

  const selectedIndex=signs.findIndex(sign=>sign.key===signKey);
  const selected=selectedIndex>=0?signs[selectedIndex]:null;
  const note=useMemo(()=>selectedIndex<0?null:dailyNotes[(dayNumber(today)+selectedIndex)%dailyNotes.length],[selectedIndex,today]);

  return <section className="daily-horoscope" aria-labelledby="daily-horoscope-title">
    <div className="daily-horoscope-heading">
      <span className="daily-horoscope-icon"><Sparkles size={22}/></span>
      <div><p className="community-kicker">{t.kicker}</p><h2 id="daily-horoscope-title">{t.title}</h2><p>{t.description}</p></div>
    </div>
    <label className="daily-horoscope-select-label" htmlFor="daily-horoscope-sign">{t.choose}</label>
    <select id="daily-horoscope-sign" className="daily-horoscope-select" value={signKey} onChange={event=>setSignKey(event.target.value)}>
      <option value="">—</option>
      {signs.map(sign=><option key={sign.key} value={sign.key}>{sign.symbol} {sign.names[language]}</option>)}
    </select>
    {selected&&note&&<div className="daily-horoscope-reading" aria-live="polite">
      <strong><span aria-hidden="true">{selected.symbol}</span> {selected.names[language]} · {note.title[language]}</strong>
      <p>{note.text[language]}</p>
      <small>{new Intl.DateTimeFormat(language,{dateStyle:'long',timeZone:'Europe/Istanbul'}).format(new Date(`${today}T12:00:00+03:00`))}</small>
    </div>}
    <p className="daily-horoscope-disclaimer">{t.disclaimer}</p>
  </section>;
}
