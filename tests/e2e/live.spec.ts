import {test,expect} from './fixtures';
import {demoOffers} from '../../src/lib/demo';
test('Vercel eski demo ayarına rağmen yalnızca canlı mod; sekiz kategoride uydurma fiyat yok',async({page,request})=>{
 for(const category of ['otel','ucak','otobus','market','otomobil','elektronik','beyaz-esya','cicek']){
 const result=await(await request.get(`/api/search?category=${category}`)).json();expect(result.mode).toBe('live');expect(result.offers).toEqual([]);
 await page.goto(`/${category}`);if(['elektronik','beyaz-esya'].includes(category))await expect(page.getByRole('heading',{name:'Canlı teklif bulunmuyor'})).toBeVisible();else await expect(page.getByRole('heading',{name:/henüz sunulmuyor/})).toBeVisible();await expect(page.locator('.offer-card')).toHaveCount(0);await expect(page.getByText('Demo veriler — gerçek teklif değildir')).toHaveCount(0);
 }
 await page.goto('/teklif/cicek-1');await expect(page.getByRole('heading',{name:'Bu sayfa veya güncel teklif bulunamadı.'})).toBeVisible();
});
test('eski tarayıcı demo favori ve karşılaştırma kayıtları canlıda görünmez',async({page})=>{
 await page.addInitScript(o=>{localStorage.setItem('xucuz-favorites',JSON.stringify([o]));localStorage.setItem('xucuz-compare',JSON.stringify([o]));},demoOffers.find(o=>o.id==='cicek-1')!);
 await page.goto('/favoriler');await expect(page.getByRole('heading',{name:'Henüz favorin yok'})).toBeVisible();await expect(page.locator('.offer-card')).toHaveCount(0);
 await page.goto('/karsilastir');await expect(page.getByRole('heading',{name:'Henüz karşılaştırılacak ürün yok'})).toBeVisible();await expect(page.getByRole('table')).toHaveCount(0);
});

test('canlı ana sayfa market rehberi ve araçları sunar, satıcı fiyatı uydurmaz',async({page,request})=>{await page.goto('/');await expect(page.locator('.market-tool-card')).toHaveCount(3);await expect(page.getByRole('heading',{name:'Şu anda yayımlanabilir fiyat kaydı yok.'})).toBeVisible();await expect(page.locator('.offer-card')).toHaveCount(0);await page.goto('/market-rehberi');await expect(page.locator('h1')).toContainText('aynı ölçüye getir');const xml=await(await request.get('/sitemap.xml')).text();expect(xml).toContain('/birim-fiyat');expect(xml).toContain('/indirim-hesapla');expect(xml).toContain('/market-rehberi');expect(xml).not.toContain('/elektronik');});
test('piyano melodisi yalnızca ziyaretçi isteyince çalar ve kapatılabilir',async({page})=>{await page.goto('/');const play=page.getByRole('button',{name:'Piyano müziğini aç'});await expect(play).toHaveAttribute('aria-pressed','false');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await play.click();const stop=page.getByRole('button',{name:'Piyano müziğini kapat'});await expect(stop).toHaveAttribute('aria-pressed','true');await stop.click();await expect(page.getByRole('button',{name:'Piyano müziğini aç'})).toHaveAttribute('aria-pressed','false');});
