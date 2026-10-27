import postgres from 'postgres';
import {drizzle} from 'drizzle-orm/postgres-js';
import * as schema from './schema';
export const sql=postgres(process.env.DATABASE_URL??'postgres://invalid:invalid@localhost:5432/unconfigured',{max:5,connect_timeout:5,idle_timeout:20});
export const db=drizzle(sql,{schema});
