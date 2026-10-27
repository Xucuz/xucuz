import {describe,it,expect} from 'vitest';
import {findGuides} from '../src/lib/guides';
describe('rehber araması',()=>{
 it('Türkçe büyük harf ve aksansız yazımı eşleştirir',()=>{expect(findGuides('BUZDOLABI').map(g=>g.slug)).toEqual(findGuides('buzdolabı').map(g=>g.slug));expect(findGuides('SÜPÜRGE')).toHaveLength(1);});
 it('birden fazla kelimeyi ve konu filtresini birlikte uygular',()=>{expect(findGuides('küçük ev','ev').map(g=>g.slug)).toContain('kucuk-ev-icin-supurge-secimi');expect(findGuides('bilgisayar','ev')).toHaveLength(0);expect(findGuides('bilgisayar','teknoloji')).toHaveLength(1);});
 it('bilinmeyen konu veya ürün için sonuç uydurmaz',()=>{expect(findGuides('olmayanürün')).toHaveLength(0);expect(findGuides('','gecersiz')).toHaveLength(0);});
});
