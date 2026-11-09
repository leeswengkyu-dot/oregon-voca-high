import { WORD_BY_ID } from './words.js';

const response = (wordId, say, sayKo, prompt, en, ko, after, grammarTarget = null) => ({
  wordId, say, sayKo, prompt, response: [en, ko], after, grammarTarget,
});

const picture = (wordId, say, sayKo, prompt, after) => ({ wordId, say, sayKo, prompt, after });

const DEFINITIONS = [
  {
    id: 'market-helper', stage: 'sprout', level: 1, name: '시장 장보기 도우미', icon: '🛒', bg: '#e8f6ec',
    npc: '👩', npcName: '엄마', location: '동네 시장', role: '장보기 도우미', goal: '목록에 적힌 식재료를 수량에 맞게 담기',
    words: ['fruits', 'vegetables', 'numbers'], intro: '엄마와 시장에 왔어요. 장보기 목록을 듣고 필요한 식재료를 골라요.',
    beats: [
      picture('fruits:apple', 'First, we need apples for a fruit salad.', '먼저 과일 샐러드에 넣을 사과가 필요해.', '사과를 장바구니에 담아요', 'Great! The apples are in the basket.'),
      picture('vegetables:carrot', 'Now find a carrot for our soup.', '이번에는 수프에 넣을 당근을 찾아 줘.', '당근을 골라요', 'Yes, that carrot looks fresh.'),
      picture('fruits:banana', 'Your brother wants a banana. Can you find one?', '동생이 바나나를 먹고 싶대. 하나 찾아볼까?', '바나나를 골라요', 'Perfect! He will like it.'),
      picture('numbers:two', 'We need two bags. Which number is two?', '봉투가 두 개 필요해. 둘은 어떤 숫자일까?', '숫자 2를 골라요', 'All done! We can check out now.'),
    ],
  },
  {
    id: 'zoo-weather-guide', stage: 'sprout', level: 1, name: '동물원 날씨 안내', icon: '🦁', bg: '#e8f6ec',
    npc: '🧑‍🌾', npcName: '동물원 선생님', location: '숲속 동물원', role: '꼬마 안내원', goal: '동물과 날씨·색깔을 확인해 관람 지도를 완성하기',
    words: ['animals', 'weather', 'colors'], intro: '동물원 선생님과 지도를 만들어요. 들은 설명과 맞는 그림을 찾아요.',
    beats: [
      picture('animals:lion', 'The strong animal with a mane is over there.', '갈기가 있는 힘센 동물이 저쪽에 있어.', '사자를 찾아요', 'Right! The lion is resting.'),
      picture('weather:sunny', 'The sky is bright today. What is the weather?', '오늘 하늘이 밝아. 날씨가 어떨까?', '화창한 날씨를 골라요', 'It is sunny. A good day for the zoo!'),
      picture('colors:green', 'The parrot is sitting by the green sign.', '앵무새가 초록색 표지판 옆에 앉아 있어.', '초록색을 골라요', 'Good! We found the green zone.'),
      picture('animals:bird', 'Listen! Which animal can fly and sing?', '들어 봐! 날고 노래할 수 있는 동물은 무엇일까?', '새를 찾아요', 'Excellent! Our zoo map is complete.'),
    ],
  },
  {
    id: 'family-picnic', stage: 'sprout', level: 1, name: '가족 소풍 준비', icon: '🧺', bg: '#e8f6ec',
    npc: '👧', npcName: '누나', location: '우리 집', role: '소풍 준비 대장', goal: '가족에게 필요한 음식과 옷을 챙기기',
    words: ['family', 'food', 'clothes'], intro: '가족 소풍을 떠나기 전이에요. 누나의 부탁을 듣고 준비물을 챙겨요.',
    beats: [
      picture('family:mother', 'Who made our picnic list?', '소풍 준비 목록을 만든 가족은 누구일까?', '엄마를 골라요', 'Yes, Mother made the list.'),
      picture('food:bread', 'We need something for sandwiches.', '샌드위치를 만들 음식이 필요해.', '빵을 골라요', 'Bread is ready for the sandwiches.'),
      picture('clothes:jacket', 'It may get cold. What should we wear?', '추워질 수도 있어. 무엇을 입어야 할까?', '재킷을 골라요', 'Good idea. Put the jacket in the bag.'),
      picture('food:water', 'We will be thirsty at the park.', '공원에서 목이 마를 거야.', '물을 골라요', 'Everything is ready. Let’s go!'),
    ],
  },
  {
    id: 'school-playtime', stage: 'sprout', level: 1, name: '학교 놀이 시간', icon: '🏫', bg: '#e8f6ec',
    npc: '👩‍🏫', npcName: '선생님', location: '교실과 운동장', role: '오늘의 반 도우미', goal: '수업 물건을 준비하고 놀이 뒤 정리하기',
    words: ['school', 'toys', 'actions'], intro: '오늘은 반 도우미예요. 선생님의 안내에 따라 수업과 놀이를 준비해요.',
    beats: [
      picture('school:book', 'Class is starting. Please bring this.', '수업이 시작해. 이것을 가져오렴.', '책을 골라요', 'Thank you. Open the book, please.'),
      picture('toys:ball', 'It is playtime. We need something to throw and catch.', '놀이 시간이야. 던지고 받을 수 있는 것이 필요해.', '공을 골라요', 'Great! Let’s play together.'),
      picture('actions:wash', 'Playtime is over. What should we do with our hands?', '놀이가 끝났어. 손을 어떻게 해야 할까?', '손 씻기를 골라요', 'Clean hands! Well done.'),
      picture('school:chair', 'Before we leave, please put this under the desk.', '가기 전에 이것을 책상 아래에 넣어 줘.', '의자를 골라요', 'The classroom is tidy. Mission complete!'),
    ],
  },
  {
    id: 'camp-care', stage: 'sprout', level: 1, name: '자연 캠프 마음 돌보기', icon: '🏕️', bg: '#e8f6ec',
    npc: '🧑‍⚕️', npcName: '캠프 선생님', location: '숲속 캠프', role: '안전 도우미', goal: '친구의 몸과 마음 상태를 살피고 날씨에 대처하기',
    words: ['body', 'feelings', 'nature'], intro: '숲속 캠프에서 친구를 도와줘요. 몸·마음·자연의 신호를 찾아요.',
    beats: [
      picture('body:head', 'Minho bumped this part of his body.', '민호가 이 신체 부위를 부딪혔어.', '머리를 골라요', 'Right. Let’s put a cold towel on his head.'),
      picture('feelings:happy', 'He feels better now. How does he look?', '이제 괜찮아졌대. 기분이 어때 보이니?', '행복한 표정을 골라요', 'Yes, he is happy again.'),
      picture('nature:sun', 'The sky is clear and this is shining.', '하늘이 맑고 이것이 빛나고 있어.', '태양을 골라요', 'The sun is bright. Wear a hat.'),
      picture('nature:rain', 'Drops are falling. What do you hear?', '물방울이 떨어져. 무엇이 들릴까?', '비를 골라요', 'It is rain. Let’s go inside the tent.'),
    ],
  },
  {
    id: 'school-morning', stage: 'stem', level: 2, name: '학교 가는 아침', icon: '⏰', bg: '#fff3d6',
    npc: '👦', npcName: 'Alex', location: '집에서 학교까지', role: '전학생 Alex의 아침 친구', goal: '시간에 맞춰 준비하고 첫 수업에 도착하기',
    words: ['schoolday', 'daily-routine', 'calendar', 'pronouns'], intro: '전학생 Alex와 함께 등교해요. 아침 일과를 순서대로 완성해요.',
    beats: [
      response('daily-routine:get up', 'It is seven o’clock. What do you do first?', '7시야. 가장 먼저 무엇을 하니?', '아침 일과를 시작하는 말을 골라요', 'I get up at seven.', '나는 7시에 일어나.', 'Good morning! Now we can get ready.'),
      response('daily-routine:get dressed', 'Your pajamas are still on. What is next?', '아직 잠옷을 입고 있네. 다음에는 무엇을 할까?', '다음 행동을 말해요', 'I get dressed in my room.', '나는 방에서 옷을 입어.', 'Great. You are ready to leave.'),
      response('calendar:today', 'Check the calendar. When is our English class?', '달력을 봐. 영어 수업은 언제니?', '오늘 일정을 확인해요', 'Today is our English class.', '오늘은 영어 수업이 있는 날이야.', 'Right. Let’s pack the English book.'),
      response('pronouns:we', 'The bus is here. Who is going together?', '버스가 왔어. 누가 함께 가니?', '함께 가는 사람을 말해요', 'We go to school together.', '우리는 함께 학교에 가.', 'Please sit next to me.'),
      response('schoolday:class', 'We arrived before nine. What starts now?', '9시 전에 도착했어. 이제 무엇이 시작하지?', '학교에서 이어질 일을 말해요', 'Our class starts at nine.', '우리 수업은 9시에 시작해.', 'We made it on time!'),
    ],
  },
  {
    id: 'town-directions', stage: 'stem', level: 2, name: '우리 동네 길 찾기', icon: '🗺️', bg: '#fff3d6',
    npc: '👮', npcName: '경찰관', location: '동네 중앙 거리', role: '길 안내를 받는 방문객', goal: '질문하고 교통수단을 선택해 도서관에 도착하기',
    words: ['places', 'transport', 'town', 'communication'], intro: '처음 온 동네에서 도서관을 찾아가요. 경찰관과 대화하며 길을 선택해요.',
    beats: [
      response('communication:ask', 'You look lost. How can I help you?', '길을 잃은 것 같구나. 무엇을 도와줄까?', '먼저 정중하게 질문해요', 'May I ask a question?', '질문 하나 해도 될까요?', 'Of course. What are you looking for?'),
      response('places:library', 'Where do you want to go?', '어디에 가고 싶니?', '목적지를 말해요', 'I want to go to the library.', '도서관에 가고 싶어요.', 'The library is across town.'),
      response('town:street', 'Walk along Pine Street. What can you see?', '파인 거리를 따라 걸어가렴. 무엇이 보이니?', '현재 위치를 확인해요', 'I can see the street sign.', '거리 표지판이 보여요.', 'Good. You are on the right street.'),
      response('transport:bus', 'It is a little far. How will you get there?', '조금 멀어. 무엇을 타고 갈래?', '알맞은 교통수단을 선택해요', 'I will take the bus.', '버스를 탈게요.', 'The number three bus goes there.'),
      response('communication:answer', 'The driver asks, “Library?” What will you say?', '기사님이 “도서관?”이라고 물으셔. 어떻게 답할까?', '목적지를 확인해요', 'Yes, please. Thank you.', '네, 부탁드려요. 감사합니다.', 'You arrived at the library!'),
    ],
  },
  {
    id: 'career-festival', stage: 'stem', level: 2, name: '진로 체험 축제', icon: '🎪', bg: '#fff3d6',
    npc: '👩‍🚒', npcName: 'Mina 소방관', location: '학교 진로 축제', role: '체험 부스 기자', goal: '직업과 장점을 알아보고 축제 활동을 소개하기',
    words: ['jobs', 'personality', 'leisure', 'sports'], intro: '학교 진로 축제에서 여러 직업을 만나 인터뷰해요.',
    beats: [
      response('jobs:doctor', 'Who helps people when they are sick?', '사람들이 아플 때 누가 도와줄까?', '알맞은 직업을 말해요', 'A doctor helps sick people.', '의사는 아픈 사람을 도와줘요.', 'Correct. Let’s visit the medical booth.'),
      response('personality:friendly', 'The guide smiles and welcomes everyone. How is she?', '안내자가 웃으며 모두를 반겨. 어떤 사람이니?', '사람의 장점을 표현해요', 'She is friendly.', '그녀는 다정해요.', 'Yes, she makes visitors feel comfortable.'),
      response('sports:soccer', 'The coach asks about your favorite activity.', '코치가 좋아하는 활동을 물어봐.', '좋아하는 운동을 말해요', 'I play soccer after school.', '나는 방과 후에 축구를 해요.', 'The sports booth is perfect for you.'),
      response('leisure:festival', 'What kind of event are we visiting today?', '오늘 우리가 방문한 행사는 무엇일까?', '행사의 이름을 말해요', 'We are at a school festival.', '우리는 학교 축제에 있어요.', 'Right. There are many booths to explore.'),
      response('jobs:firefighter', 'A guest teaches us how to use a fire extinguisher. Who is it?', '손님이 소화기 사용법을 알려 줘. 누구일까?', '마지막 직업을 알아맞혀요', 'She is a firefighter.', '그녀는 소방관이에요.', 'Great interview! Your report is complete.'),
    ],
  },
  {
    id: 'healthy-home', stage: 'stem', level: 2, name: '건강한 우리 집', icon: '🏠', bg: '#fff3d6',
    npc: '👨', npcName: '아빠', location: '우리 집', role: '가족 건강 도우미', goal: '아픈 동생을 돌보고 집을 안전하게 정리하기',
    words: ['home', 'health', 'chores', 'useful-actions'], intro: '동생이 감기에 걸렸어요. 아빠와 함께 돌보고 집안일도 마쳐요.',
    beats: [
      response('health:fever', 'Your brother feels hot. What is wrong?', '동생의 몸이 뜨거워. 어디가 아픈 걸까?', '증상을 말해요', 'He has a fever.', '동생은 열이 있어요.', 'Let’s check his temperature.'),
      response('home:kitchen', 'Where can we get a cup of water?', '물 한 컵은 어디에서 가져올 수 있을까?', '집 안의 장소를 말해요', 'I will get water from the kitchen.', '부엌에서 물을 가져올게요.', 'Thank you. Water will help.'),
      response('useful-actions:bring', 'The medicine is on the table. Can you help?', '약이 탁자 위에 있어. 도와줄래?', '필요한 행동을 말해요', 'I will bring the medicine.', '약을 가져올게요.', 'Please check the label first.'),
      response('chores:tidy', 'There are toys on the floor. What should we do?', '바닥에 장난감이 있어. 어떻게 해야 할까?', '안전하게 방을 정리해요', 'I will tidy the room.', '방을 정리할게요.', 'Now no one will trip.'),
      response('health:medicine', 'The doctor said it is time. What should he take?', '의사 선생님이 시간이 됐다고 하셨어. 무엇을 먹어야 할까?', '돌봄을 마무리해요', 'He should take his medicine.', '동생은 약을 먹어야 해요.', 'Well done. He can rest safely now.'),
    ],
  },
  {
    id: 'smart-shopping', stage: 'stem', level: 2, name: '친구와 알뜰 장보기', icon: '🛍️', bg: '#fff3d6',
    npc: '👧', npcName: 'Sora', location: '대형 마트', role: '예산을 관리하는 쇼핑 짝꿍', goal: '가격과 특징을 비교해 필요한 물건을 고르기',
    words: ['shopping', 'size-speed', 'describing', 'moving'], intro: '친구와 제한된 돈으로 준비물을 사요. 크기·가격·상태를 비교해요.',
    beats: [
      response('shopping:price', 'We have ten dollars. What should we check first?', '10달러가 있어. 먼저 무엇을 확인해야 할까?', '쇼핑 전에 확인할 것을 말해요', 'Let’s check the price.', '가격을 확인하자.', 'Good. We must stay within our budget.'),
      response('size-speed:big', 'We need a box for many art supplies.', '미술 준비물을 많이 담을 상자가 필요해.', '필요한 크기를 말해요', 'We need a big box.', '큰 상자가 필요해.', 'This one has enough space.'),
      response('describing:clean', 'This bottle looks dirty. Which one should we choose?', '이 물병은 더러워 보여. 어떤 것을 골라야 할까?', '물건의 상태를 말해요', 'Let’s choose the clean bottle.', '깨끗한 물병을 고르자.', 'Good choice. It is ready to use.'),
      response('moving:ride', 'The bags are heavy. How can we get home?', '가방이 무거워. 어떻게 집에 갈까?', '이동 방법을 선택해요', 'We can ride our bikes home.', '자전거를 타고 집에 갈 수 있어.', 'Put the bags in the baskets.'),
      response('shopping:money', 'We have some change left. What should we do?', '거스름돈이 남았어. 어떻게 해야 할까?', '남은 돈을 관리해요', 'I will save the money.', '남은 돈을 저축할게.', 'Smart shopping! We finished the mission.'),
    ],
  },
  {
    id: 'book-club-meeting', stage: 'tree', level: 3, name: '독서토론 해결 회의', icon: '📚', bg: '#f3ecfb',
    npc: '👩‍🏫', npcName: '토론 선생님', location: '학교 도서관', role: '독서 모임 진행자', goal: '책을 비교하고 근거를 들어 다음 달 도서를 결정하기',
    words: ['thinking', 'learning-skills', 'ideas', 'reading-writing', 'connectors'], intro: '독서 모임에서 의견이 갈렸어요. 질문·비교·이유 설명으로 결론을 만들어요.',
    beats: [
      response('reading-writing:title', 'Let’s begin. Which book are we discussing?', '토론을 시작하자. 어떤 책을 이야기하고 있니?', '책을 정확히 소개해요', 'The title is The Secret Garden.', '제목은 「비밀의 화원」이에요.', 'Thank you. Everyone knows the book now.', '주어와 be동사'),
      response('thinking:think', 'What is your first opinion of the book?', '이 책에 대한 첫 의견은 무엇이니?', '자신의 생각을 말해요', 'I think this book is interesting.', '나는 이 책이 흥미롭다고 생각해요.', 'That is a clear opinion.', '생각 동사 think'),
      response('learning-skills:compare', 'Another team chose a science book. What should we do?', '다른 팀은 과학책을 골랐어. 어떻게 검토할까?', '두 선택을 비교해요', 'Let’s compare the two books.', '두 책을 비교해 봅시다.', 'Good. We will examine both choices.', '제안문 Let’s'),
      response('ideas:reason', 'Why do you prefer this book?', '왜 이 책을 더 좋아하니?', '이유를 제시해요', 'The reason is that the characters change.', '이유는 등장인물이 변화하기 때문이에요.', 'That evidence supports your opinion.', '이유 표현 that절'),
      response('connectors:because', 'Connect your opinion and reason in one sentence.', '의견과 이유를 한 문장으로 연결해 보렴.', 'because로 문장을 연결해요', 'I recommend it because the story is meaningful.', '이야기가 의미 있어서 이 책을 추천해요.', 'Excellent use of because.', '접속사 because'),
      response('ideas:result', 'The votes are counted. How will you close the meeting?', '투표가 끝났어. 회의를 어떻게 마칠까?', '결과를 발표해요', 'The result is that we will read this book.', '결과는 우리가 이 책을 읽기로 한 것이에요.', 'Decision made! The meeting is complete.', '결과를 나타내는 명사절'),
    ],
  },
  {
    id: 'eco-science-project', stage: 'tree', level: 3, name: '과학 환경 프로젝트', icon: '🌍', bg: '#f3ecfb',
    npc: '🧑‍🔬', npcName: '과학 선생님', location: '학교 과학실과 운동장', role: '환경 조사팀장', goal: '오염 원인을 관찰하고 해결 계획을 발표하기',
    words: ['projects', 'science-world', 'environment', 'change', 'observing'], intro: '학교 주변 쓰레기 문제를 과학적으로 조사하고 해결책을 세워요.',
    beats: [
      response('observing:observe', 'Before changing anything, what should the team do?', '무엇을 바꾸기 전에 조사팀이 먼저 할 일은 무엇일까?', '현장을 조사해요', 'We should observe the schoolyard first.', '먼저 운동장을 관찰해야 해요.', 'Good scientists begin with observation.', '조동사 should'),
      response('environment:pollution', 'Smoke and trash are harming the area. What is this problem?', '연기와 쓰레기가 주변을 해치고 있어. 이 문제는 무엇일까?', '환경 문제를 정의해요', 'This pollution harms plants and animals.', '이 오염은 식물과 동물을 해쳐요.', 'Now the problem is clear.', '현재시제 일반동사'),
      response('science-world:energy', 'The lights stay on in empty rooms. What are we wasting?', '빈 교실에도 불이 켜져 있어. 무엇을 낭비하고 있니?', '낭비되는 자원을 찾아요', 'We are wasting energy.', '우리는 에너지를 낭비하고 있어요.', 'That is important evidence.', '현재진행형'),
      response('change:reduce', 'What action can lower plastic waste?', '플라스틱 쓰레기를 줄일 행동은 무엇일까?', '해결 행동을 제안해요', 'We can reduce plastic waste.', '우리는 플라스틱 쓰레기를 줄일 수 있어요.', 'A reusable bottle can help.', '조동사 can'),
      response('projects:discuss', 'The team has three ideas. What should happen next?', '팀에 세 가지 생각이 있어. 다음에는 무엇을 해야 할까?', '팀의 의견을 모아요', 'We should discuss our ideas together.', '우리의 생각을 함께 토론해야 해요.', 'Discussion will improve the plan.', 'should + 동사원형'),
      response('projects:achieve', 'How will you end the presentation?', '발표를 어떻게 마칠까?', '공동 목표를 선언해요', 'We will work together to achieve our goal.', '목표를 이루기 위해 함께 노력할 거예요.', 'The principal approves your project!', 'to부정사 목적'),
    ],
  },
  {
    id: 'world-culture-trip', stage: 'tree', level: 3, name: '세계 문화 여행', icon: '✈️', bg: '#f3ecfb',
    npc: '🧑‍✈️', npcName: '여행 안내자', location: '공항과 세계 문화 마을', role: '학생 여행팀 길잡이', goal: '서류·지도·문화 정보를 확인해 목적지에 도착하기',
    words: ['travel-world', 'society', 'landscape', 'prepositions', 'frequency'], intro: '학생 여행팀이 공항에 도착했어요. 문제를 해결하며 문화 마을로 이동해요.',
    beats: [
      response('travel-world:passport', 'The officer needs one document before you board.', '탑승 전에 직원이 서류 하나를 확인해야 한대.', '필요한 여행 서류를 제시해요', 'Here is my passport.', '여기 제 여권이 있습니다.', 'Thank you. You may continue.', '소유격 my'),
      response('travel-world:map', 'We landed, but the bus stop is hard to find.', '도착했지만 버스 정류장을 찾기 어려워.', '길을 찾을 도구를 선택해요', 'Let’s look at the map.', '지도를 봅시다.', 'The map shows the station nearby.', '제안문 Let’s'),
      response('prepositions:at', 'Where will the group meet the guide?', '어디에서 안내자를 만날까?', '정확한 만남 장소를 말해요', 'We will meet at the station.', '우리는 역에서 만날 거예요.', 'The guide will wait by the clock.', '장소 전치사 at'),
      response('society:culture', 'The guide asks what you want to learn about.', '안내자가 무엇을 배우고 싶은지 물어봐.', '여행의 학습 목표를 말해요', 'I want to learn about the local culture.', '현지 문화에 대해 배우고 싶어요.', 'We will visit a traditional village.', 'want to부정사'),
      response('landscape:island', 'Tomorrow we can visit land surrounded by water.', '내일은 물로 둘러싸인 땅을 방문할 수 있어.', '다음 목적지를 확인해요', 'We are going to visit an island.', '우리는 섬을 방문할 예정이에요.', 'Pack a hat for the boat trip.', 'be going to 미래'),
      response('frequency:usually', 'How often do people hold this festival?', '사람들은 이 축제를 얼마나 자주 열까?', '빈도를 포함해 설명해요', 'They usually hold it in spring.', '그들은 보통 봄에 축제를 열어요.', 'You completed the culture tour!', '빈도부사 위치'),
    ],
  },
  {
    id: 'digital-presentation', stage: 'tree', level: 3, name: '디지털 발표 준비', icon: '💻', bg: '#f3ecfb',
    npc: '🤖', npcName: '미디어 로봇', location: '학교 미디어실', role: '발표 자료 편집자', goal: '자료를 비교·편집·업로드해 발표를 완성하기',
    words: ['digital-actions', 'technology', 'abstract-descriptions', 'comparing', 'manner'], intro: '발표가 한 시간 남았어요. 미디어 로봇과 파일 문제를 해결해요.',
    beats: [
      response('technology:website', 'The facts must come from a trusted online source.', '사실 정보는 믿을 수 있는 온라인 출처에서 찾아야 해.', '자료를 찾을 곳을 선택해요', 'I will check the science website.', '과학 웹사이트를 확인할게요.', 'The source lists its author and date.', '미래 의지 will'),
      response('comparing:better', 'Two charts show the same data. Which should we use?', '두 차트가 같은 자료를 보여 줘. 어떤 것을 써야 할까?', '더 적절한 자료를 비교해요', 'This chart is better because it is clear.', '이 차트가 명확해서 더 좋아요.', 'Good comparison and reason.', '비교급 + because'),
      response('abstract-descriptions:main', 'The slide has too much text. What should remain?', '슬라이드에 글이 너무 많아. 무엇을 남겨야 할까?', '핵심 내용을 선택해요', 'We should keep the main idea.', '핵심 생각을 남겨야 해요.', 'The slide is easier to understand now.', 'should + 동사원형'),
      response('manner:carefully', 'Before sending the file, how should we review it?', '파일을 보내기 전에 어떻게 검토해야 할까?', '검토 방법을 말해요', 'We should check it carefully.', '우리는 그것을 주의 깊게 확인해야 해요.', 'No spelling errors found.', '방법부사 carefully'),
      response('digital-actions:upload', 'The teacher’s folder is open. What is next?', '선생님 폴더가 열렸어. 다음에는 무엇을 할까?', '완성 파일을 제출해요', 'I will upload the presentation.', '발표 자료를 업로드할게요.', 'Upload complete.', 'will + 동사원형'),
      response('digital-actions:print', 'We also need one paper copy for the judges.', '심사위원용 종이 자료도 한 부 필요해.', '마지막 준비를 마쳐요', 'Let’s print one copy.', '한 부 인쇄합시다.', 'Everything is ready for the presentation!', '제안문 Let’s'),
    ],
  },
  {
    id: 'friendship-planning', stage: 'tree', level: 3, name: '친구 관계와 진로 계획', icon: '🤝', bg: '#f3ecfb',
    npc: '👩‍🏫', npcName: '상담 선생님', location: '학교 상담실', role: '친구를 돕는 또래 상담자', goal: '친구의 감정을 이해하고 현실적인 계획을 함께 세우기',
    words: ['relationships', 'experiences', 'inner-feelings', 'judgments', 'world-descriptions'], intro: '친구가 발표와 진로 때문에 고민해요. 감정을 듣고 선택 가능한 계획을 세워요.',
    beats: [
      response('inner-feelings:worried', 'Jin keeps looking at his notes and cannot relax.', '진이가 계속 노트를 보며 긴장을 풀지 못해.', '친구의 감정을 파악해요', 'He seems worried about the presentation.', '그는 발표를 걱정하는 것 같아요.', 'Naming the feeling helps us listen.', 'seem + 형용사'),
      response('experiences:feel', 'How can you show that you understand him?', '친구를 이해한다는 것을 어떻게 보여 줄까?', '공감하는 말을 건네요', 'I understand how you feel.', '네가 어떻게 느끼는지 이해해.', 'Jin is ready to talk now.', '간접의문문 how'),
      response('relationships:suggest', 'He does not know where to begin practicing.', '어디서부터 연습해야 할지 모르겠대.', '구체적인 방법을 제안해요', 'I suggest practicing one part at a time.', '한 번에 한 부분씩 연습하자고 제안해.', 'That makes the task feel smaller.', 'suggest + 동명사'),
      response('judgments:important', 'Why should he practice the opening first?', '왜 도입부를 먼저 연습해야 할까?', '우선순위의 이유를 설명해요', 'A clear opening is important for the audience.', '명확한 도입은 청중에게 중요해요.', 'Good reasoning. The audience will follow easily.', '형용사 + 전치사 for'),
      response('world-descriptions:natural', 'He wants to sound less like he is reading.', '친구는 글을 읽는 것처럼 들리지 않게 하고 싶대.', '말하기 방법을 조언해요', 'Speak slowly and use a natural voice.', '천천히 자연스러운 목소리로 말해.', 'He sounds more confident already.', '명령문 + and'),
      response('relationships:promise', 'Jin asks if you can watch his practice tomorrow.', '진이가 내일 연습을 봐줄 수 있는지 물어봐.', '함께할 약속을 정해요', 'I promise to help you tomorrow.', '내일 너를 도와주겠다고 약속할게.', 'Jin has a plan and feels ready!', 'promise + to부정사'),
    ],
  },
];

