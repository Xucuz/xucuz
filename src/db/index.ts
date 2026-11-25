import postgres from 'postgres';
import {drizzle} from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import {DB_POOL_MAX_CONNECTIONS} from '@/lib/traffic-optimization';
// Production keeps using DATABASE_URL. Neon/Vercel Preview can expose the
// branch-scoped connection as POSTGRES_URL, so use it only as a fallback.
export const sql=postgres(process.env.DATABASE_URL??process.env.POSTGRES_URL??'postgres://invalid:invalid@localhost:5432/unconfigured',{max:DB_POOL_MAX_CONNECTIONS,connect_timeout:5,idle_timeout:20});
export const db=drizzle(sql,{schema});
