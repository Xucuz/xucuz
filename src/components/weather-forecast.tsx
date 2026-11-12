'use client';

import {useState} from 'react';
import {Cloud,CloudDrizzle,CloudFog,CloudLightning,CloudRain,CloudSnow,CloudSun,LocateFixed,LoaderCircle,Sun} from 'lucide-react';
import {useLanguage} from './language-provider';

type WeatherDay = {date: string; min: number; max: number; symbol: string; precipitation: number};
type Forecast = {days: WeatherDay[]; attribution: string; attributionUrl: string};

const copy = {
  tr: {title:'Yakınındaki hava durumu',description:'Konumuna göre 5 günlük tahmini gör.',locate:'Konumuma göre göster',loading:'Konum alınıyor…',permission:'Hava durumunu görmek için konum izni ver veya tarayıcı ayarlarını kontrol et.',error:'Hava durumu şu anda alınamıyor. Biraz sonra tekrar dene.',rain:'Yağış',today:'Bugün'},
  en: {title:'Weather near you',description:'See a 5-day forecast for your location.',locate:'Use my location',loading:'Getting location…',permission:'Allow location access to see the weather, or check your browser settings.',error:'Weather is unavailable right now. Please try again later.',rain:'Precipitation',today:'Today'},
  ru: {title:'Погода рядом с вами',description:'Прогноз на 5 дней для вашего местоположения.',locate:'Показать по моему местоположению',loading:'Определяем местоположение…',permission:'Разрешите доступ к местоположению, чтобы увидеть погоду, или проверьте настройки браузера.',error:'Сейчас прогноз недоступен. Попробуйте позже.',rain:'Осадки',today:'Сегодня'},
} as const;

function WeatherIcon({code}: {code: string}) {
  const name = code.toLowerCase();
  const Icon = name.includes('thunder') ? CloudLightning
    : name.includes('snow') ? CloudSnow
      : name.includes('sleet') ? CloudDrizzle
        : name.includes('rain') ? CloudRain
          : name.includes('fog') ? CloudFog
            : name.includes('cloudy') ? Cloud
              : name.includes('partlycloudy') || name.includes('fair') ? CloudSun : Sun;
  return <Icon size={24} aria-hidden="true"/>;
}

export function WeatherForecast() {
  const {language} = useLanguage();
  const t = copy[language];
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function findWeather() {
    if (!navigator.geolocation) {
      setError(t.permission);
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(async ({coords}) => {
      try {
        const response = await fetch(`/api/weather?lat=${encodeURIComponent(coords.latitude)}&lon=${encodeURIComponent(coords.longitude)}`);
        const data = await response.json() as Forecast & {error?: string};
        if (!response.ok) throw new Error(data.error || t.error);
        setForecast(data);
      } catch {
        setError(t.error);
      } finally {
        setLoading(false);
      }
    }, () => {
      setError(t.permission);
      setLoading(false);
    }, {enableHighAccuracy:false, timeout:10000, maximumAge:600000});
  }

  return <section className="weather-forecast" aria-labelledby="weather-forecast-title">
    <div className="weather-forecast-heading">
      <div className="weather-forecast-title-wrap">
        <span className="weather-forecast-icon"><CloudSun size={22}/></span>
        <div><p className="community-kicker">{t.title}</p><h2 id="weather-forecast-title">{t.description}</h2></div>
      </div>
      <button className="weather-forecast-locate" type="button" onClick={findWeather} disabled={loading}>
        {loading ? <LoaderCircle size={17} className="weather-spin"/> : <LocateFixed size={17}/>} {loading ? t.loading : t.locate}
      </button>
    </div>
    {error && <p className="weather-forecast-message" role="status">{error}</p>}
    {forecast && <>
      <div className="weather-forecast-days">
        {forecast.days.map((day,index)=><article className="weather-forecast-day" key={day.date}>
          <span>{index===0?t.today:new Date(`${day.date}T12:00:00+03:00`).toLocaleDateString(language,{weekday:'short',timeZone:'Europe/Istanbul'})}</span>
          <WeatherIcon code={day.symbol}/>
          <strong>{Math.round(day.max)}° <i>{Math.round(day.min)}°</i></strong>
          {day.precipitation>0.2&&<small>{t.rain} {day.precipitation.toFixed(1)} mm</small>}
        </article>)}
      </div>
      <p className="weather-forecast-source">{forecast.attribution}. <a href={forecast.attributionUrl} target="_blank" rel="noreferrer">{language==='ru'?'Условия использования':language==='en'?'Terms of service':'Kullanım koşulları'}</a></p>
    </>}
  </section>;
}
