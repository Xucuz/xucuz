import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests/e2e',fullyParallel:false,workers:1,use:{baseURL:'http://localhost:3000',trace:'retain-on-failure'},projects:[
 {name:'chromium',testMatch:['site.spec.ts','calculators.spec.ts','guides.spec.ts','products.spec.ts'],use:{...devices['Desktop Chrome']}},
 {name:'mobile',testMatch:['site.spec.ts','calculators.spec.ts','guides.spec.ts','products.spec.ts'],use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}},
 {name:'live-chromium',testMatch:['live.spec.ts','calculators.spec.ts','guides.spec.ts','products.spec.ts'],use:{...devices['Desktop Chrome'],baseURL:'http://localhost:3001'}},
 {name:'live-mobile',testMatch:['live.spec.ts','calculators.spec.ts','guides.spec.ts','products.spec.ts'],use:{...devices['iPhone 13'],defaultBrowserType:'chromium',baseURL:'http://localhost:3001'}}
 ,{name:'guide-coverage',testMatch:'product-guide-coverage.spec.ts',use:{baseURL:'http://localhost:3001'}}
],webServer:[
 {command:'npm run start',url:'http://localhost:3000',env:{DATA_MODE:'demo',VERCEL:'',PORT:'3000'},reuseExistingServer:false,timeout:60000},
 {command:'npm run start',url:'http://localhost:3001',env:{PUBLIC_PRICES_ENABLED:'0',DATA_MODE:'demo',VERCEL:'1',DATABASE_URL:'',PORT:'3001'},reuseExistingServer:false,timeout:60000}
]});
