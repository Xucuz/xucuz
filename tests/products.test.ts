import {describe,it,expect} from 'vitest';
import {products,productGroups,searchProducts,resolveProduct,productChecks} from '../src/lib/products';
import {normalize} from '../src/lib/categories';
describe('editoryal ürün önerileri',()=>{
 it('500 benzersiz ürün adını 20 kategoride tutar',()=>{expect(products).toHaveLength(500);expect(new Set(products.map(p=>normalize(p.name))).size).toBe(500);expect(new Set(products.map(p=>p.id)).size).toBe(500);expect(productGroups).toHaveLength(20);});
 it('Türkçe karakter ve büyük/küçük harf farkını kaldırır',()=>{expect(searchProducts('BUZDOLABI')[0].name).toBe('Buzdolabı');expect(searchProducts('supurge').some(p=>p.name==='Süpürge')).toBe(true);});
 it('eş anlamlı arama ve tam eşleşmeyi önceliklendirir',()=>{expect(searchProducts('laptop')[0].name).toBe('Dizüstü bilgisayar');expect(resolveProduct('telefon')?.name).toBe('Akıllı telefon');expect(searchProducts('süpürge')[0].name).toBe('Süpürge');});
 it('kategori, sonuç sınırı ve bulunmayan ürünü doğru ele alır',()=>{expect(searchProducts('',500,'market')).toHaveLength(25);expect(searchProducts('',8)).toHaveLength(8);expect(searchProducts('olmayanürün')).toHaveLength(0);expect(resolveProduct('olmayanürün')).toBeUndefined();});
 it('her ürüne fiyat uydurmadan genel seçim noktaları verir',()=>{for(const p of products){expect(productChecks(p)).toHaveLength(3);expect(p).not.toHaveProperty('price');expect(p).not.toHaveProperty('googleRank');expect(p).not.toHaveProperty('searchVolume');}});
});
