import {test as base,expect} from '@playwright/test';
// Routine tests exercise the site after the one-time intro. Dedicated splash
// tests use the original fixture with clean storage and test the real timer.
export const test=base.extend({page:async({page},runTest)=>{await page.addInitScript(()=>{try{sessionStorage.setItem('xucuz-brand-intro-v1','shown');}catch{}});await runTest(page);}});
export {expect};
