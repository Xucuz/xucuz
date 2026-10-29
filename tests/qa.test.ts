import {describe,it,expect} from 'vitest';
import {answerQuestion} from '../src/lib/qa';

describe('Xucuz soru-cevap yanıtları',()=>{
 it('birim fiyat sorusuna doğru hesap yöntemini ve aracı verir',()=>{const reply=answerQuestion('Birim fiyatı nasıl karşılaştırırım?');expect(reply.text).toContain('fiyatını net miktarına böl');expect(reply.href).toBe('/birim-fiyat');});
 it('canlı fiyat sorusunda teklif veya fiyat uydurmaz',()=>{const reply=answerQuestion('Gitarın güncel fiyatı nedir?');expect(reply.text).toContain('canlı fiyat uydurmaz');expect(reply.href).toBe('/veri-kaynaklari');});
 it('ürün türüne ait rehber ölçütlerini getirir',()=>{const reply=answerQuestion('Gitar seçerken nelere bakmalıyım?');expect(reply.text).toContain('Gitar için başlangıç noktası');expect(reply.href).toBe('/urunler/gitar');});
 it('bilmediği konuda kesin yanıt üretmez',()=>{expect(answerQuestion('Yarın hava nasıl olacak?').text).toContain('şu an güvenilir bir yanıtım yok');});
 it('İngilizce ve Rusça fiyat yanıtlarında mağaza teklifi izlenimi vermez',()=>{expect(answerQuestion('What is the cheapest current offer?','en').text).toContain('not live store offers');expect(answerQuestion('Где самая дешёвая цена?','ru').text).toContain('не придумываю цены');});
});
