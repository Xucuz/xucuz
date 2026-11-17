import {describe,it,expect} from 'vitest';
import {destinations,exploredCountryCount,sanitizePassportStamps} from '../src/lib/passport-data';

describe('Xucuz World Passport MVP',()=>{
 it('includes global destinations with coordinates and stable IDs',()=>{
  expect(destinations.length).toBeGreaterThanOrEqual(15);
  expect(new Set(destinations.map(place=>place.id)).size).toBe(destinations.length);
  expect(destinations.every(place=>place.lat>=-90&&place.lat<=90&&place.lon>=-180&&place.lon<=180)).toBe(true);
 });
 it('accepts only known, unique destination stamps',()=>{
  expect(sanitizePassportStamps(['tr-istanbul','tr-istanbul','not-a-place',1])).toEqual(['tr-istanbul']);
  expect(sanitizePassportStamps(null)).toEqual([]);
 });
 it('counts distinct countries from valid saved stamps',()=>{
  expect(exploredCountryCount(['tr-istanbul','tr-antalya','jp-tokyo'])).toBe(2);
 });
});
