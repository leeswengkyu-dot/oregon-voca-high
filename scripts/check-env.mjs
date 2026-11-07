import {loadEnv} from 'vite';
const env={...loadEnv('production',process.cwd(),'VITE_'),...process.env};
const url=env.VITE_SUPABASE_URL,key=env.VITE_SUPABASE_ANON_KEY;
if(Boolean(url)!==Boolean(key))throw new Error('Supabase URL과 공개 anon/publishable 키를 함께 설정해 주세요.');
if(env.VERCEL_ENV==='production'&&(!url||!key))throw new Error('Vercel Production에 Supabase URL과 공개 키를 설정한 뒤 다시 배포해 주세요.');
if(url){const u=new URL(url);if(u.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(u.hostname))throw new Error('Supabase URL에는 HTTPS를 사용해 주세요.');}
if(key?.startsWith('sb_secret_'))throw new Error('비밀 키는 VITE_ 변수에 넣을 수 없습니다. 공개 키를 사용해 주세요.');
if(key?.split('.').length===3){let payload;try{payload=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString());}catch{throw new Error('Supabase 공개 키 형식을 확인해 주세요.');}if(payload.role==='service_role')throw new Error('service_role 키를 브라우저에 배포할 수 없습니다. anon 공개 키를 사용해 주세요.');}
console.log(url?'Supabase public environment configuration checked.':'Explicit device-local demo mode (no Supabase credentials).');
