import {test,expect} from './fixtures';

test('Google benzeri arama ve 81 il listesi mobilde taşmadan görünür',async({page})=>{
 await page.goto('/');await expect(page.locator('h1')).toContainText('Ürün fiyatını ara');await expect(page.locator('.community-hero input[type="search"]')).toBeVisible();await expect(page.locator('.community-hero-feature')).toBeVisible();const mascot=page.locator('.community-hero-mascot');await expect(mascot).toBeVisible();await expect(page.locator('.community-header-logo img')).toHaveAttribute('src',/xucuz-original-logo\.jpg/);const layout=await page.evaluate(()=>{const image=document.querySelector<HTMLImageElement>('.community-hero-mascot')!,search=document.querySelector<HTMLElement>('.community-hero-search')!,imageRect=image.getBoundingClientRect(),searchRect=search.getBoundingClientRect();return{ratio:image.naturalWidth/image.naturalHeight,source:image.currentSrc.includes('xucina-brand.jpg'),imageLeft:imageRect.left,imageBottom:imageRect.bottom,searchRight:searchRect.right,searchTop:searchRect.top,width:document.documentElement.scrollWidth,viewport:innerWidth}});expect(layout.ratio).toBeCloseTo(1280/853,2);expect(layout.source).toBeTruthy();if((page.viewportSize()?.width??1024)<=700)expect(layout.imageBottom).toBeLessThanOrEqual(layout.searchTop);else expect(layout.imageLeft).toBeGreaterThanOrEqual(layout.searchRight);expect(layout.width).toBeLessThanOrEqual(layout.viewport);await page.locator('.live-qa-launcher').click();await expect(page.locator('.xucina-avatar img')).toBeVisible();await expect(page.getByRole('link',{name:/Fiyat bildir/}).first()).toBeVisible();
 await page.goto('/fiyat-ekle');await expect(page.locator('input[name="productName"]')).toBeVisible();await expect(page.locator('select[name="city"] option')).toHaveCount(82);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('günlük ziyaretçi sayımına katılım bandı gösterilmez ve tarayıcı sayım isteği göndermez',async({page})=>{
 let visitorRequestSent=false;await page.route('**/api/visitors',async route=>{visitorRequestSent=true;return route.fulfill({status:204,body:''});});
 await page.goto('/');await expect(page.locator('.visitor-consent')).toHaveCount(0);await expect(page.getByText(/Günlük tekil ziyaretçi sayımına anonim olarak katılmak ister misin/)).toHaveCount(0);
 await page.waitForTimeout(100);expect(visitorRequestSent).toBe(false);
});

test('Xucina sohbet penceresi yazılı soruya yanıt verir',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Xucina’ya sor|Ask Xucina|Спросить Ксучину/i}).click();
 const dialog=page.getByRole('dialog',{name:'Xucina'});await expect(dialog).toBeVisible();await expect(dialog.locator('.xucina-avatar img')).toBeVisible();const avatar=await dialog.locator('.xucina-avatar').boundingBox();expect(avatar?.width).toBeLessThanOrEqual(44);expect(avatar?.height).toBeLessThanOrEqual(44);
 await page.getByLabel('Sorunu yaz…').fill('Birim fiyatı nasıl karşılaştırırım?');await page.getByRole('button',{name:'Soruyu gönder'}).click();
 await expect(dialog.getByText(/Birim fiyat için ürünün fiyatını net miktarına böl/)).toBeVisible();
});

test('Xucina fiyat sorusunda kayıtsız fiyat üretmez',async({request})=>{
 const response=await request.post('/api/qa',{data:{question:'QzxvQzxv adı verilen hayali ürünün fiyatı kaç TL?'}});expect(response.ok()).toBeTruthy();
 const reply=await response.json() as {text:string};expect(reply.text).toMatch(/güncel ve yönetici onaylı|DATABASE_URL eksik|PostgreSQL veritabanına bağlanılamıyor|tabloları veritabanında bulunamadı|sorgusu tamamlanamadı/);expect(reply.text).not.toMatch(/\d+[,.]\d{2}\s?(₺|TL)/);
});

test('Xucina sohbeti telefonda görünür ve yatay taşma oluşturmaz',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Xucina’ya sor|Ask Xucina|Спросить Ксучину/i}).click();const dialog=page.getByRole('dialog',{name:'Xucina'});await expect(dialog).toBeVisible();
 const box=await dialog.boundingBox();expect(box).not.toBeNull();expect(box!.width).toBeLessThanOrEqual((page.viewportSize()?.width??0));expect(box!.x).toBeGreaterThanOrEqual(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.getByLabel('Sorunu yaz…').fill('Birim fiyatı nasıl karşılaştırırım?');await page.getByRole('button',{name:'Soruyu gönder'}).click();await expect(dialog.getByText(/Birim fiyat için ürünün fiyatını net miktarına böl/)).toBeVisible();
});

