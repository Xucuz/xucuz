import {test,expect} from '@playwright/test';

test('disabled phone lookup and privacy pages render not-found content',async({page})=>{
  for(const path of ['/numara-sorgulama','/numara-sorgulama/gizlilik']){
    await page.goto(path);
    // Next.js App Router can stream notFound() with HTTP 200; assert the actual page instead.
    await expect(page.getByRole('heading',{name:'Bu sayfa veya güncel teklif bulunamadı.'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Numara sorgulama'})).toHaveCount(0);
  }
});

test('disabled phone moderation page renders not-found content',async({page})=>{
  await page.goto('/admin/telefon-bildirimleri');
  await expect(page.getByRole('heading',{name:'Bu sayfa veya güncel teklif bulunamadı.'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Telefon bildirimleri'})).toHaveCount(0);
});
