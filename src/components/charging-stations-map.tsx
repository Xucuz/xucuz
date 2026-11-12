'use client';

import {useEffect, useRef} from 'react';
import 'leaflet/dist/leaflet.css';
import type {ChargingStation} from './charging-stations-finder';
import styles from './charging-stations-finder.module.css';

type Coordinates = {latitude: number; longitude: number};

function popupContent(station: ChargingStation) {
  const root = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = station.name;
  const operator = document.createElement('div');
  operator.textContent = station.operator;
  const details = document.createElement('div');
  details.textContent = [station.fee === 'yes' ? 'Ücret bilgisi var, tutar belirtilmemiş' : station.fee === 'no' ? 'Kaynakta ücretsiz olarak işaretlenmiş' : station.fee, station.sockets].filter(Boolean).join(' · ');
  root.append(title, operator, details);
  return root;
}

export function ChargingStationsMap({location, stations}: {location: Coordinates; stations: ChargingStation[]}) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<import('leaflet').Map | null>(null);
  const layers = useRef<import('leaflet').LayerGroup | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import('leaflet').then(L => {
      if (cancelled || !element.current) return;
      if (!map.current) {
        map.current = L.map(element.current, {scrollWheelZoom: false, zoomControl: true, attributionControl: true});
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map.current);
        layers.current = L.layerGroup().addTo(map.current);
      }

      const activeMap = map.current;
      const activeLayers = layers.current;
      if (!activeMap || !activeLayers) return;
      activeLayers.clearLayers();

      const userIcon = L.divIcon({className: styles.userPin, html: '<span></span>', iconSize: [22, 22], iconAnchor: [11, 11]});
      L.marker([location.latitude, location.longitude], {icon: userIcon, title: 'Konumunuz', zIndexOffset: 1000})
        .bindTooltip('Konumunuz')
        .addTo(activeLayers);

      const stationIcon = L.divIcon({className: styles.stationPin, html: '<span aria-hidden="true"><i>⚡</i></span>', iconSize: [32, 38], iconAnchor: [16, 34], popupAnchor: [0, -30]});
      const points: [number, number][] = [[location.latitude, location.longitude]];
      for (const station of stations) {
        points.push([station.latitude, station.longitude]);
        L.marker([station.latitude, station.longitude], {icon: stationIcon, title: station.name})
          .bindPopup(popupContent(station))
          .addTo(activeLayers);
      }

      if (points.length > 1) activeMap.fitBounds(L.latLngBounds(points).pad(0.15), {maxZoom: 15});
      else activeMap.setView([location.latitude, location.longitude], 14);
      window.setTimeout(() => activeMap.invalidateSize(), 0);
    });
    return () => { cancelled = true; };
  }, [location.latitude, location.longitude, stations]);

  return <div ref={element} className={styles.mapCanvas} role="application" aria-label={`Konumunuz ve ${stations.length} şarj ünitesi haritası`} />;
}
