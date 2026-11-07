// 초등 권장 어휘 기반 주제별 단어장 (단계: sprout=1~2학년, stem=3~4학년, tree=5~6학년)
// 각 단어: [영어, 뜻, 그림(이모지), 예문, 예문 뜻]

export const STAGES = [
  { id: 'sprout', name: '새싹 숲', grade: '1~2학년', icon: '🌱', color: '#7cc576' },
  { id: 'stem', name: '줄기 숲', grade: '3~4학년', icon: '🌿', color: '#3fa36b' },
  { id: 'tree', name: '나무 숲', grade: '5~6학년', icon: '🌳', color: '#0b4d2c' },
];

const RAW = [
  {
    id: 'animals', stage: 'sprout', name: '동물 마을', en: 'Animals', icon: '🐶',
    words: [
      ['dog', '개', '🐶', 'I have a dog.', '나는 개가 있어요.'],
      ['cat', '고양이', '🐱', 'The cat is sleeping.', '고양이가 자고 있어요.'],
      ['rabbit', '토끼', '🐰', 'The rabbit can jump.', '토끼는 점프할 수 있어요.'],
      ['bear', '곰', '🐻', 'The bear is big.', '곰은 커요.'],
      ['lion', '사자', '🦁', 'The lion is strong.', '사자는 힘이 세요.'],
      ['monkey', '원숭이', '🐵', 'The monkey likes bananas.', '원숭이는 바나나를 좋아해요.'],
      ['bird', '새', '🐦', 'A bird can fly.', '새는 날 수 있어요.'],
      ['fish', '물고기', '🐟', 'Fish live in water.', '물고기는 물에 살아요.'],
      ['pig', '돼지', '🐷', 'The pig is pink.', '돼지는 분홍색이에요.'],
      ['elephant', '코끼리', '🐘', 'The elephant has a long nose.', '코끼리는 코가 길어요.'],
    ],
  },
  {
    id: 'fruits', stage: 'sprout', name: '과일 마을', en: 'Fruits', icon: '🍎',
    words: [
      ['apple', '사과', '🍎', 'I like apples.', '나는 사과를 좋아해요.'],
      ['banana', '바나나', '🍌', 'The banana is yellow.', '바나나는 노란색이에요.'],
      ['grape', '포도', '🍇', 'Grapes are sweet.', '포도는 달아요.'],
      ['orange', '오렌지', '🍊', 'I want an orange.', '나는 오렌지를 원해요.'],
      ['strawberry', '딸기', '🍓', 'Strawberries are red.', '딸기는 빨개요.'],
      ['watermelon', '수박', '🍉', 'Watermelon is big.', '수박은 커요.'],
      ['peach', '복숭아', '🍑', 'This peach is soft.', '이 복숭아는 말랑해요.'],
      ['lemon', '레몬', '🍋', 'A lemon is sour.', '레몬은 시어요.'],
      ['pear', '배', '🍐', 'I eat a pear.', '나는 배를 먹어요.'],
      ['cherry', '체리', '🍒', 'Cherries are small.', '체리는 작아요.'],
    ],
  },
  {
    id: 'colors', stage: 'sprout', name: '색깔 마을', en: 'Colors', icon: '🎨',
    words: [
      ['red', '빨간색', '🟥', 'My bag is red.', '내 가방은 빨간색이에요.'],
      ['blue', '파란색', '🟦', 'The sky is blue.', '하늘은 파래요.'],
      ['yellow', '노란색', '🟨', 'The sun is yellow.', '해는 노래요.'],
      ['green', '초록색', '🟩', 'The tree is green.', '나무는 초록색이에요.'],
      ['black', '검은색', '⬛', 'My hair is black.', '내 머리카락은 검은색이에요.'],
      ['white', '흰색', '⬜', 'Snow is white.', '눈은 하얘요.'],
      ['pink', '분홍색', '🩷', 'I like pink.', '나는 분홍색을 좋아해요.'],
      ['purple', '보라색', '🟪', 'Grapes are purple.', '포도는 보라색이에요.'],
      ['brown', '갈색', '🟫', 'The bear is brown.', '곰은 갈색이에요.'],
      ['orange', '주황색', '🟧', 'The carrot is orange.', '당근은 주황색이에요.'],
    ],
  },
  {
    id: 'body', stage: 'sprout', name: '몸 마을', en: 'My Body', icon: '🙋',
    words: [
      ['head', '머리', '🙆', 'Touch your head.', '머리를 만져 보세요.'],
      ['eye', '눈', '👁️', 'I have two eyes.', '나는 눈이 두 개 있어요.'],
      ['ear', '귀', '👂', 'The rabbit has long ears.', '토끼는 귀가 길어요.'],
      ['nose', '코', '👃', 'My nose is small.', '내 코는 작아요.'],
      ['mouth', '입', '👄', 'Open your mouth.', '입을 벌려요.'],
      ['hand', '손', '✋', 'Raise your hand.', '손을 들어요.'],
      ['foot', '발', '🦶', 'My foot hurts.', '내 발이 아파요.'],
      ['leg', '다리', '🦵', 'A dog has four legs.', '개는 다리가 네 개예요.'],
      ['arm', '팔', '💪', 'My arm is strong.', '내 팔은 힘이 세요.'],
      ['tooth', '이(치아)', '🦷', 'Brush your teeth.', '이를 닦아요.'],
    ],
  },
  {
    id: 'school', stage: 'stem', name: '학교 마을', en: 'School', icon: '🏫',
    words: [
      ['book', '책', '📕', 'Open your book.', '책을 펴세요.'],
      ['pencil', '연필', '✏️', 'I need a pencil.', '나는 연필이 필요해요.'],
      ['eraser', '지우개', '🧽', 'Can I use your eraser?', '네 지우개 써도 될까?'],
      ['ruler', '자', '📏', 'This ruler is long.', '이 자는 길어요.'],
      ['bag', '가방', '🎒', 'My bag is heavy.', '내 가방은 무거워요.'],
      ['desk', '책상', '🪑', 'Put it on the desk.', '책상 위에 두세요.'],
      ['teacher', '선생님', '🧑‍🏫', 'My teacher is kind.', '우리 선생님은 친절해요.'],
      ['friend', '친구', '🧒', 'She is my friend.', '그녀는 내 친구예요.'],
      ['scissors', '가위', '✂️', 'Cut the paper with scissors.', '가위로 종이를 잘라요.'],
      ['clock', '시계', '⏰', 'Look at the clock.', '시계를 보세요.'],
    ],
  },
  {
    id: 'food', stage: 'stem', name: '음식 마을', en: 'Food', icon: '🍔',
    words: [
      ['bread', '빵', '🍞', 'I eat bread for breakfast.', '나는 아침으로 빵을 먹어요.'],
      ['milk', '우유', '🥛', 'Drink your milk.', '우유를 마셔요.'],
      ['rice', '밥(쌀)', '🍚', 'Koreans eat rice.', '한국 사람들은 밥을 먹어요.'],
      ['egg', '달걀', '🥚', 'I like fried eggs.', '나는 달걀 프라이를 좋아해요.'],
      ['pizza', '피자', '🍕', "Let's eat pizza!", '피자 먹자!'],
      ['hamburger', '햄버거', '🍔', 'I want a hamburger.', '나는 햄버거를 원해요.'],
      ['juice', '주스', '🧃', 'Orange juice, please.', '오렌지 주스 주세요.'],
      ['water', '물', '💧', 'Can I have some water?', '물 좀 마셔도 될까요?'],
      ['cookie', '쿠키', '🍪', 'This cookie is yummy.', '이 쿠키는 맛있어요.'],
      ['salad', '샐러드', '🥗', 'Salad is healthy.', '샐러드는 건강에 좋아요.'],
    ],
  },
  {
    id: 'weather', stage: 'stem', name: '날씨 마을', en: 'Weather & Seasons', icon: '⛅',
    words: [
      ['sunny', '맑은', '☀️', "It's sunny today.", '오늘은 맑아요.'],
      ['rainy', '비 오는', '🌧️', "It's rainy. Take an umbrella.", '비가 와요. 우산을 가져가요.'],
      ['snowy', '눈 오는', '🌨️', "It's snowy outside.", '밖에 눈이 와요.'],
      ['windy', '바람 부는', '🌬️', "It's windy today.", '오늘은 바람이 불어요.'],
      ['cloudy', '흐린', '☁️', "It's cloudy.", '날씨가 흐려요.'],
      ['hot', '더운', '🥵', "It's hot in summer.", '여름에는 더워요.'],
      ['cold', '추운', '🥶', "It's cold in winter.", '겨울에는 추워요.'],
      ['spring', '봄', '🌸', 'Flowers bloom in spring.', '봄에는 꽃이 펴요.'],
      ['summer', '여름', '🏖️', 'I swim in summer.', '나는 여름에 수영해요.'],
      ['winter', '겨울', '⛄', 'I make a snowman in winter.', '나는 겨울에 눈사람을 만들어요.'],
    ],
  },
  {
    id: 'feelings', stage: 'stem', name: '감정 마을', en: 'Feelings', icon: '😊',
    words: [
      ['happy', '행복한', '😊', "I'm happy.", '나는 행복해요.'],
      ['sad', '슬픈', '😢', "Why are you sad?", '왜 슬퍼요?'],
      ['angry', '화난', '😠', "Don't be angry.", '화내지 마세요.'],
      ['tired', '피곤한', '😪', "I'm tired.", '나는 피곤해요.'],
      ['hungry', '배고픈', '🤤', "I'm hungry. Let's eat.", '배고파요. 먹어요.'],
      ['scared', '무서운(겁먹은)', '😨', "I'm scared of the dark.", '나는 어둠이 무서워요.'],
      ['excited', '신이 난', '🤩', "I'm so excited!", '정말 신나요!'],
      ['sleepy', '졸린', '😴', "I'm sleepy.", '나는 졸려요.'],
      ['sick', '아픈', '🤒', "I'm sick today.", '나는 오늘 아파요.'],
      ['surprised', '놀란', '😲', 'She was surprised.', '그녀는 놀랐어요.'],
    ],
  },
  {
    id: 'jobs', stage: 'tree', name: '직업 마을', en: 'Jobs', icon: '👩‍⚕️',
    words: [
      ['doctor', '의사', '🧑‍⚕️', 'The doctor helps sick people.', '의사는 아픈 사람을 도와요.'],
      ['nurse', '간호사', '👩‍⚕️', 'My aunt is a nurse.', '우리 이모는 간호사예요.'],
      ['cook', '요리사', '🧑‍🍳', 'The cook makes food.', '요리사는 음식을 만들어요.'],
      ['farmer', '농부', '🧑‍🌾', 'The farmer grows rice.', '농부는 쌀을 길러요.'],
      ['police officer', '경찰관', '👮', 'The police officer keeps us safe.', '경찰관은 우리를 안전하게 지켜요.'],
      ['firefighter', '소방관', '🧑‍🚒', 'Firefighters are brave.', '소방관은 용감해요.'],
      ['pilot', '조종사', '🧑‍✈️', 'The pilot flies a plane.', '조종사는 비행기를 조종해요.'],
      ['singer', '가수', '🎤', 'I want to be a singer.', '나는 가수가 되고 싶어요.'],
      ['scientist', '과학자', '🧑‍🔬', 'The scientist studies stars.', '과학자는 별을 연구해요.'],
      ['soldier', '군인', '🪖', 'The soldier protects the country.', '군인은 나라를 지켜요.'],
    ],
  },
  {
    id: 'places', stage: 'tree', name: '장소 마을', en: 'Places', icon: '🏙️',
    words: [
      ['hospital', '병원', '🏥', 'The hospital is next to the bank.', '병원은 은행 옆에 있어요.'],
      ['library', '도서관', '📚', 'I read books at the library.', '나는 도서관에서 책을 읽어요.'],
      ['park', '공원', '🏞️', "Let's play in the park.", '공원에서 놀자.'],
      ['bank', '은행', '🏦', 'Where is the bank?', '은행은 어디예요?'],
      ['market', '시장(마트)', '🛒', 'Mom goes to the market.', '엄마는 시장에 가요.'],
      ['museum', '박물관', '🏛️', 'We visited the museum.', '우리는 박물관에 갔어요.'],
      ['restaurant', '식당', '🍽️', 'This restaurant is good.', '이 식당은 좋아요.'],
      ['post office', '우체국', '🏤', 'I send a letter at the post office.', '나는 우체국에서 편지를 보내요.'],
      ['zoo', '동물원', '🦒', 'We saw lions at the zoo.', '우리는 동물원에서 사자를 봤어요.'],
      ['airport', '공항', '🛫', 'We go to the airport.', '우리는 공항에 가요.'],
    ],
  },
  {
    id: 'transport', stage: 'tree', name: '교통 마을', en: 'Transportation', icon: '🚌',
    words: [
      ['bus', '버스', '🚌', 'I go to school by bus.', '나는 버스로 학교에 가요.'],
      ['car', '자동차', '🚗', 'Dad drives a car.', '아빠는 차를 운전해요.'],
      ['bike', '자전거', '🚲', 'I ride a bike.', '나는 자전거를 타요.'],
      ['train', '기차', '🚆', 'The train is fast.', '기차는 빨라요.'],
      ['subway', '지하철', '🚇', 'Take the subway.', '지하철을 타세요.'],
      ['airplane', '비행기', '✈️', 'The airplane is in the sky.', '비행기가 하늘에 있어요.'],
      ['ship', '배(선박)', '🚢', 'The ship is on the sea.', '배가 바다 위에 있어요.'],
      ['taxi', '택시', '🚕', "Let's take a taxi.", '택시를 타자.'],
      ['truck', '트럭', '🚚', 'The truck is very big.', '트럭은 아주 커요.'],
      ['helicopter', '헬리콥터', '🚁', 'A helicopter can fly.', '헬리콥터는 날 수 있어요.'],
    ],
  },
  {
    id: 'sports', stage: 'tree', name: '운동·취미 마을', en: 'Sports & Hobbies', icon: '⚽',
    words: [
      ['soccer', '축구', '⚽', "Let's play soccer.", '축구 하자.'],
      ['baseball', '야구', '⚾', 'I like baseball.', '나는 야구를 좋아해요.'],
      ['basketball', '농구', '🏀', 'He is good at basketball.', '그는 농구를 잘해요.'],
      ['swimming', '수영', '🏊', 'Swimming is fun.', '수영은 재미있어요.'],
      ['badminton', '배드민턴', '🏸', 'We play badminton.', '우리는 배드민턴을 쳐요.'],
      ['piano', '피아노', '🎹', 'I can play the piano.', '나는 피아노를 칠 수 있어요.'],
      ['drawing', '그림 그리기', '🖍️', 'My hobby is drawing.', '내 취미는 그림 그리기예요.'],
      ['dance', '춤추다', '💃', "Let's dance together.", '같이 춤추자.'],
      ['camping', '캠핑', '🏕️', 'We go camping in summer.', '우리는 여름에 캠핑을 가요.'],
      ['game', '게임', '🎮', 'This game is exciting.', '이 게임은 신나요.'],
    ],
  },
];

export const TOPICS = RAW.map((t) => ({
  ...t,
  words: t.words.map(([en, ko, pic, ex, exKo]) => ({
    id: `${t.id}:${en}`,
    en, ko, pic, ex, exKo, topic: t.id,
  })),
}));

export const ALL_WORDS = TOPICS.flatMap((t) => t.words);
export const WORD_BY_ID = Object.fromEntries(ALL_WORDS.map((w) => [w.id, w]));
export const topicById = (id) => TOPICS.find((t) => t.id === id);
