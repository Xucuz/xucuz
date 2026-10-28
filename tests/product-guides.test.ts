import {describe,it,expect} from 'vitest';
import {products,productTool} from '../src/lib/products';
import {productById,productFeatures,buildProductGuide} from '../src/lib/products/guide';
describe('tüm ürünlerde alışveriş rehberi',()=>{
 it('500 ürünün tamamında üç ölçüt, maliyetler ve kontrol listesi vardır',()=>{expect(products).toHaveLength(500);for(const p of products){const g=buildProductGuide(p);expect(g.title).toContain(p.name);expect(g.criteria).toHaveLength(3);expect(g.criteria.every(c=>c.length>10)).toBe(true);expect(g.costs).toHaveLength(3);expect(g.checks).toHaveLength(6);expect(g.usage).toBeTruthy();expect(productById(p.id)).toBe(p);}});
 it('farklı ürünlerde ilgili teknik ölçütleri sunar',()=>{const f=(id:string)=>productFeatures(productById(id)!).join(' ');expect(f('kamp-cadiri')).toContain('Mevsim');expect(f('ssd')).toContain('Arayüz');expect(f('bebek-bezi')).toContain('beden');expect(f('filtre-kahve')).toContain('Demleme');expect(f('buzdolabi')).toContain('Net hacim');expect(f('airfryer')).toContain('Hazne');});
 it('eksik ölçüt veya katalog dışı ürüne rehber uydurmaz',()=>{expect(productById('olmayan-urun')).toBeUndefined();expect(()=>productFeatures({...products[0],name:'Katalog dışı'})).toThrow('Product guide missing');});
 it('sarf ürününde birim fiyat, dayanıklı üründe ödeme aracına bağlanır',()=>{expect(productTool(productById('kedi-mamasi')!)).toBe('birim-fiyat');expect(productTool(productById('arac-akusu')!)).toBe('taksit-mi-pesin-mi');expect(productTool(productById('buzdolabi')!)).toBe('taksit-mi-pesin-mi');});
});
