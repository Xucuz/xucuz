import type {Category} from '../categories';
export type PublicPage={id:string;url:string;category:Category;expectedName:string;attributes:Record<string,string|number|boolean>};
export type PublicSource={id:string;name:string;origin:string;encoding?:string;enabled?:boolean;pages:PublicPage[]};
// Reviewed ordinary HTML pages. No credentials, hidden JSON endpoints, cookies or search-result prices.
export const publicSources:PublicSource[]=[{
 id:'tazecicek-public',enabled:false,name:'Taze Çiçek',origin:'https://www.tazecicek.com',pages:[
 {id:'taze-heavens-9',url:'https://www.tazecicek.com/heavens-blossom-9-kirmizi-gul-buketi',category:'cicek',expectedName:'Heaven',attributes:{'Çiçek türü':'Gül','Çiçek adedi':9,'Renk':'Kırmızı','Sunum':'Buket','Teslimat':'Bölge ve saat sağlayıcıda doğrulanmalı'}},
 {id:'taze-endless-21',url:'https://www.tazecicek.com/endless-heartbeats-21-kirmizi-gul-buketi',category:'cicek',expectedName:'Endless',attributes:{'Çiçek türü':'Gül','Çiçek adedi':21,'Renk':'Kırmızı','Sunum':'Buket','Teslimat':'Bölge ve saat sağlayıcıda doğrulanmalı'}},
 {id:'taze-lime-white',url:'https://www.tazecicek.com/lime-touch-beyaz-gul-buketi',category:'cicek',expectedName:'Lime',attributes:{'Çiçek türü':'Gül','Renk':'Beyaz','Sunum':'Buket','Teslimat':'Bölge ve saat sağlayıcıda doğrulanmalı'}}
 ]
},{id:'incehesap-public',enabled:false,name:'İncehesap',origin:'https://www.incehesap.com',pages:[
 {id:'ince-honor-x8b-256',url:'https://www.incehesap.com/honor-pad-x8b-6gb-256gb-11-gri-tablet-fiyati-90039/',category:'elektronik',expectedName:'Honor',attributes:{'Marka':'Honor','Model':'Pad X8B','Depolama':'256 GB','Bellek':'6 GB','Renk':'Gri','Paket':'Çanta hediyeli; farklı paketler ayrı değerlendirilir','Garanti':'Sağlayıcıda kontrol edilmeli'}},
 {id:'ince-lg-32g620b',url:'https://www.incehesap.com/lg-ultragear-32g620b-b-31-5-200hz-1ms-2k-adaptive-sync-hdr10-pivot-destegi-qhd-ips-gaming-monitor-fiyati-93496/',category:'elektronik',expectedName:'32G620B',attributes:{'Marka':'LG','Model':'32G620B-B','Model kodu':'32G620B-B','Ekran':'31.5 inç','Garanti':'Sağlayıcıda kontrol edilmeli'}}
 ]
},{id:'cicekmarket-public',name:'Çiçek Market',encoding:'windows-1254',origin:'https://www.cicekmarket.com',pages:[
 {id:'cm-21-red',url:'https://www.cicekmarket.com/cicek/21-kirmizi-gul/',category:'cicek',expectedName:'21 Kırmızı Gül',attributes:{'Çiçek türü':'Gül','Çiçek adedi':21,'Renk':'Kırmızı','Sunum':'Buket','Teslimat':'Bölge ve saat sağlayıcıda doğrulanmalı'}},
 {id:'cm-11-red',url:'https://www.cicekmarket.com/cicek/sedefli-ambalajli-11-adet-kirmizi-gul-buketi-cm1358/',category:'cicek',expectedName:'Sedefli',attributes:{'Çiçek türü':'Gül','Çiçek adedi':11,'Renk':'Kırmızı','Sunum':'Sedefli ambalajlı buket','Teslimat':'Bölge ve saat sağlayıcıda doğrulanmalı'}}
 ]},{id:'gaming-public',name:'Gaming.Gen.TR',origin:'https://www.gaming.gen.tr',pages:[
 {id:'gaming-nv3-1tb',url:'https://www.gaming.gen.tr/urun/508757/kingston-nv3-1tb-nvme-pcie-4-0-okuma-6000mb-yazma-4000mb-m-2-ssd-snv3s-1000g/',category:'elektronik',expectedName:'SNV3S/1000G',attributes:{'Marka':'Kingston','Model':'NV3','Model kodu':'SNV3S/1000G','Kapasite':'1 TB','Bağlantı':'NVMe PCIe 4.0 M.2','Garanti':'Standart paket; sağlayıcıda doğrulanmalı'}}
 ]}];
export const pageById=(id:string)=>publicSources.flatMap(source=>source.pages.map(page=>({source,page}))).find(v=>v.page.id===id);
export const SNAPSHOT_URL='https://raw.githubusercontent.com/Xucuz/xucuz/price-data/public-offers.json';
