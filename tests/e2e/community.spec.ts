import {test,expect} from './fixtures';

test('Google benzeri arama ve 81 il listesi mobilde taşmadan görünür',async({page})=>{
 await page.goto('/');await expect(page.locator('h1')).toContainText('Ürün fiyatını ara');await expect(page.locator('.community-hero input[type="search"]')).toBeVisible();await expect(page.getByRole('link',{name:/Fiyat bildir/}).first()).toBeVisible();
 await page.goto('/fiyat-ekle');await expect(page.locator('input[name="productName"]')).toBeVisible();await expect(page.locator('select[name="city"] option')).toHaveCount(82);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('ana fiyat araması ürün önerilerini klavyeyle seçebilir',async({page})=>{
 await page.goto('/');const input=page.locator('.community-hero input[type="search"]');await input.fill('Buzdolabı');await expect(page.getByRole('listbox',{name:'Ürün önerileri'})).toBeVisible();await input.press('ArrowDown');await input.press('Enter');await expect(input).toHaveValue(/buzdolabı/i);await expect(page.getByRole('listbox')).toHaveCount(0);
});

test('URL araması ürünü ve ili korur; kayıt yokken fiyat üretmez',async({page})=>{
 await page.goto('/');await page.locator('.community-hero input[type="search"]').fill('Süt');await page.getByRole('button',{name:/Fiyatları karşılaştır/}).click();await expect(page).toHaveURL(/\/fiyatlar\?q=S%C3%BCt/);await expect(page.locator('.community-result-footnote')).toBeVisible();await expect(page.locator('.community-observation')).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('dil seçimi paylaşılabilir akışta korunur ve form etiketleri çevrilir',async({page})=>{
 await page.goto('/');await page.locator('.community-topline select').selectOption('en');await expect(page.locator('h1')).toContainText('Search a product');await page.goto('/fiyat-ekle');await expect(page.locator('h1')).toContainText('Submit a price observation');await expect(page.locator('input[name="productName"]').locator('xpath=..')).toContainText('Product name');await page.locator('.language-select select').first().selectOption('ru');await expect(page.locator('h1')).toContainText('Отправить наблюдение');
});

test('kanıtsız resim, yetkisiz moderasyon ve canlı örnek veri reddedilir',async({page,request})=>{
 await page.goto('/');const isDemo=new URL(page.url()).port==='3000';await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',isDemo?/noindex/:/index/);
 const response=await request.post('/api/community/submit',{headers:{origin:'https://attacker.example'},multipart:{productName:'Süt',store:'Market',city:'İstanbul',price:'20',observedAt:'2026-10-28',consent:'on',receipt:{name:'fake.jpg',mimeType:'image/jpeg',buffer:Buffer.from('this is not jpeg')}}});expect(response.status()).toBe(403);
 expect((await request.get('/api/admin/community')).status()).toBe(401);expect((await request.get('/api/admin/community/evidence/2d8e776b-681e-43c9-849d-240049c26f4f')).status()).toBe(401);
 const manifest=await request.get('/manifest.webmanifest');expect(manifest.ok()).toBeTruthy();expect((await manifest.json()).theme_color).toBe('#102a43');expect((await request.get('/sw.js')).status()).toBe(200);expect((await request.get('/offline.html')).status()).toBe(200);
});
