import {describe,expect,it} from 'vitest';
import {parseGoogleNewsRss,parseGoogleTrendsRss} from '@/lib/google-trends';

describe('Google Trends RSS parsing',()=>{
 it('extracts real trend titles and traffic without losing Turkish characters',()=>{
  const xml='<rss><channel><item><title>İstanbul &amp; Ankara</title><ht:approx_traffic>10K+</ht:approx_traffic></item><item><title><![CDATA[Örnek gündem]]></title></item></channel></rss>';
  expect(parseGoogleTrendsRss(xml)).toEqual([{term:'İstanbul & Ankara',traffic:'10K+'},{term:'Örnek gündem'}]);
 });

 it('returns safe HTTPS sources and strips HTML from news summaries',()=>{
  const xml='<rss><channel><item><title>Başlık &amp; devamı</title><link>https://news.example/story</link><description><![CDATA[<p>Özet <b>metni</b></p>]]></description><source url="https://news.example">Örnek Kaynak</source><pubDate>Sun, 22 Nov 2026 09:00:00 GMT</pubDate></item><item><title>Güvensiz</title><link>http://news.example/nope</link></item></channel></rss>';
  expect(parseGoogleNewsRss(xml)).toEqual([{title:'Başlık & devamı',url:'https://news.example/story',source:'Örnek Kaynak',summary:'Özet metni',publishedAt:'Sun, 22 Nov 2026 09:00:00 GMT'}]);
 });
});
