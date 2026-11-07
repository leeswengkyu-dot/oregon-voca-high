import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const run=vars=>{const env={...process.env};for(const k of ['VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY','VERCEL_ENV'])delete env[k];return spawnSync(process.execPath,['scripts/check-env.mjs'],{cwd:new URL('..',import.meta.url),env:{...env,...vars},encoding:'utf8'});};
test('local demo builds explicitly while unconfigured Vercel production is blocked',()=>{assert.equal(run({}).status,0);const r=run({VERCEL_ENV:'production'});assert.notEqual(r.status,0);assert.ok(r.stderr.includes('Production'));});
test('partial Supabase configuration and private keys cannot enter browser builds',()=>{assert.notEqual(run({VITE_SUPABASE_URL:'https://example.supabase.co'}).status,0);assert.notEqual(run({VITE_SUPABASE_URL:'https://example.supabase.co',VITE_SUPABASE_ANON_KEY:'sb_secret_example'}).status,0);const payload=Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url');assert.notEqual(run({VITE_SUPABASE_URL:'https://example.supabase.co',VITE_SUPABASE_ANON_KEY:'header.'+payload+'.signature'}).status,0);});
test('production accepts an HTTPS URL and public publishable key',()=>{assert.equal(run({VERCEL_ENV:'production',VITE_SUPABASE_URL:'https://example.supabase.co',VITE_SUPABASE_ANON_KEY:'sb_publishable_example'}).status,0);});
