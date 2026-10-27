import {migrate} from 'drizzle-orm/postgres-js/migrator';
import {db,sql} from '../src/db';
async function main(){try{await migrate(db,{migrationsFolder:'drizzle'});console.log('Migration tamamlandı.');}finally{await sql.end();}}
main().catch(()=>{console.error('Migration başarısız. Veritabanı bağlantısını kontrol edin.');process.exitCode=1;});
