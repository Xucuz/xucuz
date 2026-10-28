import {describe,it,expect} from 'vitest';
import {modelCatalogSchema} from '../src/lib/products/model-schema';
import models from '../src/lib/products/models.json';
import {products,searchProducts} from '../src/lib/products';
describe('model catalog provenance and scale',()=>{
 it('keeps exact model identity and manufacturer provenance without invented prices',()=>{const model=modelCatalogSchema.parse(models)[0];expect(model.modelCode).toBe('SNV3S/1000G');expect(model.sourceUrl).toContain('kingston.com');expect(model).not.toHaveProperty('price');expect(products.find(p=>p.id===model.id)?.typeId).toBe('ssd');expect(searchProducts('NV3',1000,'','model')).toHaveLength(1);});
 it('rejects duplicate IDs, duplicate variants and missing product types',()=>{const m=models[0];expect(modelCatalogSchema.safeParse([m,{...m,id:'another-id'}]).success).toBe(false);expect(modelCatalogSchema.safeParse([{...m,id:'ssd'}]).success).toBe(false);expect(modelCatalogSchema.safeParse([{...m,productTypeId:'missing'}]).success).toBe(false);expect(modelCatalogSchema.safeParse([{...m,sourceUrl:'http://example.com'}]).success).toBe(false);expect(modelCatalogSchema.safeParse([{...m,verifiedOn:'2099-01-01'}]).success).toBe(false);});
 it('validates a 50,000-record total capacity without publishing synthetic fixtures',()=>{const rows=Array.from({length:49_475},(_,i)=>({...models[0],id:`scale-test-${i}`,modelCode:`TEST-${i}`}));expect(modelCatalogSchema.safeParse(rows).success).toBe(true);expect(modelCatalogSchema.safeParse([...rows,{...models[0],id:'too-many',modelCode:'TOO-MANY'}]).success).toBe(false);});
});
