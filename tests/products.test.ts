import {describe,it,expect} from 'vitest';
import {products,productTypes,productGroups,searchProducts,resolveProduct,productChecks} from '../src/lib/products';
import {normalize} from '../src/lib/categories';
describe('editoryal ürün önerileri',()=>{
 it('ürün türlerini ve kaynaklı modelleri benzersiz tutar',()=>{expect(productTypes).toHaveLength(525);expect(products).toHaveLength(530);expect(new Set(products.map(p=>normalize(p.name))).size).toBe(products.length);expect(new Set(products.map(p=>p.id)).size).toBe(products.length);expect(productGroups).toHaveLength(21);});
 it('Türkçe karakter ve büyük/küçük harf farkını kaldırır',()=>{expect(searchProducts('BUZDOLABI')[0].name).toBe('Buzdolabı');expect(searchProducts('supurge').some(p=>p.name==='Süpürge')).toBe(true);});
 it('eş anlamlı arama ve tam eşleşmeyi önceliklendirir',()=>{expect(searchProducts('laptop')[0].name).toBe('Dizüstü bilgisayar');expect(resolveProduct('telefon')?.name).toBe('Akıllı telefon');expect(searchProducts('süpürge')[0].name).toBe('Süpürge');});
 it('kategori, sonuç sınırı ve bulunmayan ürünü doğru ele alır',()=>{expect(searchProducts('',500,'market')).toHaveLength(25);expect(searchProducts('',8)).toHaveLength(8);expect(searchProducts('olmayanürün')).toHaveLength(0);expect(resolveProduct('olmayanürün')).toBeUndefined();});
 it('her ürüne fiyat uydurmadan genel seçim noktaları verir',()=>{for(const p of products){expect(productChecks(p)).toHaveLength(3);expect(p).not.toHaveProperty('price');expect(p).not.toHaveProperty('googleRank');expect(p).not.toHaveProperty('searchVolume');}});
});

it('müzik araması saz ve gitarı çözer',()=>{expect(resolveProduct('bağlama')?.name).toBe('Saz');expect(searchProducts('guitar')[0].name).toBe('Gitar');expect(searchProducts('',1000,'muzik','type')).toHaveLength(25);expect(searchProducts('SNV3S/1000G')[0].kind).toBe('model');});
