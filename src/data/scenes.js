// 상황별 시뮬레이션: 각 단계에서 상대방 말을 듣고 알맞은 그림이나 대답을 고릅니다.
// type 'pick'  : 그림 카드 고르기 (choices: [pic, en, ko])
// type 'reply' : 알맞은 영어 대답 고르기 (choices: [en, ko])
// answer: 정답 인덱스, after: 정답 뒤 상대방 반응

export const SCENES = [
  {
    id: 'fastfood', name: '패스트푸드점 주문하기', icon: '🍔', bg: '#fff3d6',
    npc: '🧑‍🍳', npcName: '점원', stage: 'stem', words: ['food'],
    intro: '배가 고파요! 햄버거 가게에서 영어로 주문해 볼까요?',
    steps: [
      {
        type: 'reply', say: 'Hello! What would you like?', sayKo: '안녕하세요! 무엇을 드릴까요?',
        prompt: '알맞은 대답을 골라요',
        choices: [['A hamburger, please.', '햄버거 하나 주세요.'], ['I am ten years old.', '나는 10살이에요.'], ['Goodbye!', '잘 가요!']],
        answer: 0, after: 'Sure! One hamburger.',
      },
      {
        type: 'pick', say: 'What would you like to drink?', sayKo: '마실 것은 뭘로 하시겠어요?',
        prompt: '"주스"를 주문해요',
        choices: [['🍕', 'pizza', '피자'], ['🧃', 'juice', '주스'], ['🍪', 'cookie', '쿠키'], ['🥗', 'salad', '샐러드']],
        answer: 1, after: 'Okay, one juice.',
      },
      {
        type: 'pick', say: 'Anything else? We have cookies today!', sayKo: '더 필요한 건요? 오늘 쿠키가 있어요!',
        prompt: '"쿠키"도 주문해요',
        choices: [['🍪', 'cookie', '쿠키'], ['🥛', 'milk', '우유'], ['🍚', 'rice', '밥'], ['🥚', 'egg', '달걀']],
        answer: 0, after: 'Great choice!',
      },
      {
        type: 'reply', say: 'For here or to go?', sayKo: '여기서 드세요, 가져가세요?',
        prompt: '여기서 먹고 갈래요',
        choices: [['To go, please.', '가져갈게요.'], ['For here, please.', '여기서 먹을게요.'], ['I like blue.', '나는 파란색이 좋아요.']],
        answer: 1, after: 'Here you are. Enjoy your meal!',
      },
      {
        type: 'reply', say: 'Enjoy your meal!', sayKo: '맛있게 드세요!',
        prompt: '고맙다고 말해요',
        choices: [['Thank you!', '고맙습니다!'], ["I'm sorry.", '미안해요.'], ['Nice to meet you.', '만나서 반가워요.']],
        answer: 0, after: "You're welcome!",
      },
    ],
  },
  {
    id: 'market', name: '마트에서 장보기', icon: '🛒', bg: '#e8f6ec',
    npc: '👩', npcName: '엄마', stage: 'sprout', words: ['fruits'],
    intro: '엄마의 쇼핑 목록을 듣고 장바구니에 과일을 담아요!',
    steps: [
      {
        type: 'pick', say: 'We need apples. Can you find the apples?', sayKo: '사과가 필요해. 사과 찾아 줄래?',
        prompt: '사과를 담아요',
        choices: [['🍌', 'banana', '바나나'], ['🍎', 'apple', '사과'], ['🍇', 'grape', '포도'], ['🍋', 'lemon', '레몬']],
        answer: 1, after: 'Good job! Apples in the basket.',
      },
      {
        type: 'pick', say: 'Now, bananas, please.', sayKo: '이번엔 바나나 부탁해.',
        prompt: '바나나를 담아요',
        choices: [['🍉', 'watermelon', '수박'], ['🍑', 'peach', '복숭아'], ['🍌', 'banana', '바나나'], ['🍒', 'cherry', '체리']],
        answer: 2, after: 'Yummy bananas!',
      },
      {
        type: 'pick', say: 'Your sister likes red fruit. Strawberries!', sayKo: '동생은 빨간 과일을 좋아해. 딸기!',
        prompt: '딸기를 담아요',
        choices: [['🍓', 'strawberry', '딸기'], ['🍐', 'pear', '배'], ['🍊', 'orange', '오렌지'], ['🍋', 'lemon', '레몬']],
        answer: 0, after: 'She will love them!',
      },
      {
        type: 'pick', say: "It's hot. Let's buy a big watermelon!", sayKo: '덥다. 큰 수박을 사자!',
        prompt: '수박을 담아요',
        choices: [['🍇', 'grape', '포도'], ['🍉', 'watermelon', '수박'], ['🍎', 'apple', '사과'], ['🍑', 'peach', '복숭아']],
        answer: 1, after: 'Wow, so big!',
      },
      {
        type: 'reply', say: 'Thank you for helping me!', sayKo: '도와줘서 고마워!',
        prompt: '천만에요라고 말해요',
        choices: [["You're welcome!", '천만에요!'], ['I am hungry.', '배고파요.'], ['Good night.', '잘 자요.']],
        answer: 0, after: "You're the best helper!",
      },
    ],
  },
  {
    id: 'hospital', name: '병원에 가요', icon: '🏥', bg: '#e9f1fb',
    npc: '🧑‍⚕️', npcName: '의사 선생님', stage: 'sprout', words: ['body', 'feelings'],
    intro: '몸이 아파서 병원에 왔어요. 어디가 아픈지 영어로 말해요!',
    steps: [
      {
        type: 'reply', say: 'Hello. How are you feeling?', sayKo: '안녕. 몸은 좀 어떠니?',
        prompt: '아프다고 말해요',
        choices: [["I'm sick.", '저 아파요.'], ["I'm happy!", '저는 행복해요!'], ["I'm hungry.", '배고파요.']],
        answer: 0, after: "Oh, I'm sorry to hear that.",
      },
      {
        type: 'pick', say: 'Where does it hurt?', sayKo: '어디가 아프니?',
        prompt: '"머리"가 아파요',
        choices: [['✋', 'hand', '손'], ['🦶', 'foot', '발'], ['🙆', 'head', '머리'], ['👂', 'ear', '귀']],
        answer: 2, after: 'Your head hurts. Let me check.',
      },
      {
        type: 'pick', say: 'Open your mouth, please. Say "Ah"!', sayKo: '입을 벌려 볼래? "아" 해 봐!',
        prompt: '입을 찾아요',
        choices: [['👄', 'mouth', '입'], ['👃', 'nose', '코'], ['👁️', 'eye', '눈'], ['🦵', 'leg', '다리']],
        answer: 0, after: 'Good. Your throat is a little red.',
      },
      {
        type: 'reply', say: 'You have a cold. Take this medicine and rest.', sayKo: '감기에 걸렸구나. 이 약 먹고 쉬어.',
        prompt: '고맙다고 말해요',
        choices: [['Thank you, doctor.', '고맙습니다, 선생님.'], ["Let's play soccer!", '축구 하자!'], ['I like pizza.', '피자 좋아해요.']],
        answer: 0, after: 'Get well soon!',
      },
    ],
  },
  {
    id: 'directions', name: '길 찾기 대모험', icon: '🗺️', bg: '#f3ecfb',
    npc: '👮', npcName: '경찰관', stage: 'tree', words: ['places', 'transport'],
    intro: '처음 와 본 동네에서 길을 잃었어요. 경찰관에게 길을 물어봐요!',
    steps: [
      {
        type: 'reply', say: 'Hi there! Can I help you?', sayKo: '안녕! 도와줄까?',
        prompt: '도서관이 어디인지 물어봐요',
        choices: [['Where is the library?', '도서관이 어디예요?'], ['What time is it?', '몇 시예요?'], ['I like dogs.', '나는 개를 좋아해요.']],
        answer: 0, after: 'The library? Go straight and turn left.',
      },
      {
        type: 'pick', say: 'Go straight and turn left.', sayKo: '쭉 가다가 왼쪽으로 돌아.',
        prompt: '"왼쪽으로 돌아요"를 골라요',
        choices: [['⬆️', 'go straight', '직진'], ['⬅️', 'turn left', '왼쪽으로'], ['➡️', 'turn right', '오른쪽으로'], ['🔄', 'go back', '되돌아가기']],
        answer: 1, after: "That's right!",
      },
      {
        type: 'pick', say: 'The library is next to the hospital.', sayKo: '도서관은 병원 옆에 있어.',
        prompt: '도서관 옆 건물은? (병원)',
        choices: [['🏦', 'bank', '은행'], ['🏥', 'hospital', '병원'], ['🏤', 'post office', '우체국'], ['🦒', 'zoo', '동물원']],
        answer: 1, after: 'Yes, next to the hospital.',
      },
      {
        type: 'pick', say: "It's far. You can take the bus!", sayKo: '좀 멀어. 버스를 타도 돼!',
        prompt: '버스를 타요',
        choices: [['🚲', 'bike', '자전거'], ['🚕', 'taxi', '택시'], ['🚌', 'bus', '버스'], ['🚢', 'ship', '배']],
        answer: 2, after: 'The bus stop is right there.',
      },
      {
        type: 'reply', say: 'Have a nice day!', sayKo: '좋은 하루 보내!',
        prompt: '인사해요',
        choices: [['You too. Thank you!', '아저씨도요. 고맙습니다!'], ["I'm scared.", '무서워요.'], ['It is rainy.', '비가 와요.']],
        answer: 0, after: 'Bye-bye!',
      },
    ],
  },
];

export const sceneById = (id) => SCENES.find((s) => s.id === id);
