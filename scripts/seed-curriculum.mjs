import {writeFile} from 'node:fs/promises';
import {ALL_WORDS,TOPICS} from '../src/data/words.js';
import {STAGES} from '../src/data/levels.js';
const quote=s=>"'"+String(s).replaceAll("'","''")+"'";
const levels=STAGES.map(s=>`(${[s.id,s.name].map(quote).join(',')},${s.level===1?1:s.level===2?3:5},${s.level===1?2:s.level===2?4:6},${s.target},${s.level},'published')`);
const units=TOPICS.map((t,i)=>`(${[t.id,t.stage].map(quote).join(',')},${TOPICS.filter(x=>x.stage===t.stage).findIndex(x=>x.id===t.id)+1},${[t.en,t.name,t.icon].map(quote).join(',')},'published')`);
const rows=ALL_WORDS.map(w=>[w.id,w.id,w.stage,w.topic,w.en,w.ko,w.ex,w.exKo].map(quote).join(','));
const aliases=ALL_WORDS.flatMap(w=>w.legacyIds.map(id=>`(${quote(id)},${quote(w.id)})`));
const sql='-- 커리큘럼 시드: 학생 기록을 수정하지 않음. 300 + 400 + 500 어휘 항목.\nBEGIN;\n'
+'INSERT INTO ojv.levels(id,name_ko,grade_min,grade_max,expected_words,sort_order,status) VALUES\n'+levels.join(',\n')+'\nON CONFLICT(id) DO UPDATE SET name_ko=excluded.name_ko,grade_min=excluded.grade_min,grade_max=excluded.grade_max,expected_words=excluded.expected_words,sort_order=excluded.sort_order,status=excluded.status;\n'
+'INSERT INTO ojv.units(id,level_id,unit_no,title_en,title_ko,icon,status) VALUES\n'+units.join(',\n')+'\nON CONFLICT(id) DO UPDATE SET level_id=excluded.level_id,unit_no=excluded.unit_no,title_en=excluded.title_en,title_ko=excluded.title_ko,icon=excluded.icon,status=excluded.status;\n'
+'INSERT INTO ojv.vocabulary (id,content_key,stage,topic,en,ko,example,translation,status) VALUES\n'+rows.map(r=>'('+r+",'published')").join(',\n')+'\nON CONFLICT(id) DO UPDATE SET content_key=excluded.content_key,stage=excluded.stage,topic=excluded.topic,en=excluded.en,ko=excluded.ko,example=excluded.example,translation=excluded.translation,status=excluded.status,updated_at=now();\n'
+(aliases.length?'INSERT INTO ojv.word_aliases (legacy_id,word_id) VALUES\n'+aliases.join(',\n')+'\nON CONFLICT(legacy_id) DO UPDATE SET word_id=excluded.word_id;\n':'')+'COMMIT;\n';
await writeFile('supabase/seed-curriculum.sql',sql);console.log(`Generated ${rows.length} words and ${aliases.length} legacy aliases.`);
