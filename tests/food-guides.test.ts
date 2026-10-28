import {describe,it,expect} from 'vitest';
import {products,foodGroups,isFoodProduct,productTool,searchProducts,resolveProduct} from '../src/lib/products';
import {buildProductGuide} from '../src/lib/products/guide';
describe('food catalog and appropriate shopping guidance',()=>{
 it('adds 100 distinct types across four food groups with unit-price guidance',()=>{for(const group of foodGroups){const items=products.filter(p=>p.group===group);expect(items).toHaveLength(25);for(const p of items){const g=buildProductGuide(p);expect(g.isFood).toBe(true);expect(g.criteria).toHaveLength(3);expect(g.costs).toHaveLength(3);expect(g.checks).toHaveLength(6);expect(g.checks.join(' ')).toContain('net miktar');expect(productTool(p)).toBe('birim-fiyat');expect(p).not.toHaveProperty('price');}}});
 it('distinguishes existing foods from household market products',()=>{expect(isFoodProduct(resolveProduct('Pirinç')!)).toBe(true);expect(isFoodProduct(resolveProduct('Çamaşır deterjanı')!)).toBe(false);expect(isFoodProduct(resolveProduct('Gitar')!)).toBe(false);});
 it('searches Turkish category terms and keeps different food varieties separate',()=>{expect(searchProducts('ŞARKÜTERİ',1000)).toHaveLength(25);expect(searchProducts('MANAV',1000)).toHaveLength(25);expect(searchProducts('gıda',1000)).toHaveLength(118);expect(resolveProduct('BASMATİ PİRİNÇ')?.id).toBe('basmati-pirinc');expect(resolveProduct('Basmati pirinç')?.id).not.toBe(resolveProduct('Baldo pirinç')?.id);});
});
