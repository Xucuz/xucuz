import {describe,it,expect} from 'vitest';
import {POST} from '../src/app/api/qa/route';

describe('soru-cevap API',()=>{
 it('soru metnini doğrular ve ürün rehberi yanıtı döndürür',async()=>{
  const request=new Request('https://xucuz.test/api/qa',{method:'POST',headers:{'content-type':'application/json','x-real-ip':'192.0.2.44'},body:JSON.stringify({question:'Gitar seçerken nelere bakmalıyım?'})});
  const response=await POST(request);const body=await response.json() as {text:string;href:string};
  expect(response.status).toBe(200);expect(body.text).toContain('Gitar için başlangıç noktası');expect(body.href).toBe('/urunler/gitar');expect(response.headers.get('cache-control')).toBe('no-store');
 });
 it('çok uzun girdiyi reddeder',async()=>{
  const request=new Request('https://xucuz.test/api/qa',{method:'POST',headers:{'content-type':'application/json','x-real-ip':'192.0.2.45'},body:JSON.stringify({question:'x'.repeat(301)})});
  const response=await POST(request);expect(response.status).toBe(400);
 });
});
