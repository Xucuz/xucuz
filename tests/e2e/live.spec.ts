import {test,expect} from '@playwright/test';
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

test('ilk yayında yalnızca iki kategori sunulur ve veri hazırlığı açıklanır',async({page,request})=>{await page.goto('/');await expect(page.getByRole('status')).toContainText('Gerçek fiyat kaynakları hazırlanıyor');await expect(page.locator('.category-tabs button')).toHaveCount(2);await expect(page.locator('.category-grid .category-card')).toHaveCount(2);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.getByPlaceholder('Ürün, marka veya model kodu').fill('hotel');await page.getByRole('button',{name:'Ürün ara'}).click();await expect(page).toHaveURL(/\/elektronik\?q=hotel/);const xml=await(await request.get('/sitemap.xml')).text();expect(xml).toContain('/elektronik');expect(xml).toContain('/beyaz-esya');expect(xml).not.toContain('/otel');});
