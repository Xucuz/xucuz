import {test,expect} from '@playwright/test';

test('phone lookup and privacy pages stay unavailable when the feature is disabled',async({request})=>{
  for(const path of ['/numara-sorgulama','/numara-sorgulama/gizlilik']){
    const response=await request.get(path);
    expect(response.status(),path).toBe(404);
  }
});

test('phone moderation demo stays unavailable when the feature is disabled',async({request})=>{
  const response=await request.get('/admin/telefon-bildirimleri');
  expect(response.status()).toBe(404);
});
