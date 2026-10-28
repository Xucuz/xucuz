import {hashPassword} from '../src/lib/security';
const password=process.argv[2];if(!password||password.length<14){console.error('En az 14 karakterlik bir parola verin.');process.exitCode=1;}else console.log(hashPassword(password));
