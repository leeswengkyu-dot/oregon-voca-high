import readXlsxFile from 'read-excel-file/browser';

const REQUIRED_SHEETS = ['README', 'Vocabulary', 'Sentences', 'Exercises', 'Assets'];
const VOCAB_HEADERS = ['action', 'content_key', 'level', 'unit_code', 'word', 'meaning_ko', 'part_of_speech', 'difficulty', 'example_en', 'example_ko', 'image_filename', 'audio_filename', 'status'];

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
    row.image_filename = text(row.image_filename);
    row.audio_filename = text(row.audio_filename);
    row.status = text(row.status || 'draft').toLowerCase();
    if (!['UPSERT', 'ARCHIVE'].includes(row.action)) errors.push({ sheet: 'Vocabulary', row: row.row, message: 'action은 UPSERT 또는 ARCHIVE여야 해요' });
    if (!row.content_key) errors.push({ sheet: 'Vocabulary', row: row.row, message: 'content_key가 필요해요' });
    if (seen.has(row.content_key)) errors.push({ sheet: 'Vocabulary', row: row.row, message: `content_key 중복: ${row.content_key} (먼저 나온 행 ${seen.get(row.content_key)})` });
    else seen.set(row.content_key, row.row);
    if (row.action !== 'ARCHIVE') {
      if (!['sprout', 'stem', 'tree'].includes(row.level)) errors.push({ sheet: 'Vocabulary', row: row.row, message: 'level은 sprout, stem, tree 중 하나여야 해요' });
      for (const [key, label] of [['unit_code', 'Unit 코드'], ['word', '영단어'], ['meaning_ko', '뜻'], ['example_en', '영어 예문'], ['example_ko', '예문 해석']]) {
        if (!row[key]) errors.push({ sheet: 'Vocabulary', row: row.row, message: `${label}이 필요해요` });
      }
      if (!Number.isInteger(row.difficulty) || row.difficulty < 1 || row.difficulty > 5) errors.push({ sheet: 'Vocabulary', row: row.row, message: 'difficulty는 1~5 정수여야 해요' });
    }
  }

  return {
    payload: {
      vocabulary,
      sentences: objects(workbook.Sentences, 'Sentences'),
      exercises: objects(workbook.Exercises, 'Exercises'),
      assets: objects(workbook.Assets, 'Assets'),
    },
    errors,
    summary: { vocabulary: vocabulary.length, sentences: Math.max(0, workbook.Sentences.length - 1), exercises: Math.max(0, workbook.Exercises.length - 1), assets: Math.max(0, workbook.Assets.length - 1) },
  };
}
