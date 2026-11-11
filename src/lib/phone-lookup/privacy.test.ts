import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

describe('phone lookup privacy boundaries',()=>{
  it('gates both pages behind an opt-in feature flag',()=>{
    for(const page of ['src/app/numara-sorgulama/page.tsx','src/app/numara-sorgulama/gizlilik/page.tsx']){
      const source=readFileSync(resolve(process.cwd(),page),'utf8');
      expect(source).toContain("process.env.PHONE_LOOKUP_DEMO_ENABLED !== 'true'");
      expect(source).toContain('notFound()');
    }
  });
  it('does not add a network call to the lookup demo',()=>{
    const source=readFileSync(resolve(process.cwd(),'src/components/phone-lookup-demo.tsx'),'utf8');
    expect(source).not.toMatch(/\bfetch\s*\(|\bXMLHttpRequest\b|\bsendBeacon\s*\(/);
  });
  it('does not add a network call to the report demo',()=>{
    const source=readFileSync(resolve(process.cwd(),'src/components/phone-report-demo.tsx'),'utf8');
    expect(source).not.toMatch(/\bfetch\s*\(|\bXMLHttpRequest\b|\bsendBeacon\s*\(/);
  });
});
