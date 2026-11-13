'use client';

import {useState} from 'react';
import {Cloud,CloudDrizzle,CloudFog,CloudLightning,CloudRain,CloudSnow,CloudSun,LocateFixed,LoaderCircle,MapPin,Sun} from 'lucide-react';
import {useLanguage} from './language-provider';
import {turkiyeCities} from '@/lib/turkiye-cities';
import {turkiyeDistricts} from '@/lib/turkiye-districts';

type WeatherDay = {date: string; min: number; max: number; symbol: string; precipitation: number};
type Forecast = {days: WeatherDay[]; locationName: string | null; attribution: string; attributionUrl: string; locationAttribution: string | null; locationAttributionUrl: string};

const copy = {
  tr: {title:'Yakınındaki hava durumu',description:'Konumuna göre 5 günlük tahmini gör.',locate:'Konumumu kullan',country:'Ülke',province:'İl',district:'İlçe',selectCountry:'Ülke seçin',selectProvince:'İl seçin',selectDistrict:'İlçe seçin',showPlace:'Seçili yeri göster',loading:'Hava durumu alınıyor…',permission:'Hava durumunu görmek için konum izni ver veya ülke, il ve ilçeyi seç.',error:'Hava durumu şu anda alınamıyor. Biraz sonra tekrar dene.',locationLabel:'Tahmin konumu',rain:'Yağış',today:'Bugün',dataset:'İlçe verisi'},
  en: {title:'Weather near you',description:'See a 5-day forecast for your location.',locate:'Use my location',country:'Country',province:'Province',district:'District',selectCountry:'Select a country',selectProvince:'Select a province',selectDistrict:'Select a district',showPlace:'Show selected place',loading:'Loading weather…',permission:'Allow location access or choose a country, province, and district.',error:'Weather is unavailable right now. Please try again later.',locationLabel:'Forecast location',rain:'Precipitation',today:'Today',dataset:'District data'},
  ru: {title:'Погода рядом с вами',description:'Прогноз на 5 дней для вашего местоположения.',locate:'Моё местоположение',country:'Страна',province:'Провинция',district:'Район',selectCountry:'Выберите страну',selectProvince:'Выберите провинцию',selectDistrict:'Выберите район',showPlace:'Показать выбранное место',loading:'Загружаем погоду…',permission:'Разрешите доступ к местоположению или выберите страну, провинцию и район.',error:'Сейчас прогноз недоступен. Попробуйте позже.',locationLabel:'Место прогноза',rain:'Осадки',today:'Сегодня',dataset:'Данные районов'},
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
  const [country, setCountry] = useState('TR');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const availableDistricts = province ? turkiyeDistricts.filter(item => item.province === province) : [];

  async function loadForecast(lat: number, lon: number, selectedLocation?: string) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);
      const data = await response.json() as Forecast & {error?: string};
      if (!response.ok) throw new Error(data.error || t.error);
      setForecast({...data, locationName: selectedLocation || data.locationName});
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  function findSelectedWeather() {
    const selectedDistrict = availableDistricts.find(item => item.district === district);
    if (!selectedDistrict || country !== 'TR') return;
    void loadForecast(selectedDistrict.lat, selectedDistrict.lon, `${selectedDistrict.district}, ${selectedDistrict.province}, Türkiye`);
  }

  function findWeather() {
    if (!navigator.geolocation) {
      setError(t.permission);
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(({coords}) => {
      void loadForecast(coords.latitude, coords.longitude);
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
    <div className="weather-location-picker">
      <label>{t.country}<select value={country} onChange={event => {setCountry(event.target.value);setProvince('');setDistrict('');setForecast(null);}}>
        <option value="TR">Türkiye</option>
      </select></label>
      <label>{t.province}<select value={province} onChange={event => {setProvince(event.target.value);setDistrict('');setForecast(null);}}>
        <option value="">{t.selectProvince}</option>
        {turkiyeCities.map(city => <option key={city} value={city}>{city}</option>)}
      </select></label>
      <label>{t.district}<select value={district} onChange={event => {setDistrict(event.target.value);setForecast(null);}} disabled={!province}>
        <option value="">{t.selectDistrict}</option>
        {availableDistricts.map(item => <option key={`${item.province}-${item.district}`} value={item.district}>{item.district}</option>)}
      </select></label>
      <button className="weather-forecast-locate weather-place-submit" type="button" onClick={findSelectedWeather} disabled={loading || !district}>
        {loading ? <LoaderCircle size={17} className="weather-spin"/> : <MapPin size={17}/>} {loading ? t.loading : t.showPlace}
      </button>
    </div>
    {error && <p className="weather-forecast-message" role="status">{error}</p>}
    {forecast && <>
      {forecast.locationName && <p className="weather-forecast-location"><MapPin size={16} aria-hidden="true"/><span><small>{t.locationLabel}</small>{forecast.locationName}</span></p>}
      <div className="weather-forecast-days">
        {forecast.days.map((day,index)=><article className="weather-forecast-day" key={day.date}>
          <span>{index===0?t.today:new Date(`${day.date}T12:00:00+03:00`).toLocaleDateString(language,{weekday:'short',timeZone:'Europe/Istanbul'})}</span>
          <WeatherIcon code={day.symbol}/>
          <strong>{Math.round(day.max)}° <i>{Math.round(day.min)}°</i></strong>
          {day.precipitation>0.2&&<small>{t.rain} {day.precipitation.toFixed(1)} mm</small>}
        </article>)}
      </div>
      <p className="weather-forecast-source">{forecast.attribution}. <a href={forecast.attributionUrl} target="_blank" rel="noreferrer">{language==='ru'?'Условия использования':language==='en'?'Terms of service':'Kullanım koşulları'}</a>{forecast.locationAttribution&&<> · {forecast.locationAttribution} <a href={forecast.locationAttributionUrl} target="_blank" rel="noreferrer">OSM</a></>}</p>
    </>}
    <p className="weather-forecast-source">{t.dataset}: <a href="https://github.com/open-admin-data/turkey-administrative-divisions" target="_blank" rel="noreferrer">Open Admin Data</a> · CC BY 4.0</p>
  </section>;
}
