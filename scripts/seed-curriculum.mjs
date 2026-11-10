import {writeFile} from 'node:fs/promises';
import {ALL_WORDS,TOPICS} from '../src/data/words.js';
import {STAGES} from '../src/data/levels.js';
const quote=s=>"'"+String(s).replaceAll("'","''")+"'";
const grades={prep:[9,9],grade1:[10,10],grade2:[11,11],grade3:[12,12]};
const levels=STAGES.map(s=>`(${[s.id,s.name].map(quote).join(',')},${grades[s.id][0]},${grades[s.id][1]},${s.target},${s.level+1},'published')`);
const units=TOPICS.map((t,i)=>`(${[t.id,t.stage].map(quote).join(',')},${TOPICS.filter(x=>x.stage===t.stage).findIndex(x=>x.id===t.id)+1},${[t.en,t.name,t.icon].map(quote).join(',')},'published')`);
const rows=ALL_WORDS.map(w=>[w.id,w.id,w.stage,w.topic,w.en,w.ko,w.ex,w.exKo,w.ex2,w.ex2Ko].map(quote).join(','));
const aliases=ALL_WORDS.flatMap(w=>w.legacyIds.map(id=>`(${quote(id)},${quote(w.id)})`));
const sql='-- 고등 커리큘럼 시드: 학생 기록을 수정하지 않음. 예비고1 200 + 고1/2/3 각 300, 총 1,100 항목.\nBEGIN;\n'
+'INSERT INTO ovh.levels(id,name_ko,grade_min,grade_max,expected_words,sort_order,status) VALUES\n'+levels.join(',\n')+'\nON CONFLICT(id) DO UPDATE SET name_ko=excluded.name_ko,grade_min=excluded.grade_min,grade_max=excluded.grade_max,expected_words=excluded.expected_words,sort_order=excluded.sort_order,status=excluded.status;\n'
+'INSERT INTO ovh.units(id,level_id,unit_no,title_en,title_ko,icon,status) VALUES\n'+units.join(',\n')+'\nON CONFLICT(id) DO UPDATE SET level_id=excluded.level_id,unit_no=excluded.unit_no,title_en=excluded.title_en,title_ko=excluded.title_ko,icon=excluded.icon,status=excluded.status;\n'
+'INSERT INTO ovh.vocabulary (id,content_key,stage,topic,en,ko,example,translation,example_2,translation_2,status) VALUES\n'+rows.map(r=>'('+r+",'published')").join(',\n')+'\nON CONFLICT(id) DO UPDATE SET content_key=excluded.content_key,stage=excluded.stage,topic=excluded.topic,en=excluded.en,ko=excluded.ko,example=excluded.example,translation=excluded.translation,example_2=excluded.example_2,translation_2=excluded.translation_2,status=excluded.status,updated_at=now();\n'
+(aliases.length?'INSERT INTO ovh.word_aliases (legacy_id,word_id) VALUES\n'+aliases.join(',\n')+'\nON CONFLICT(legacy_id) DO UPDATE SET word_id=excluded.word_id;\n':'')
+"UPDATE ovh.content_versions SET snapshot=ovh.content_snapshot() WHERE version='2026.11.10.1';\nCOMMIT;\n";
await writeFile('supabase/seed-curriculum.sql',sql);console.log(`Generated ${rows.length} words and ${aliases.length} legacy aliases.`);
