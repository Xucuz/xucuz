import {describe,expect,it} from 'vitest';
import {parseGoogleNewsRss,parseGoogleTrendsRss} from '@/lib/google-trends';

describe('Google Trends RSS parsing',()=>{
 it('extracts real trend titles and traffic without losing Turkish characters',()=>{
  const xml='<rss><channel><item><title>İstanbul &amp; Ankara</title><ht:approx_traffic>10K+</ht:approx_traffic><ht:news_item><ht:news_item_title>Yerel haber</ht:news_item_title><ht:news_item_picture>https://lh3.googleusercontent.com/photo</ht:news_item_picture></ht:news_item></item><item><title><![CDATA[Örnek gündem]]></title></item></channel></rss>';
  expect(parseGoogleTrendsRss(xml,{geo:'TR',locale:'tr-TR',language:'tr'})).toEqual([{geo:'TR',locale:'tr-TR',language:'tr',term:'İstanbul & Ankara',traffic:'10K+',imageUrl:'https://lh3.googleusercontent.com/photo',relatedTitle:'Yerel haber'},{geo:'TR',locale:'tr-TR',language:'tr',term:'Örnek gündem'}]);
 });

 it('returns safe HTTPS sources and strips HTML from news summaries',()=>{
  const xml='<rss><channel><item><title>Başlık &amp; devamı</title><link>https://news.google.com/rss/articles/story</link><description><![CDATA[&lt;p&gt;Özet &lt;b&gt;metni&lt;/b&gt;&lt;/p&gt;&nbsp;]]></description><media:content url="https://lh3.googleusercontent.com/news-photo"/><source url="https://news.example">Örnek Kaynak</source><pubDate>Sun, 22 Nov 2026 09:00:00 GMT</pubDate></item><item><title>Güvensiz</title><link>http://news.example/nope</link></item></channel></rss>';
  expect(parseGoogleNewsRss(xml)).toEqual([{title:'Başlık & devamı',url:'https://news.google.com/rss/articles/story',source:'Örnek Kaynak',summary:'Özet metni',imageUrl:'https://lh3.googleusercontent.com/news-photo',publishedAt:'Sun, 22 Nov 2026 09:00:00 GMT'}]);
 });
});