function rotateChoices(correct, distractors, answer) {
  const choices = distractors.slice(0, 3);
  choices.splice(answer, 0, correct);
  return choices;
}

function buildScene(definition) {
  const type = definition.stage === 'sprout' ? 'pick' : definition.stage === 'stem' ? 'reply' : 'decision';
  const steps = definition.beats.map((beat, index) => {
    const distractorBeats = Array.from({ length: definition.beats.length - 1 }, (_, offset) => definition.beats[(index + offset + 1) % definition.beats.length]).slice(0, 3);
    const answer = index % 4;
    if (type === 'pick') {
      const correctWord = WORD_BY_ID[beat.wordId];
      const distractors = distractorBeats.map((item) => WORD_BY_ID[item.wordId]);
      if (!correctWord || distractors.some((item) => !item)) throw new Error(`Unknown scenario word: ${beat.wordId}`);
      return { ...beat, type, answer, choices: rotateChoices([correctWord.pic, correctWord.en, correctWord.ko], distractors.map((word) => [word.pic, word.en, word.ko]), answer) };
    }
    return { ...beat, type, answer, choices: rotateChoices(beat.response, distractorBeats.map((item) => item.response), answer) };
  });
  const { beats, ...scene } = definition;
  return { ...scene, steps };
}

export const SCENES = DEFINITIONS.map(buildScene);
export const sceneById = (id) => SCENES.find((scene) => scene.id === id);
export const sceneForUnit = (unitId) => SCENES.find((scene) => scene.words.includes(unitId));
