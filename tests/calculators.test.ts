import {describe,it,expect} from 'vitest';
import {compareUnits,campaign,installments,decimal} from '../src/lib/calculators';
const product=(price:string,quantity:string,unit='g',packs='1')=>({price,quantity,unit,packs});
describe('birim fiyat ve ölçü dönüşümleri',()=>{
 it('750 g ile 1 kg ürünün fiyatını aynı ölçekte karşılaştırır',()=>{const r=compareUnits({a:product('129','750'),b:product('169','1','kg')});expect(r.aUnit).toBe(17200);expect(r.bUnit).toBe(16900);expect(r.winner).toBe('b');});
 it('çoklu paket toplamını litreye dönüştürür',()=>{const r=compareUnits({a:product('120','500','ml','6'),b:product('90','2','l')});expect(r.aAmount).toBe(3);expect(r.aUnit).toBe(4000);expect(r.bUnit).toBe(4500);expect(r.winner).toBe('a');});
 it('eşit fiyatı ve adet başına hesabı tanır',()=>{expect(compareUnits({a:product('20','2','adet'),b:product('30','3','adet')}).winner).toBe('equal');});
 it('fark yuvarlamada görünmese de kazananı erken yuvarlamayla değiştirmez',()=>{const r=compareUnits({a:product('1','300','adet'),b:product('1','301','adet')});expect(r.winner).toBe('b');});
 it('ağırlık ve hacmi eşdeğer saymaz',()=>{expect(()=>compareUnits({a:product('10','1','kg'),b:product('10','1','l')})).toThrow();});
 it.each(['0','-1','','NaN','Infinity'])('geçersiz miktarı reddeder: %s',q=>{expect(()=>compareUnits({a:product('10',q),b:product('10','1')})).toThrow();});
});
describe('kampanya toplamları',()=>{
 it('3 al 2 öde gerçek indirimini hesaplar',()=>{const r=campaign({mode:'bundle',price:'100',buy:'3',pay:'2'});expect(r.total).toBe(20000);expect(r.quantity).toBe(3);expect(r.saving).toBe(10000);expect(r.percent).toBeCloseTo(100/3);});
 it('ikinci ürüne yüzde 50 indirim iki üründe yüzde 25 kazandırır',()=>{const r=campaign({mode:'second',price:'100',percent:'50'});expect(r.total).toBe(15000);expect(r.percent).toBe(25);});
 it('yüzde indirimini kupondan önce uygular',()=>{const r=campaign({mode:'coupon',price:'100',quantity:'2',percent:'10',coupon:'20'});expect(r.total).toBe(16000);expect(r.saving).toBe(4000);});
 it('sonucu negatif yapmaz, fazla kuponu ve geçersiz grubu reddeder',()=>{expect(()=>campaign({mode:'coupon',price:'100',quantity:'1',percent:'10',coupon:'91'})).toThrow();expect(()=>campaign({mode:'bundle',price:'100',buy:'2',pay:'3'})).toThrow();});
 it('kuruş yuvarlamasını ödemeye uygular',()=>{const r=campaign({mode:'second',price:'0,01',percent:'50'});expect(r.total).toBe(2);expect(r.saving).toBe(0);});
});
describe('taksit ve peşin toplamları',()=>{
 it('zorunlu girilmiş ek ücreti taksit toplamına ekler',()=>{const r=installments({cash:'1000',monthly:'100',months:'12',fee:'50'});expect(r.total).toBe(125000);expect(r.difference).toBe(25000);expect(r.percent).toBe(25);});
 it('ucuz taksiti ve eşit toplamı ayırt eder',()=>{expect(installments({cash:'1000',monthly:'90',months:'10',fee:'0'}).difference).toBe(-10000);expect(installments({cash:'1000',monthly:'100',months:'10',fee:'0'}).difference).toBe(0);});
 it('bilinmeyen ek ücreti sıfır kabul etmez',()=>{expect(()=>installments({cash:'1000',monthly:'100',months:'10',fee:''})).toThrow();});
 it('kesirli veya sınırsız taksit sayısını reddeder',()=>{for(const months of ['2,5','121','0'])expect(()=>installments({cash:'1000',monthly:'100',months,fee:'0'})).toThrow();});
});
describe('Türkçe sayı girdisi',()=>{
 it('virgül, nokta ve açık Türkçe binlik gösterimini okur',()=>{expect(decimal('1.234,56')).toBe(1234.56);expect(decimal('1234.56')).toBe(1234.56);expect(decimal('1234,56')).toBe(1234.56);});
 it('para tutarında fazla ondalık ve bilimsel gösterimi reddeder',()=>{expect(()=>campaign({mode:'bundle',price:'1.234',buy:'3',pay:'2'})).toThrow();expect(Number.isNaN(decimal('1e4'))).toBe(true);});
});