test('Xucina desteklenen tarayıcı seslerini seçilen dile göre kullanır',async({page})=>{
 await page.addInitScript(()=>{const scope=window as Window;class MockUtterance{lang='';rate=1;pitch=1;voice:SpeechSynthesisVoice|null=null;onerror:((event:SpeechSynthesisErrorEvent)=>void)|null=null;constructor(public text:string){}}const voices=['tr-TR','en-US','ru-RU'].map(lang=>({lang,name:'Samantha',voiceURI:lang,default:false,localService:true} as SpeechSynthesisVoice));const synthesis:{__xucinaSpoken?:string;cancel:()=>void;getVoices:()=>SpeechSynthesisVoice[];speak:(utterance:MockUtterance)=>void}={cancel:()=>{},getVoices:()=>voices,speak:(utterance)=>{synthesis.__xucinaSpoken=utterance.lang;}};Object.defineProperty(scope,'SpeechSynthesisUtterance',{configurable:true,value:MockUtterance});Object.defineProperty(scope,'speechSynthesis',{configurable:true,value:synthesis});});
 await page.goto('/');await page.getByRole('button',{name:/Xucina’ya sor|Ask Xucina|Спросить Ксучину/i}).click();
 const expected={tr:'tr-TR',en:'en-US',ru:'ru-RU'};for(const [language,locale] of Object.entries(expected)){await page.locator('.language-select select').first().selectOption(language);await page.getByRole('button',{name:/Yanıtı sesli oku|Read answer aloud|Прочитать ответ/i}).first().click();await expect.poll(()=>page.evaluate(()=>((window.speechSynthesis as SpeechSynthesis&{__xucinaSpoken?:string}).__xucinaSpoken))).toBe(locale);}
});

test('Xucina mikrofon desteği olmadığında yazılı soruya yönlendirir',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:undefined});Object.defineProperty(window,'webkitSpeechRecognition',{configurable:true,value:undefined});});
 await page.goto('/');await page.getByRole('button',{name:/Xucina’ya sor|Ask Xucina|Спросить Ксучину/i}).click();await page.getByRole('button',{name:'Sesle yaz'}).click();await expect(page.getByText('Bu tarayıcı mikrofonla ses tanımayı desteklemiyor. Sorunu yazarak iletebilirsin.')).toBeVisible();
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

test('üyelik isteyen canlı sohbet rumuzla mesaj gönderir ve mobilde taşma yapmaz',async({page})=>{
 let latestMessage='';
 await page.route('**/api/live-chat/auth',async route=>{
  if(route.request().method()==='GET')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({member:null})});
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({member:{id:'member-1',nickname:'FiyatMeraklisi'}})});
 });
 await page.route('**/api/live-chat/messages**',async route=>{
  if(route.request().method()==='GET')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({member:{id:'member-1',nickname:'FiyatMeraklisi'},messages:[]})});
  latestMessage=(route.request().postDataJSON() as {message:string}).message;
  return route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({message:{id:'1',nickname:'FiyatMeraklisi',body:latestMessage,createdAt:new Date().toISOString()}})});
 });
 await page.goto('/');if(await page.getByRole('button',{name:'Reddet'}).isVisible().catch(()=>false))await page.getByRole('button',{name:'Reddet'}).click();
 await page.getByRole('button',{name:'Canlı Sohbet'}).click();const dialog=page.getByRole('dialog',{name:'Canlı Sohbet'});await expect(dialog).toBeVisible();
 await dialog.getByLabel('Rumuz').fill('FiyatMeraklisi');await dialog.getByLabel('Parola').fill('GuvenliParola123');await dialog.getByRole('button',{name:'Üyeliği oluştur ve katıl'}).click();
 await expect(dialog.getByText(/Rumuzun:/)).toBeVisible();await dialog.getByLabel('Mesajın').fill('Merhaba, birim fiyatı nasıl karşılaştırırım?');await dialog.getByRole('button',{name:'Mesajı gönder'}).click();
 await expect(dialog.getByText('Merhaba, birim fiyatı nasıl karşılaştırırım?')).toBeVisible();expect(latestMessage).toContain('Merhaba');
 const box=await dialog.boundingBox();expect(box).not.toBeNull();expect(box!.width).toBeLessThanOrEqual(page.viewportSize()?.width??0);expect(box!.x).toBeGreaterThanOrEqual(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});

test('kanıtsız resim, yetkisiz moderasyon ve canlı örnek veri reddedilir',async({page,request})=>{
 await page.goto('/');const isDemo=new URL(page.url()).port==='3000';await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',isDemo?/noindex/:/index/);
 const response=await request.post('/api/community/submit',{headers:{origin:'https://attacker.example'},multipart:{productName:'Süt',store:'Market',city:'İstanbul',price:'20',observedAt:'2026-10-28',consent:'on',receipt:{name:'fake.jpg',mimeType:'image/jpeg',buffer:Buffer.from('this is not jpeg')}}});expect(response.status()).toBe(403);
 expect((await request.get('/api/admin/community')).status()).toBe(401);expect((await request.get('/api/admin/community/evidence/2d8e776b-681e-43c9-849d-240049c26f4f')).status()).toBe(401);
 const manifest=await request.get('/manifest.webmanifest');expect(manifest.ok()).toBeTruthy();const appManifest=await manifest.json();expect(appManifest.theme_color).toBe('#102a43');expect(appManifest.icons.map((icon:{src:string})=>icon.src)).toEqual(['/xucina-icon-192.png','/xucina-icon-512.png']);for(const icon of appManifest.icons)expect((await request.get(icon.src)).ok()).toBeTruthy();expect((await request.get('/xucina-logo.svg')).ok()).toBeTruthy();expect((await request.get('/sw.js')).status()).toBe(200);expect((await request.get('/offline.html')).status()).toBe(200);
});



