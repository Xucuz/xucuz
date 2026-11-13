import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

describe('phone moderation demo security boundaries',()=>{
  const page=readFileSync(resolve(process.cwd(),'src/app/admin/telefon-bildirimleri/page.tsx'),'utf8');
  const demo=readFileSync(resolve(process.cwd(),'src/components/phone-moderation-demo.tsx'),'utf8');

  it('requires both demo feature flag and authenticated administrator',()=>{
    expect(page).toContain("process.env.PHONE_LOOKUP_DEMO_ENABLED!=='true'");
    expect(page).toContain('await isAdmin()');
    expect(page).toContain('notFound()');
  });
  it('contains no network or persistence calls',()=>{
    expect(demo).not.toMatch(/\bfetch\s*\(|\bXMLHttpRequest\b|\bsendBeacon\s*\(|\blocalStorage\b|\bsessionStorage\b/);
  });
  it('uses synthetic records rather than phone numbers',()=>{
    expect(demo).toContain('DEMO-001');
    expect(demo).not.toMatch(/\+90\d{10}/);
  });
});
