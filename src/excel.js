import readXlsxFile from 'read-excel-file/browser';

const REQUIRED_SHEETS = ['README', 'Vocabulary', 'Sentences', 'Exercises', 'Assets'];
const VOCAB_HEADERS = ['action', 'content_key', 'level', 'unit_code', 'word', 'meaning_ko', 'part_of_speech', 'difficulty', 'example_en', 'example_ko', 'example_en_2', 'example_ko_2', 'image_filename', 'audio_filename', 'status'];

const text = (value) => String(value ?? '').trim();

async function sheetRows(file, sheet) {
  try { return await readXlsxFile(file, { sheet }); }
  catch (error) { throw new Error(`${sheet} 시트를 읽을 수 없어요: ${error.message}`); }
}

function objects(rows, sheet) {
  if (!rows.length) return [];
  const headers = rows[0].map((cell) => text(cell));
  return rows.slice(1).map((row) => Object.fromEntries(headers.map((header, col) => [header, row[col] ?? '']))).map((row, index) => ({ ...row, row: index + 2, sheet }));
}

export async function parseContentWorkbook(file) {
  const workbook = {};
  for (const sheet of REQUIRED_SHEETS) workbook[sheet] = await sheetRows(file, sheet);
  const errors = [];
  const headers = workbook.Vocabulary[0]?.map((cell) => text(cell)) || [];
  for (const header of VOCAB_HEADERS) if (!headers.includes(header)) errors.push({ sheet: 'Vocabulary', row: 1, message: `${header} 열이 필요해요` });

  const vocabulary = objects(workbook.Vocabulary, 'Vocabulary').filter((row) => Object.entries(row).some(([key, value]) => !['row', 'sheet'].includes(key) && text(value)));
  const seen = new Map();
  for (const row of vocabulary) {
    row.action = text(row.action || 'UPSERT').toUpperCase();
    row.content_key = text(row.content_key);
    row.level = text(row.level);
    row.unit_code = text(row.unit_code);
    row.word = text(row.word);
    row.meaning_ko = text(row.meaning_ko);
    row.part_of_speech = text(row.part_of_speech);
    row.difficulty = Number(row.difficulty || 1);
    row.example_en = text(row.example_en);
    row.example_ko = text(row.example_ko);
    row.example_en_2 = text(row.example_en_2);
    row.example_ko_2 = text(row.example_ko_2);
    row.image_filename = text(row.image_filename);
    row.audio_filename = text(row.audio_filename);
    row.status = text(row.status || 'draft').toLowerCase();
    if (!['UPSERT', 'ARCHIVE'].includes(row.action)) errors.push({ sheet: 'Vocabulary', row: row.row, message: 'action은 UPSERT 또는 ARCHIVE여야 해요' });
    if (!row.content_key) errors.push({ sheet: 'Vocabulary', row: row.row, message: 'content_key가 필요해요' });
    if (seen.has(row.content_key)) errors.push({ sheet: 'Vocabulary', row: row.row, message: `content_key 중복: ${row.content_key} (먼저 나온 행 ${seen.get(row.content_key)})` });
    else seen.set(row.content_key, row.row);
    if (row.action !== 'ARCHIVE') {
      if (!['prep', 'grade1', 'grade2', 'grade3'].includes(row.level)) errors.push({ sheet: 'Vocabulary', row: row.row, message: 'level은 prep, grade1, grade2, grade3 중 하나여야 해요' });
      for (const [key, label] of [['unit_code', 'Unit 코드'], ['word', '영단어'], ['meaning_ko', '뜻'], ['example_en', '영어 예문 1'], ['example_ko', '예문 해석 1'], ['example_en_2', '영어 예문 2'], ['example_ko_2', '예문 해석 2']]) {
        if (!row[key]) errors.push({ sheet: 'Vocabulary', row: row.row, message: `${label}이 필요해요` });
      }
      if (!Number.isInteger(row.difficulty) || row.difficulty < 1 || row.difficulty > 5) errors.push({ sheet: 'Vocabulary', row: row.row, message: 'difficulty는 1~5 정수여야 해요' });
    }
  }

  const sentences = objects(workbook.Sentences, 'Sentences').filter((row) => row.content_key || row.action);
  const exercises = objects(workbook.Exercises, 'Exercises').filter((row) => row.content_key || row.action);
  const assets = objects(workbook.Assets, 'Assets').filter((row) => row.content_key || row.action);
  for (const row of sentences) {
    row.action=text(row.action||'UPSERT').toUpperCase();row.content_key=text(row.content_key);row.unit_code=text(row.unit_code);row.sentence_en=text(row.sentence_en);row.sentence_ko=text(row.sentence_ko);row.target_keys=text(row.target_keys);row.status=text(row.status||'draft');
    if(!row.content_key)errors.push({sheet:'Sentences',row:row.row,message:'content_key가 필요해요'});
    if(row.action!=='ARCHIVE'&&(!row.unit_code||!row.sentence_en||!row.sentence_ko))errors.push({sheet:'Sentences',row:row.row,message:'Unit 코드와 영문·한글 문장이 필요해요'});
  }
  for (const row of exercises) {
    row.action=text(row.action||'UPSERT').toUpperCase();row.content_key=text(row.content_key);row.unit_code=text(row.unit_code);row.type=text(row.type);row.prompt=text(row.prompt);row.answer=text(row.answer);row.choices=text(row.choices);row.explanation_ko=text(row.explanation_ko);row.status=text(row.status||'draft');
    if(!row.content_key)errors.push({sheet:'Exercises',row:row.row,message:'content_key가 필요해요'});
    if(row.action!=='ARCHIVE'&&(!row.unit_code||!row.type||!row.prompt||!row.answer))errors.push({sheet:'Exercises',row:row.row,message:'Unit·문제 유형·질문·정답이 필요해요'});
    if(row.type==='multiple_choice'&&row.choices.split('|').filter(Boolean).length<2)errors.push({sheet:'Exercises',row:row.row,message:'객관식 choices는 |로 구분한 보기 2개 이상이어야 해요'});
  }
  for (const row of assets) {
    row.action=text(row.action||'UPSERT').toUpperCase();row.content_key=text(row.content_key);row.kind=text(row.kind);row.filename=text(row.filename);row.linked_content_key=text(row.linked_content_key);row.alt_or_transcript=text(row.alt_or_transcript);
    if(row.action!=='ARCHIVE'&&(!['image','audio'].includes(row.kind)||!row.filename||!row.linked_content_key))errors.push({sheet:'Assets',row:row.row,message:'kind(image/audio), filename, linked_content_key가 필요해요'});
  }

  return {
    payload: {
      vocabulary,
      sentences,
      exercises,
      assets,
    },
    errors,
    summary: { vocabulary: vocabulary.length, sentences: Math.max(0, workbook.Sentences.length - 1), exercises: Math.max(0, workbook.Exercises.length - 1), assets: Math.max(0, workbook.Assets.length - 1) },
  };
}
