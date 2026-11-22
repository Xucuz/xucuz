import type {GoogleTrend} from '@/lib/google-trends';

const PRODUCT_TERMS = [
  'akıllı telefon','telefon','iphone','samsung galaxy','galaxy s','galaxy z','macbook','laptop','bilgisayar','tablet','ipad','kulaklık','airpods','akıllı saat','apple watch',
  'buzdolabı','çamaşır makinesi','bulaşık makinesi','kurutma makinesi','robot süpürge','süpürge','klima','televizyon','oled tv','airfryer','air fryer','kahve makinesi','espresso makinesi',
  'oyun konsolu','playstation','ps5','xbox','nintendo switch','ekran kartı','ayakkabı','sneaker','mont','elbise','çanta','parfüm','kozmetik','güneş kremi','lego','oyuncak','bebek arabası','bebek bezi','bebek maması','deterjan','kitap','yatak','koltuk',
];

const PRODUCT_MODEL_PATTERNS = [
  /\b(?:iphone|ipad|macbook|dyson|xiaomi|redmi|pixel|playstation|xbox)\s*[a-z-]*\s*\d{1,4}[a-z0-9-]*\b/iu,
  /\bsamsung\s+(?:galaxy\s+)?[a-z]?\d{1,3}(?:\s?(?:ultra|plus|fe))?\b/iu,
];

/** Narrow, explainable classifier: only recognizable product names/categories from the TR feed. */
export function isShoppingProductTrend(trend: Pick<GoogleTrend,'geo'|'term'>): boolean {
  if (trend.geo.toUpperCase() !== 'TR') return false;
  const term = trend.term.normalize('NFKC').toLocaleLowerCase('tr-TR');
  if (PRODUCT_TERMS.some((product) => term.includes(product))) return true;
  return PRODUCT_MODEL_PATTERNS.some((pattern) => pattern.test(term));
}

export function turkeyShoppingTrends<T extends Pick<GoogleTrend,'geo'|'term'>>(trends: T[]): T[] {
  return trends.filter(isShoppingProductTrend);
}
