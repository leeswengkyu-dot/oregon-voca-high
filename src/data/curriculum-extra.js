// 수업용 콘텐츠 초안. 각 행은 단어|뜻|예문|예문 해석. N=구체명사, A=형용사, V=동사, X=개별 문장.
export const EXTRA = [];
const add=(id,stage,name,en,icon,kind,rows)=>EXTRA.push({id,stage,name,en,icon,kind,rows:rows.trim().split('\n').map(s=>s.trim()).filter(Boolean)});
add('jobs','stem','직업 마을','Jobs','👩‍⚕️','N',`
doctor|의사
nurse|간호사
cook|요리사
farmer|농부
police officer|경찰관
firefighter|소방관
pilot|조종사
singer|가수
scientist|과학자
soldier|군인
dentist|치과 의사
artist|예술가
driver|운전기사
baker|제빵사
actor|배우
actress|여자 배우
writer|작가
worker|일하는 사람
vet|수의사
coach|코치
`);
add('places','stem','장소 마을','Places','🏙️','N',`
hospital|병원
library|도서관
park|공원
bank|은행
market|시장
museum|박물관
restaurant|식당
post office|우체국
zoo|동물원
airport|공항
station|역
supermarket|슈퍼마켓
bakery|빵집
pharmacy|약국
playground|놀이터
pool|수영장
cinema|영화관
hotel|호텔
cafe|카페
bookstore|서점
`);
add('transport','stem','교통 마을','Transportation','🚌','N',`
bus|버스
bike|자전거
subway|지하철
airplane|비행기
ship|배
 taxi|택시
helicopter|헬리콥터
boat|작은 배
ferry|나룻배
van|승합차
ambulance|구급차
motorcycle|오토바이
rocket|로켓
wheel|바퀴
ticket|표
helmet|안전모
seat|좌석
traffic light|신호등
crosswalk|횡단보도
bus stop|버스 정류장
`);
add('sports','stem','운동·취미 마을','Sports & Hobbies','⚽','X',`
soccer|축구|I play soccer after school.|나는 방과 후에 축구를 해요.
baseball|야구|We play baseball on Sunday.|우리는 일요일에 야구를 해요.
basketball|농구|I like basketball.|나는 농구를 좋아해요.
swimming|수영|Swimming is fun.|수영은 재미있어요.
badminton|배드민턴|We play badminton.|우리는 배드민턴을 쳐요.
piano|피아노|I can play the piano.|나는 피아노를 칠 수 있어요.
drawing|그림 그리기|My hobby is drawing.|내 취미는 그림 그리기예요.
camping|캠핑|We go camping in summer.|우리는 여름에 캠핑을 가요.
tennis|테니스|My sister plays tennis.|내 여자 형제는 테니스를 쳐요.
volleyball|배구|We play volleyball together.|우리는 함께 배구를 해요.
table tennis|탁구|I play table tennis with Dad.|나는 아빠와 탁구를 쳐요.
skating|스케이트 타기|I like skating.|나는 스케이트 타기를 좋아해요.
skiing|스키 타기|We go skiing in winter.|우리는 겨울에 스키를 타러 가요.
hiking|하이킹|I enjoy hiking.|나는 하이킹을 즐겨요.
fishing|낚시|We go fishing on Saturday.|우리는 토요일에 낚시하러 가요.
guitar|기타|I play the guitar.|나는 기타를 연주해요.
violin|바이올린|She plays the violin.|그녀는 바이올린을 연주해요.
flute|플루트|He plays the flute.|그는 플루트를 연주해요.
chess|체스|I play chess with my friend.|나는 친구와 체스를 둬요.
hobby|취미|What is your hobby?|네 취미는 무엇이니?
`);
add('home','stem','우리 집 마을','At Home','🛋️','N',`
house|집
apartment|아파트
room|방
bedroom|침실
bathroom|욕실
kitchen|부엌
living room|거실
bed|침대
sofa|소파
table|탁자
lamp|등
mirror|거울
refrigerator|냉장고
television|텔레비전
sink|세면대
bathtub|욕조
towel|수건
blanket|담요
pillow|베개
closet|옷장
`);
add('town','stem','우리 동네 마을','My Town','🏘️','N',`
street|거리
road|도로
bridge|다리
building|건물
village|마을
city|도시
town|작은 도시
farm|농장
garden|정원
yard|마당
fence|울타리
gate|대문
roof|지붕
wall|벽
floor|바닥
stairs|계단
elevator|엘리베이터
bench|긴 의자
fountain|분수
statue|조각상
`);
add('schoolday','stem','학교생활 마을','School Life','📚','N',`
class|수업|Our class starts at nine.|우리 수업은 아홉 시에 시작해요.
lesson|수업 내용|This lesson is fun.|이 수업 내용은 재미있어요.
subject|과목|What is your favorite subject?|가장 좋아하는 과목은 무엇이니?
English|영어|I study English every day.|나는 매일 영어를 공부해요.
math|수학|I like math.|나는 수학을 좋아해요.
science|과학|Science is interesting.|과학은 흥미로워요.
art|미술|We have art today.|우리는 오늘 미술 수업이 있어요.
homework|숙제|I do my homework after dinner.|나는 저녁 식사 후 숙제를 해요.
question|질문|I have a question.|나는 질문이 있어요.
page|쪽
word|단어|This word is easy.|이 단어는 쉬워요.
sentence|문장|Read this sentence.|이 문장을 읽어 보세요.
letter|글자|A is the first letter.|A는 첫 번째 글자예요.
test|시험|We have a test tomorrow.|우리는 내일 시험이 있어요.
team|팀|I am on your team.|나는 너와 같은 팀이야.
group|모둠|We work in a group.|우리는 모둠으로 활동해요.
classmate|반 친구
principal|교장 선생님
cafeteria|학교 식당
gym|체육관
`);
add('daily-routine','stem','하루 일과 마을','My Day','🌅','X',`
get up|일어나다|I get up at seven.|나는 일곱 시에 일어나요.
get dressed|옷을 입다|I get dressed in my room.|나는 내 방에서 옷을 입어요.
have breakfast|아침을 먹다|I have breakfast with my family.|나는 가족과 아침을 먹어요.
go to school|학교에 가다|I go to school by bus.|나는 버스로 학교에 가요.
have lunch|점심을 먹다|I have lunch at school.|나는 학교에서 점심을 먹어요.
go home|집에 가다|I go home after school.|나는 방과 후에 집에 가요.
do homework|숙제하다|I do homework in my room.|나는 내 방에서 숙제해요.
have dinner|저녁을 먹다|I have dinner at six.|나는 여섯 시에 저녁을 먹어요.
take a shower|샤워하다|I take a shower at night.|나는 밤에 샤워해요.
go to bed|잠자리에 들다|I go to bed at nine.|나는 아홉 시에 잠자리에 들어요.
pack|짐을 싸다|I pack my bag.|나는 가방을 챙겨요.
leave|떠나다|We leave home at eight.|우리는 여덟 시에 집을 나서요.
arrive|도착하다|I arrive at school early.|나는 학교에 일찍 도착해요.
wait|기다리다|Please wait for me.|나를 기다려 주세요.
start|시작하다|We start the game.|우리는 게임을 시작해요.
finish|끝내다|I finish my homework.|나는 숙제를 끝내요.
rest|쉬다|I rest after lunch.|나는 점심을 먹고 쉬어요.
practice|연습하다|I practice the piano.|나는 피아노를 연습해요.
study|공부하다|We study English.|우리는 영어를 공부해요.
visit|방문하다|We visit our grandmother.|우리는 할머니를 방문해요.
`);
add('useful-actions','stem','동작 마을','Useful Actions','🤲','X',`
open|열다|Please open the box.|상자를 열어 주세요.
close|닫다|Please close the door.|문을 닫아 주세요.
carry|나르다|I carry my bag.|나는 가방을 나르며 가요.
bring|가져오다|Bring your book.|책을 가져오세요.
take|가져가다|Take an umbrella.|우산을 가져가세요.
give|주다|Give me the ball.|공을 내게 주세요.
put|놓다|Put the pen on the desk.|펜을 책상 위에 놓으세요.
find|찾다|I can find my hat.|나는 내 모자를 찾을 수 있어요.
make|만들다|We make a cake.|우리는 케이크를 만들어요.
build|짓다|We build a small house.|우리는 작은 집을 지어요.
cut|자르다|Cut the paper.|종이를 자르세요.
push|밀다|Push the door.|문을 미세요.
pull|당기다|Pull the rope.|밧줄을 당기세요.
hold|잡고 있다|Hold my hand.|내 손을 잡으세요.
pick|고르다|Pick a card.|카드 한 장을 고르세요.
turn|돌리다|Turn the page.|쪽을 넘기세요.
show|보여주다|Show me your picture.|네 그림을 보여 주세요.
use|사용하다|I use a pencil.|나는 연필을 사용해요.
need|필요하다|I need some water.|나는 물이 필요해요.
want|원하다|I want a new book.|나는 새 책을 원해요.
`);
add('communication','stem','대화 마을','Talking Together','💬','X',`
ask|묻다|May I ask a question?|질문해도 될까요?
answer|대답하다|Please answer my question.|내 질문에 대답해 주세요.
say|말하다|Say hello to your friend.|친구에게 인사하세요.
tell|이야기하다|Tell me a story.|이야기를 들려주세요.
speak|말하다|I can speak English.|나는 영어로 말할 수 있어요.
talk|대화하다|We talk after class.|우리는 수업 후에 이야기해요.
call|전화하다|I call my grandmother.|나는 할머니께 전화해요.
thank|감사하다|I thank my teacher.|나는 선생님께 감사해요.
smile|미소 짓다|Smile for the photo.|사진을 찍게 웃어 주세요.
laugh|웃다|We laugh together.|우리는 함께 웃어요.
cry|울다|Please do not cry.|울지 마세요.
meet|만나다|I meet my friend.|나는 친구를 만나요.
greet|인사하다|We greet our teacher.|우리는 선생님께 인사해요.
share|나누다|We share our snacks.|우리는 간식을 나눠요.
invite|초대하다|I invite my friend.|나는 친구를 초대해요.
join|참여하다|Can I join your game?|너희 게임에 참여해도 될까?
agree|동의하다|I agree with you.|나는 네 말에 동의해.
spell|철자를 말하다|Can you spell your name?|네 이름의 철자를 말할 수 있니?
repeat|반복하다|Please repeat the word.|단어를 다시 말해 주세요.
understand|이해하다|I understand the question.|나는 질문을 이해해요.
`);
add('moving','stem','움직임 마을','Move Your Body','🏊','X',`
swim|수영하다|I can swim.|나는 수영할 수 있어요.
fly|날다|Birds can fly.|새들은 날 수 있어요.
ride|타다|I ride my bike.|나는 자전거를 타요.
climb|오르다|We climb the hill.|우리는 언덕을 올라요.
throw|던지다|Throw the ball to me.|공을 내게 던져 주세요.
catch|잡다|I can catch the ball.|나는 공을 잡을 수 있어요.
kick|차다|Kick the ball.|공을 차세요.
hit|치다|Hit the ball with the bat.|방망이로 공을 치세요.
roll|굴리다|Roll the ball slowly.|공을 천천히 굴리세요.
skip|깡충깡충 뛰다|I skip in the park.|나는 공원에서 깡충깡충 뛰어요.
hop|한 발로 뛰다|I can hop on one foot.|나는 한 발로 뛸 수 있어요.
crawl|기어가다|The baby can crawl.|아기는 기어갈 수 있어요.
stretch|뻗다|Stretch your arms.|팔을 쭉 뻗으세요.
bend|굽히다|Bend your knees.|무릎을 굽히세요.
lift|들어 올리다|Lift the box.|상자를 들어 올리세요.
drop|떨어뜨리다|Do not drop the glass.|유리잔을 떨어뜨리지 마세요.
follow|따라가다|Follow me, please.|나를 따라오세요.
stop|멈추다|Stop at the red light.|빨간불에 멈추세요.
cross|건너다|We cross the road together.|우리는 함께 길을 건너요.
move|움직이다|Move your body.|몸을 움직이세요.
`);
add('size-speed','stem','크기와 속도 마을','Size & Speed','🐘','X',`
big|큰|The elephant is big.|코끼리는 커요.
small|작은|The mouse is small.|쥐는 작아요.
long|긴|This rope is long.|이 밧줄은 길어요.
short|짧은|This pencil is short.|이 연필은 짧아요.
tall|키가 큰|My brother is tall.|내 남자 형제는 키가 커요.
low|낮은|The table is low.|탁자가 낮아요.
high|높은|The mountain is high.|산은 높아요.
fast|빠른|The train is fast.|기차는 빨라요.
slow|느린|The turtle is slow.|거북이는 느려요.
heavy|무거운|My bag is heavy.|내 가방은 무거워요.
light|가벼운|The feather is light.|깃털은 가벼워요.
wide|넓은|The river is wide.|강은 넓어요.
narrow|좁은|The road is narrow.|도로는 좁아요.
thick|두꺼운|This book is thick.|이 책은 두꺼워요.
thin|얇은|This paper is thin.|이 종이는 얇아요.
round|둥근|The ball is round.|공은 둥글어요.
flat|평평한|This rock is flat.|이 바위는 평평해요.
deep|깊은|The lake is deep.|호수는 깊어요.
shallow|얕은|The pool is shallow.|수영장은 얕아요.
large|큰|We need a large box.|우리는 큰 상자가 필요해요.
`);
add('describing','stem','특징 마을','Describe Things','🔍','X',`
soft|부드러운|The pillow is soft.|베개는 부드러워요.
hard|딱딱한|The rock is hard.|바위는 딱딱해요.
clean|깨끗한|My room is clean.|내 방은 깨끗해요.
dirty|더러운|My shoes are dirty.|내 신발은 더러워요.
new|새로운|This is my new bag.|이것은 내 새 가방이에요.
old|오래된|This house is old.|이 집은 오래됐어요.
young|어린|The puppy is young.|강아지는 어려요.
pretty|예쁜|The flower is pretty.|꽃이 예뻐요.
cute|귀여운|The kitten is cute.|새끼 고양이는 귀여워요.
beautiful|아름다운|The garden is beautiful.|정원이 아름다워요.
sweet|단|The cake is sweet.|케이크는 달아요.
sour|신|The lemon is sour.|레몬은 시어요.
salty|짠|The soup is salty.|수프는 짜요.
spicy|매운|The food is spicy.|음식이 매워요.
delicious|맛있는|This pizza is delicious.|이 피자는 맛있어요.
loud|시끄러운|The music is loud.|음악 소리가 커요.
bright|밝은|The sun is bright.|해는 밝아요.
dark|어두운|The room is dark.|방은 어두워요.
easy|쉬운|This question is easy.|이 질문은 쉬워요.
difficult|어려운|This puzzle is difficult.|이 퍼즐은 어려워요.
`);
add('personality','stem','친구의 장점 마을','Good Friends','🤝','X',`
friendly|다정한|My classmate is friendly.|내 반 친구는 다정해요.
honest|정직한|She is honest.|그녀는 정직해요.
polite|예의 바른|He is polite.|그는 예의가 발라요.
clever|영리한|The monkey is clever.|원숭이는 영리해요.
smart|똑똑한|My friend is smart.|내 친구는 똑똑해요.
funny|재미있는|The story is funny.|그 이야기는 재미있어요.
helpful|도움을 주는|My neighbor is helpful.|내 이웃은 잘 도와줘요.
careful|조심하는|Be careful on the stairs.|계단에서는 조심하세요.
careless|부주의한|Do not be careless.|부주의하게 행동하지 마세요.
patient|참을성 있는|Our teacher is patient.|우리 선생님은 참을성이 있어요.
gentle|온화한|The horse is gentle.|그 말은 온순해요.
active|활동적인|My sister is active.|내 여자 형제는 활동적이에요.
lazy|게으른|The cat looks lazy today.|오늘 고양이는 게을러 보여요.
busy|바쁜|My father is busy.|내 아버지는 바빠요.
strong|힘센|The bear is strong.|곰은 힘이 세요.
weak|약한|The small branch is weak.|작은 나뭇가지는 약해요.
healthy|건강한|I want to stay healthy.|나는 건강하게 지내고 싶어요.
safe|안전한|This place is safe.|이 장소는 안전해요.
ready|준비된|I am ready to go.|나는 갈 준비가 됐어요.
lucky|운이 좋은|We are lucky today.|우리는 오늘 운이 좋아요.
`);
add('calendar','stem','달력 마을','Days & Time','📅','X',`
today|오늘|Today is Monday.|오늘은 월요일이에요.
tomorrow|내일|See you tomorrow.|내일 만나자.
yesterday|어제|Yesterday was sunny.|어제는 맑았어요.
morning|아침|I read in the morning.|나는 아침에 책을 읽어요.
afternoon|오후|We play in the afternoon.|우리는 오후에 놀아요.
evening|저녁|We walk in the evening.|우리는 저녁에 산책해요.
night|밤|The stars shine at night.|별은 밤에 빛나요.
week|주|A week has seven days.|일주일은 칠 일이에요.
weekend|주말|I rest on the weekend.|나는 주말에 쉬어요.
month|달|This month is May.|이번 달은 오월이에요.
year|년|Happy New Year!|새해 복 많이 받으세요!
Monday|월요일|I have art on Monday.|나는 월요일에 미술 수업이 있어요.
Tuesday|화요일|Today is Tuesday.|오늘은 화요일이에요.
Wednesday|수요일|We swim on Wednesday.|우리는 수요일에 수영해요.
Thursday|목요일|I play chess on Thursday.|나는 목요일에 체스를 둬요.
Friday|금요일|Friday is my favorite day.|금요일은 내가 가장 좋아하는 날이에요.
Saturday|토요일|I visit my aunt on Saturday.|나는 토요일에 이모를 방문해요.
Sunday|일요일|We go hiking on Sunday.|우리는 일요일에 하이킹을 가요.
birthday|생일|Today is my birthday.|오늘은 내 생일이에요.
holiday|휴일|Tomorrow is a holiday.|내일은 휴일이에요.
`);
add('leisure','stem','즐거운 하루 마을','Everyday Life','🎉','N',`
breakfast|아침 식사|Breakfast is ready.|아침 식사가 준비됐어요.
lunch|점심 식사|We eat lunch at noon.|우리는 정오에 점심을 먹어요.
dinner|저녁 식사|Dinner is delicious.|저녁 식사는 맛있어요.
picnic|소풍|We have a picnic.|우리는 소풍을 가요.
party|파티|We have a party today.|우리는 오늘 파티를 해요.
festival|축제
trip|여행|Our trip was fun.|우리 여행은 재미있었어요.
concert|음악회
movie|영화|We watch a movie.|우리는 영화를 봐요.
music|음악|I listen to music.|나는 음악을 들어요.
story|이야기|Tell me a story.|이야기를 들려주세요.
photo|사진|This is a family photo.|이것은 가족사진이에요.
message|메시지|I send a message to Mom.|나는 엄마에게 메시지를 보내요.
email|이메일|I write an email.|나는 이메일을 써요.
phone|전화기
camera|카메라
present|선물
invitation|초대장
vacation|방학|We travel during vacation.|우리는 방학 동안 여행해요.
memory|기억|I have a happy memory.|나는 행복한 기억이 있어요.
`);
add('shopping','stem','장보기 마을','Shopping','🛒','N',`
shop|가게
store|상점
price|가격
money|돈|I save my money.|나는 돈을 모아요.
coin|동전
bill|지폐
wallet|지갑
basket|바구니
cart|쇼핑 수레
customer|손님
cashier|계산원
receipt|영수증
size|크기|What size do you need?|어떤 크기가 필요하니?
pair|한 쌍|I need a pair of socks.|나는 양말 한 켤레가 필요해요.
piece|조각|May I have a piece of cake?|케이크 한 조각 먹어도 될까요?
snack|간식
candy|사탕
hamburger|햄버거
bottle|병
cup|컵
`);
add('health','stem','건강 마을','Staying Healthy','🩺','N',`
medicine|약|Take your medicine.|약을 드세요.
bandage|붕대
mask|마스크
thermometer|체온계
fever|열|I have a fever.|나는 열이 나요.
cough|기침|I have a cough.|나는 기침을 해요.
headache|두통|I have a headache.|나는 머리가 아파요.
stomachache|복통|I have a stomachache.|나는 배가 아파요.
toothache|치통|I have a toothache.|나는 이가 아파요.
health|건강|Exercise is good for your health.|운동은 건강에 좋아요.
soap|비누
shampoo|샴푸|I wash my hair with shampoo.|나는 샴푸로 머리를 감아요.
toothbrush|칫솔
toothpaste|치약|Put toothpaste on your toothbrush.|칫솔에 치약을 짜세요.
comb|빗
nail|손톱
skin|피부|Keep your skin clean.|피부를 깨끗하게 유지하세요.
bone|뼈
blood|피|Blood is red.|피는 빨간색이에요.
exercise|운동|I do exercise every day.|나는 매일 운동해요.
`);
add('chores','stem','집안일 마을','Helping at Home','🧹','X',`
tidy|정리하다|I tidy my room.|나는 내 방을 정리해요.
sweep|쓸다|We sweep the floor.|우리는 바닥을 쓸어요.
wipe|닦다|Wipe the table.|탁자를 닦으세요.
fold|접다|I fold my clothes.|나는 옷을 개요.
hang|걸다|Hang your coat here.|코트를 여기에 거세요.
feed|먹이를 주다|I feed my dog.|나는 개에게 먹이를 줘요.
plant|심다|We plant a tree.|우리는 나무를 심어요.
grow|기르다|We grow vegetables.|우리는 채소를 길러요.
fix|고치다|I fix my toy.|나는 장난감을 고쳐요.
repair|수리하다|We repair the old bike.|우리는 오래된 자전거를 수리해요.
wash dishes|설거지하다|I wash dishes after dinner.|나는 저녁 식사 후 설거지해요.
set the table|상을 차리다|I set the table for dinner.|나는 저녁상을 차려요.
make the bed|침대를 정리하다|I make the bed every morning.|나는 매일 아침 침대를 정리해요.
take out|꺼내다|Take out your notebook.|공책을 꺼내세요.
put away|치우다|Put away your toys.|장난감을 치우세요.
turn on|켜다|Turn on the light.|불을 켜세요.
turn off|끄다|Turn off the computer.|컴퓨터를 끄세요.
recycle|재활용하다|We recycle paper.|우리는 종이를 재활용해요.
sort|분류하다|We sort the blocks by color.|우리는 블록을 색깔별로 분류해요.
collect|모으다|I collect stickers.|나는 스티커를 모아요.
`);
add('pronouns','stem','나와 너 마을','People in Sentences','👥','X',`
I|나는|I like apples.|나는 사과를 좋아해요.
you|너는|You are my friend.|너는 내 친구야.
he|그는|He plays soccer.|그는 축구를 해요.
she|그녀는|She reads a book.|그녀는 책을 읽어요.
it|그것은|It is a small box.|그것은 작은 상자예요.
we|우리는|We go to school.|우리는 학교에 가요.
they|그들은|They play together.|그들은 함께 놀아요.
me|나를·나에게|Please help me.|나를 도와주세요.
him|그를·그에게|I give him a book.|나는 그에게 책을 줘요.
her|그녀를·그녀에게|I call her.|나는 그녀에게 전화해요.
us|우리를·우리에게|Please join us.|우리와 함께해 주세요.
them|그들을·그들에게|I know them.|나는 그들을 알아요.
my|나의|This is my bag.|이것은 내 가방이에요.
your|너의|Is this your pencil?|이것은 네 연필이니?
his|그의|His cap is blue.|그의 모자는 파란색이에요.
our|우리의|Our teacher is kind.|우리 선생님은 친절해요.
their|그들의|Their house is big.|그들의 집은 커요.
what|무엇|What is this?|이것은 무엇이니?
who|누구|Who is your teacher?|너의 선생님은 누구시니?
where|어디|Where is my bag?|내 가방은 어디 있니?
`);
add('thinking','tree','생각 탐험 마을','Thinking','🧠','X',`
think|생각하다|I think this book is interesting.|나는 이 책이 흥미롭다고 생각해요.
know|알다|Do you know the answer?|너는 답을 알고 있니?
remember|기억하다|I remember your name.|나는 네 이름을 기억해요.
forget|잊다|Do not forget your homework.|숙제를 잊지 마세요.
learn|배우다|We learn something new every day.|우리는 매일 새로운 것을 배워요.
decide|결정하다|We decide to take the bus.|우리는 버스를 타기로 결정해요.
choose|선택하다|Choose the best answer.|가장 알맞은 답을 고르세요.
believe|믿다|I believe your story.|나는 네 이야기를 믿어요.
guess|추측하다|Can you guess my favorite color?|내가 좋아하는 색을 맞힐 수 있니?
imagine|상상하다|Imagine a world without trees.|나무가 없는 세상을 상상해 보세요.
hope|바라다|I hope you feel better soon.|네가 곧 나아지길 바라.
wish|소원을 빌다|I wish you a happy birthday.|생일을 축하해.
expect|예상하다|We expect rain tomorrow.|우리는 내일 비가 올 것으로 예상해요.
wonder|궁금해하다|I wonder why the sky is blue.|나는 왜 하늘이 파란지 궁금해요.
notice|알아차리다|Did you notice the small bird?|작은 새를 알아차렸니?
realize|깨닫다|I realize that practice is important.|나는 연습이 중요하다는 것을 깨달아요.
consider|고려하다|Please consider my idea.|내 생각을 고려해 주세요.
recognize|알아보다|I recognize your voice.|나는 네 목소리를 알아봐요.
suppose|추측하다|I suppose she is at home.|나는 그녀가 집에 있을 거라고 생각해요.
mean|의미하다|What does this sign mean?|이 표지판은 무슨 뜻이니?
`);
add('learning-skills','tree','학습 전략 마을','Learning Skills','📝','X',`
explain|설명하다|Please explain your answer.|네 답을 설명해 주세요.
describe|묘사하다|Describe your favorite place.|가장 좋아하는 장소를 묘사해 보세요.
compare|비교하다|Compare these two pictures.|이 두 그림을 비교해 보세요.
solve|풀다|We can solve the problem together.|우리는 함께 문제를 풀 수 있어요.
check|확인하다|Check your answers again.|답을 다시 확인하세요.
review|복습하다|We review the words after class.|우리는 수업 후에 단어를 복습해요.
improve|향상하다|Practice can improve your English.|연습은 영어 실력을 향상할 수 있어요.
prepare|준비하다|I prepare for the test.|나는 시험을 준비해요.
complete|완성하다|Complete the sentence.|문장을 완성하세요.
correct|고치다|Please correct my mistake.|내 실수를 고쳐 주세요.
count|세다|Count the stars in the picture.|그림 속 별을 세어 보세요.
calculate|계산하다|We calculate the total price.|우리는 총가격을 계산해요.
add|더하다|Add two and three.|이와 삼을 더하세요.
subtract|빼다|Subtract two from five.|오에서 이를 빼세요.
multiply|곱하다|Multiply three by four.|삼에 사를 곱하세요.
divide|나누다|Divide ten by two.|십을 이로 나누세요.
measure|측정하다|We measure the length of the desk.|우리는 책상의 길이를 재요.
pronounce|발음하다|How do you pronounce this word?|이 단어를 어떻게 발음하니?
translate|번역하다|Translate this sentence into Korean.|이 문장을 한국어로 번역하세요.
memorize|암기하다|I memorize five words each day.|나는 매일 단어 다섯 개를 외워요.
`);
add('relationships','tree','함께 사는 마을','Relationships','🤝','X',`
promise|약속하다|I promise to help you.|나는 너를 돕겠다고 약속해.
suggest|제안하다|I suggest a new game.|나는 새로운 게임을 제안해요.
advise|조언하다|Teachers advise us to read every day.|선생님들은 매일 책을 읽으라고 조언해요.
allow|허락하다|My parents allow me to play outside.|부모님은 내가 밖에서 노는 것을 허락해요.
accept|받아들이다|I accept your invitation.|나는 네 초대를 받아들여.
refuse|거절하다|You can refuse politely.|너는 정중하게 거절해도 돼.
offer|제공하다|We offer help to our neighbors.|우리는 이웃에게 도움을 제공해요.
borrow|빌리다|May I borrow your ruler?|네 자를 빌려도 될까?
lend|빌려주다|Can you lend me a pencil?|연필을 빌려줄 수 있니?
return|돌려주다|Please return the book tomorrow.|내일 책을 돌려주세요.
send|보내다|I send an email to my cousin.|나는 사촌에게 이메일을 보내요.
receive|받다|I receive a letter from my friend.|나는 친구에게 편지를 받아요.
introduce|소개하다|Let me introduce my friend.|내 친구를 소개할게.
apologize|사과하다|I apologize for being late.|늦어서 사과드립니다.
forgive|용서하다|Please forgive my mistake.|내 실수를 용서해 주세요.
respect|존중하다|We respect different opinions.|우리는 서로 다른 의견을 존중해요.
trust|신뢰하다|I trust my best friend.|나는 가장 친한 친구를 믿어요.
support|지지하다|We support our team.|우리는 우리 팀을 응원해요.
cooperate|협력하다|We cooperate to finish the project.|우리는 과제를 마치기 위해 협력해요.
celebrate|축하하다|We celebrate our success.|우리는 성공을 축하해요.
`);
add('experiences','tree','경험 마을','Experiences','🧭','X',`
happen|일어나다|What will happen next?|다음에는 무슨 일이 일어날까?
become|되다|I want to become a scientist.|나는 과학자가 되고 싶어요.
seem|보이다|You seem happy today.|너는 오늘 행복해 보여.
feel|느끼다|I feel better now.|나는 이제 기분이 더 좋아요.
enjoy|즐기다|We enjoy reading together.|우리는 함께 책 읽기를 즐겨요.
prefer|더 좋아하다|I prefer tea to juice.|나는 주스보다 차를 더 좋아해요.
love|사랑하다|I love spending time with my family.|나는 가족과 시간 보내기를 좋아해요.
hate|몹시 싫어하다|I hate wasting food.|나는 음식을 낭비하는 것을 아주 싫어해요.
miss|그리워하다|I miss my old friends.|나는 옛 친구들이 그리워요.
worry|걱정하다|Do not worry about the test.|시험을 걱정하지 마세요.
surprise|놀라게 하다|The gift will surprise her.|그 선물은 그녀를 놀라게 할 거예요.
excite|신나게 하다|New adventures excite me.|새로운 모험은 나를 신나게 해요.
interest|흥미를 끌다|Stories about space interest me.|우주 이야기는 내 흥미를 끌어요.
relax|긴장을 풀다|I relax after finishing my homework.|나는 숙제를 끝내고 쉬어요.
travel|여행하다|We travel by train.|우리는 기차로 여행해요.
explore|탐험하다|We explore the forest.|우리는 숲을 탐험해요.
discover|발견하다|We discover a new path.|우리는 새로운 길을 발견해요.
experience|경험하다|We experience different cultures.|우리는 다양한 문화를 경험해요.
lose|잃다|Do not lose your ticket.|표를 잃어버리지 마세요.
win|이기다|Our team can win the game.|우리 팀은 경기에서 이길 수 있어요.
`);
add('change','tree','변화와 계획 마을','Change & Plans','🌈','X',`
change|바꾸다|We can change our plan.|우리는 계획을 바꿀 수 있어요.
develop|발달시키다|Reading helps develop your imagination.|독서는 상상력을 발달시키는 데 도움이 돼요.
increase|늘리다|We increase our reading time.|우리는 독서 시간을 늘려요.
decrease|줄다|The temperature will decrease tonight.|오늘 밤 기온이 내려갈 거예요.
reduce|줄이다|We reduce plastic waste.|우리는 플라스틱 쓰레기를 줄여요.
expand|넓히다|Books expand our knowledge.|책은 우리의 지식을 넓혀요.
continue|계속하다|Please continue your story.|이야기를 계속해 주세요.
remain|남다|Two apples remain in the basket.|바구니에 사과 두 개가 남아 있어요.
begin|시작하다|Classes begin at nine.|수업은 아홉 시에 시작해요.
end|끝나다|The movie will end soon.|영화가 곧 끝날 거예요.
create|창조하다|We create our own stories.|우리는 우리만의 이야기를 만들어요.
invent|발명하다|I want to invent a helpful robot.|나는 도움이 되는 로봇을 발명하고 싶어요.
produce|생산하다|Plants produce oxygen.|식물은 산소를 만들어요.
design|설계하다|We design a new playground.|우리는 새 놀이터를 설계해요.
plan|계획하다|We plan a trip for Saturday.|우리는 토요일 여행을 계획해요.
organize|정리하다|I organize my books by subject.|나는 책을 과목별로 정리해요.
protect|보호하다|We must protect wild animals.|우리는 야생 동물을 보호해야 해요.
prevent|예방하다|Washing hands can prevent illness.|손 씻기는 질병을 예방할 수 있어요.
save|절약하다|We save water at home.|우리는 집에서 물을 절약해요.
waste|낭비하다|Do not waste your time.|시간을 낭비하지 마세요.
`);
add('observing','tree','관찰 마을','Observing','🔬','X',`
watch|보다|We watch birds in the park.|우리는 공원에서 새를 관찰해요.
observe|관찰하다|We observe how plants grow.|우리는 식물이 어떻게 자라는지 관찰해요.
hear|듣다|I can hear the rain.|나는 빗소리를 들을 수 있어요.
smell|냄새를 맡다|Smell this flower.|이 꽃의 향기를 맡아 보세요.
taste|맛보다|Please taste the soup.|수프를 맛보세요.
touch|만지다|Do not touch the hot pan.|뜨거운 팬을 만지지 마세요.
see|보다|I can see the mountain.|나는 산을 볼 수 있어요.
examine|자세히 살피다|We examine a leaf with a lens.|우리는 렌즈로 잎을 자세히 살펴요.
sound|소리가 나다|How does the music sound?|그 음악은 어떻게 들리니?
appear|나타나다|Stars appear in the sky.|별들이 하늘에 나타나요.
disappear|사라지다|The sun will disappear behind the cloud.|해가 구름 뒤로 사라질 거예요.
shine|빛나다|The stars shine at night.|별들은 밤에 빛나요.
rise|오르다|The sun will rise soon.|해가 곧 뜰 거예요.
fall|떨어지다|Leaves fall in autumn.|잎은 가을에 떨어져요.
float|뜨다|This leaf can float on water.|이 잎은 물에 뜰 수 있어요.
dive|잠수하다|The penguin can dive deep.|펭귄은 깊이 잠수할 수 있어요.
flow|흐르다|Rivers flow toward the sea.|강은 바다를 향해 흘러요.
burn|타다|Dry leaves burn quickly.|마른 잎은 빨리 타요.
melt|녹다|Ice will melt in warm water.|얼음은 따뜻한 물에서 녹을 거예요.
freeze|얼다|Water can freeze in winter.|물은 겨울에 얼 수 있어요.
`);
add('projects','tree','도전 마을','Projects','🏆','X',`
achieve|이루다|We work hard to achieve our goal.|우리는 목표를 이루려고 열심히 노력해요.
attend|참석하다|I attend a science class.|나는 과학 수업에 참석해요.
concentrate|집중하다|I concentrate on my homework.|나는 숙제에 집중해요.
depend|의존하다|Young animals depend on their parents.|어린 동물은 부모에게 의존해요.
discuss|토론하다|We discuss our ideas.|우리는 생각을 나누며 토론해요.
encourage|격려하다|We encourage each other.|우리는 서로 격려해요.
express|표현하다|Art helps us express our feelings.|미술은 감정을 표현하도록 도와줘요.
include|포함하다|Please include your name.|이름을 포함해 주세요.
involve|참여시키다|We involve everyone in the project.|우리는 과제에 모두를 참여시켜요.
manage|해내다|We manage to finish on time.|우리는 제시간에 끝내요.
perform|공연하다|We perform on the school stage.|우리는 학교 무대에서 공연해요.
provide|제공하다|Trees provide homes for birds.|나무는 새들에게 집을 제공해요.
require|필요로 하다|This task will require teamwork.|이 과제에는 협동이 필요할 거예요.
respond|응답하다|Please respond to the message.|메시지에 응답해 주세요.
select|선택하다|Select the correct answer.|알맞은 답을 선택하세요.
separate|분리하다|Separate paper from plastic.|종이와 플라스틱을 분리하세요.
connect|연결하다|Connect the two sentences.|두 문장을 연결하세요.
arrange|배열하다|Arrange the words in order.|단어를 순서대로 배열하세요.
treat|대하다|Treat other people kindly.|다른 사람을 친절하게 대하세요.
volunteer|자원봉사하다|We volunteer at the library.|우리는 도서관에서 자원봉사해요.
`);
add('digital-actions','tree','디지털 동작 마을','Digital Actions','💻','X',`
click|클릭하다|Click the green button.|초록색 버튼을 클릭하세요.
type|입력하다|Type your name here.|여기에 이름을 입력하세요.
upload|올리다|I upload my photo.|나는 사진을 올려요.
download|내려받다|We download the worksheet.|우리는 학습지를 내려받아요.
print|인쇄하다|Print this page.|이 쪽을 인쇄하세요.
copy|복사하다|Copy the sentence.|문장을 복사하세요.
paste|붙여넣다|Paste the picture here.|여기에 그림을 붙여넣으세요.
delete|삭제하다|Delete the old file.|오래된 파일을 삭제하세요.
enter|들어가다|Enter the classroom quietly.|교실에 조용히 들어가세요.
exit|나가다|Please exit the program.|프로그램에서 나가 주세요.
log in|로그인하다|I log in with my password.|나는 비밀번호로 로그인해요.
log out|로그아웃하다|Please log out after class.|수업 후에 로그아웃하세요.
press|누르다|Press this key.|이 키를 누르세요.
browse|둘러보다|We browse the school website.|우리는 학교 웹사이트를 둘러봐요.
scroll|스크롤하다|Scroll down to see more.|더 보려면 아래로 스크롤하세요.
update|갱신하다|We update the program.|우리는 프로그램을 갱신해요.
install|설치하다|Please install the app.|앱을 설치해 주세요.
record|녹음하다|I record my voice.|나는 내 목소리를 녹음해요.
disconnect|연결을 끊다|Disconnect the cable safely.|케이블 연결을 안전하게 끊으세요.
charge|충전하다|I charge my tablet at home.|나는 집에서 태블릿을 충전해요.
`);
add('comparing','tree','비교 마을','Comparing','⚖️','X',`
better|더 좋은|This plan is better.|이 계획이 더 좋아요.
best|가장 좋은|This is the best day.|오늘은 최고의 날이에요.
worse|더 나쁜|The weather is worse today.|오늘은 날씨가 더 나빠요.
worst|가장 나쁜|That was the worst storm.|그것은 최악의 폭풍이었어요.
same|같은|We have the same book.|우리는 같은 책을 갖고 있어요.
different|다른|We have different ideas.|우리는 서로 다른 생각을 갖고 있어요.
similar|비슷한|These pictures are similar.|이 그림들은 비슷해요.
equal|같은 양의|We share the cake in equal parts.|우리는 케이크를 똑같이 나눠요.
opposite|반대의|We walk in opposite directions.|우리는 반대 방향으로 걸어요.
other|다른|Try the other door.|다른 문으로 가 보세요.
another|또 하나의|May I have another cookie?|쿠키 하나 더 먹어도 될까요?
each|각각의|Each student has a book.|각 학생은 책 한 권이 있어요.
every|모든|I read every day.|나는 매일 책을 읽어요.
few|거의 없는|There are few clouds today.|오늘은 구름이 거의 없어요.
many|많은|There are many stars.|별이 많이 있어요.
much|많은 양의|We do not have much time.|우리는 시간이 많지 않아요.
more|더 많은|I need more paper.|나는 종이가 더 필요해요.
most|가장 많은|She has the most stickers.|그녀가 스티커를 가장 많이 갖고 있어요.
less|더 적은|We use less plastic.|우리는 플라스틱을 더 적게 사용해요.
least|가장 적은|This box has the least sand.|이 상자에 모래가 가장 적게 있어요.
`);
add('inner-feelings','tree','깊은 마음 마을','Inner Feelings','💛','X',`
confident|자신감 있는|I feel confident about the test.|나는 시험에 자신이 있어요.
curious|호기심 많은|I am curious about space.|나는 우주가 궁금해요.
disappointed|실망한|I am disappointed about the result.|나는 결과에 실망했어요.
pleased|기쁜|She is pleased with her drawing.|그녀는 자기 그림이 마음에 들어요.
upset|속상한|He is upset about his lost toy.|그는 장난감을 잃어 속상해요.
worried|걱정하는|I am worried about my friend.|나는 친구가 걱정돼요.
comfortable|편안한|This chair is comfortable.|이 의자는 편안해요.
uncomfortable|불편한|These shoes are uncomfortable.|이 신발은 불편해요.
thankful|감사하는|I am thankful for your help.|나는 네 도움에 감사해.
grateful|고마워하는|We are grateful to our teacher.|우리는 선생님께 감사해요.
cheerful|명랑한|My cousin is always cheerful.|내 사촌은 언제나 명랑해요.
serious|진지한|This is a serious question.|이것은 진지한 질문이에요.
calm|차분한|Stay calm and take a deep breath.|차분하게 깊이 숨을 쉬세요.
hopeful|희망에 찬|We are hopeful about tomorrow.|우리는 내일에 희망을 품어요.
positive|긍정적인|Try to stay positive.|긍정적으로 생각해 보세요.
negative|부정적인|Do not focus on negative thoughts.|부정적인 생각에 집중하지 마세요.
sensitive|민감한|My skin is sensitive to the sun.|내 피부는 햇빛에 민감해요.
relaxed|편안해진|I feel relaxed after a walk.|나는 산책 후 편안해져요.
amazed|깜짝 놀란|We are amazed by the beautiful sky.|우리는 아름다운 하늘에 놀라요.
embarrassed|당황한|I felt embarrassed about my mistake.|나는 실수 때문에 당황했어요.
`);
add('judgments','tree','판단 마을','Making Judgments','💡','X',`
important|중요한|Water is important for life.|물은 생명에 중요해요.
necessary|필요한|Sleep is necessary for good health.|잠은 건강에 필요해요.
useful|유용한|This map is useful.|이 지도는 유용해요.
possible|가능한|It is possible to try again.|다시 시도할 수 있어요.
impossible|불가능한|It is impossible to fly without help.|도움 없이 하늘을 나는 것은 불가능해요.
special|특별한|Today is a special day.|오늘은 특별한 날이에요.
common|흔한|This is a common bird.|이것은 흔한 새예요.
usual|평소의|I take my usual route.|나는 평소의 길로 가요.
unusual|특이한|That is an unusual shape.|저것은 특이한 모양이에요.
popular|인기 있는|This game is popular.|이 게임은 인기가 있어요.
famous|유명한|She is a famous writer.|그녀는 유명한 작가예요.
expensive|비싼|This computer is expensive.|이 컴퓨터는 비싸요.
cheap|값싼|These pencils are cheap.|이 연필들은 저렴해요.
free|무료의|The museum is free today.|오늘 박물관 입장은 무료예요.
empty|빈|The bottle is empty.|병이 비었어요.
crowded|붐비는|The bus is crowded.|버스가 붐벼요.
excellent|훌륭한|You did an excellent job.|아주 잘했어요.
perfect|완벽한|This is a perfect place for a picnic.|이곳은 소풍 가기에 딱 좋아요.
terrible|끔찍한|The storm was terrible.|폭풍이 끔찍했어요.
wonderful|멋진|We had a wonderful time.|우리는 멋진 시간을 보냈어요.
`);
add('world-descriptions','tree','세상의 특징 마을','Our World','🌍','X',`
fresh|신선한|These apples are fresh.|이 사과들은 신선해요.
frozen|얼어붙은|The lake is frozen.|호수가 얼었어요.
alive|살아 있는|The small plant is alive.|작은 식물은 살아 있어요.
dead|죽은|The leaves on the ground are dead.|땅 위의 잎은 말라 죽었어요.
wild|야생의|We should protect wild animals.|우리는 야생 동물을 보호해야 해요.
natural|자연의|We enjoy the natural beauty.|우리는 자연의 아름다움을 즐겨요.
local|지역의|We visit the local library.|우리는 지역 도서관을 방문해요.
foreign|외국의|I want to learn a foreign language.|나는 외국어를 배우고 싶어요.
international|국제적인|It is an international event.|그것은 국제 행사예요.
national|국가의|This is a national park.|이곳은 국립공원이에요.
public|공공의|We use public transportation.|우리는 대중교통을 이용해요.
private|개인의|This is a private garden.|이곳은 개인 정원이에요.
normal|보통의|Today is a normal school day.|오늘은 평범한 등교일이에요.
strange|이상한|I hear a strange sound.|나는 이상한 소리를 들어요.
clear|맑은|The water is clear.|물이 맑아요.
muddy|진흙투성이의|My boots are muddy.|내 장화는 진흙투성이예요.
smooth|매끄러운|This stone is smooth.|이 돌은 매끄러워요.
rough|거친|The tree bark is rough.|나무껍질은 거칠어요.
sharp|날카로운|Be careful with the sharp knife.|날카로운 칼을 조심하세요.
dull|무딘|This pencil is dull.|이 연필 끝은 무뎌요.
`);
add('abstract-descriptions','tree','생각의 특징 마을','Describing Ideas','🧩','X',`
simple|간단한|This is a simple question.|이것은 간단한 질문이에요.
complex|복잡한|This machine is complex.|이 기계는 복잡해요.
basic|기초의|We learn basic English.|우리는 기초 영어를 배워요.
advanced|고급의|This is an advanced class.|이것은 고급 수업이에요.
main|주요한|What is the main idea?|중심 생각은 무엇이니?
major|중대한|This is a major change.|이것은 중대한 변화예요.
minor|사소한|It is a minor mistake.|그것은 사소한 실수예요.
whole|전체의|We read the whole story.|우리는 이야기 전체를 읽어요.
final|마지막의|This is the final question.|이것이 마지막 문제예요.
total|전체의|What is the total cost?|총비용은 얼마니?
certain|확실한|I am certain about the answer.|나는 답을 확신해요.
uncertain|확신하지 못하는|I am uncertain about the plan.|나는 계획이 확실하지 않아요.
true|참인|The story is true.|그 이야기는 사실이에요.
false|거짓인|That information is false.|그 정보는 거짓이에요.
real|진짜의|This is a real diamond.|이것은 진짜 다이아몬드예요.
modern|현대의|This is a modern building.|이것은 현대적인 건물이에요.
ancient|고대의|We learn about ancient cities.|우리는 고대 도시를 배워요.
recent|최근의|Tell me about your recent trip.|최근 여행에 대해 이야기해 줘.
daily|매일의|Reading is my daily habit.|독서는 내 매일의 습관이에요.
weekly|매주의|This is our weekly meeting.|이것은 우리의 주간 모임이에요.
`);
add('frequency','tree','시간 부사 마을','Time & Frequency','⏱️','X',`
always|항상|I always wash my hands.|나는 항상 손을 씻어요.
usually|보통|I usually walk to school.|나는 보통 걸어서 학교에 가요.
often|자주|We often visit the park.|우리는 공원을 자주 방문해요.
sometimes|때때로|I sometimes play chess.|나는 가끔 체스를 둬요.
never|절대로 아닌|I never waste food.|나는 음식을 절대로 낭비하지 않아요.
seldom|좀처럼 않는|It seldom snows here.|이곳에는 좀처럼 눈이 오지 않아요.
rarely|드물게|We rarely take a taxi.|우리는 택시를 드물게 타요.
ever|언젠가|Have you ever seen a whale?|고래를 본 적이 있니?
already|이미|I already know the answer.|나는 이미 답을 알아요.
still|아직도|She is still sleeping.|그녀는 아직도 자고 있어요.
yet|아직|I have not finished yet.|나는 아직 끝내지 못했어요.
again|다시|Please try again.|다시 시도해 주세요.
soon|곧|We will leave soon.|우리는 곧 떠날 거예요.
later|나중에|See you later.|나중에 만나자.
now|지금|I am ready now.|나는 지금 준비됐어요.
then|그때|I was seven then.|나는 그때 일곱 살이었어요.
early|일찍|I get up early.|나는 일찍 일어나요.
late|늦게|Do not arrive late.|늦게 도착하지 마세요.
once|한 번|Read the story once.|이야기를 한 번 읽으세요.
twice|두 번|I brush my teeth twice a day.|나는 하루에 이를 두 번 닦아요.
`);
add('manner','tree','방법 부사 마을','How We Do Things','🐢','X',`
slowly|천천히|The turtle moves slowly.|거북이는 천천히 움직여요.
quickly|빨리|The rabbit runs quickly.|토끼는 빨리 달려요.
carefully|조심스럽게|Read the question carefully.|질문을 주의 깊게 읽으세요.
easily|쉽게|I can solve this problem easily.|나는 이 문제를 쉽게 풀 수 있어요.
loudly|큰 소리로|Please do not speak loudly.|큰 소리로 말하지 마세요.
quietly|조용히|We read quietly in the library.|우리는 도서관에서 조용히 읽어요.
happily|행복하게|The children play happily.|아이들은 행복하게 놀아요.
sadly|슬프게|He looked at the broken toy sadly.|그는 망가진 장난감을 슬프게 바라봤어요.
well|잘|She plays the piano well.|그녀는 피아노를 잘 쳐요.
badly|심하게|The bike was badly damaged.|자전거가 심하게 망가졌어요.
really|정말|I really like this book.|나는 이 책을 정말 좋아해요.
very|매우|The mountain is very high.|산은 매우 높아요.
too|너무|The soup is too hot.|수프가 너무 뜨거워요.
quite|꽤|This question is quite easy.|이 질문은 꽤 쉬워요.
almost|거의|We are almost there.|우리는 거의 다 왔어요.
enough|충분히|I am old enough to ride a bike.|나는 자전거를 탈 만큼 나이가 들었어요.
together|함께|We learn together.|우리는 함께 배워요.
alone|혼자|I do not want to go alone.|나는 혼자 가고 싶지 않아요.
away|떨어져|The bird flew away.|새가 날아가 버렸어요.
abroad|해외로|My cousin studies abroad.|내 사촌은 해외에서 공부해요.
`);
add('prepositions','tree','위치와 방향 마을','Prepositions','📍','X',`
in|안에|The cat is in the box.|고양이는 상자 안에 있어요.
on|위에|The book is on the desk.|책은 책상 위에 있어요.
at|에|We meet at the library.|우리는 도서관에서 만나요.
under|아래에|The ball is under the bed.|공은 침대 아래에 있어요.
over|위로|The bird flies over the house.|새가 집 위로 날아요.
above|보다 위에|The clock is above the door.|시계는 문 위에 있어요.
below|보다 아래에|The temperature is below zero.|기온이 영 도 아래예요.
behind|뒤에|The dog is behind the tree.|개는 나무 뒤에 있어요.
beside|옆에|Sit beside me.|내 옆에 앉아.
between|둘 사이에|The bank is between the shops.|은행은 두 가게 사이에 있어요.
among|여럿 가운데에|The flower is among the trees.|꽃은 나무들 사이에 있어요.
near|가까이에|My school is near the park.|내 학교는 공원 가까이에 있어요.
next to|바로 옆에|The bakery is next to the bank.|빵집은 은행 바로 옆에 있어요.
in front of|앞에|We wait in front of the school.|우리는 학교 앞에서 기다려요.
inside|안쪽에|The toys are inside the box.|장난감은 상자 안에 있어요.
outside|밖에|The children are outside the house.|아이들은 집 밖에 있어요.
through|통과하여|We walk through the forest.|우리는 숲을 통과해 걸어요.
across|건너서|We walk across the bridge.|우리는 다리를 건너가요.
along|따라서|We walk along the river.|우리는 강을 따라 걸어요.
around|주위에|There are trees around the lake.|호수 주위에 나무들이 있어요.
`);
add('connectors','tree','문장 연결 마을','Connecting Ideas','🔗','X',`
and|그리고|I like apples and bananas.|나는 사과와 바나나를 좋아해요.
but|하지만|I am tired, but I am happy.|나는 피곤하지만 행복해요.
or|또는|Would you like milk or juice?|우유나 주스를 마시겠니?
because|왜냐하면|I stay home because it is rainy.|비가 와서 나는 집에 있어요.
so|그래서|It is cold, so I wear a coat.|추워서 나는 코트를 입어요.
if|만약|If it rains, we will stay home.|비가 오면 우리는 집에 있을 거예요.
when|할 때|I smile when I see my friends.|나는 친구들을 보면 웃어요.
while|하는 동안|I listen to music while I draw.|나는 그림을 그리는 동안 음악을 들어요.
before|전에|Wash your hands before you eat.|먹기 전에 손을 씻으세요.
after|후에|I read after I finish my homework.|나는 숙제를 끝낸 후 책을 읽어요.
until|까지|Wait until the light is green.|불이 초록색이 될 때까지 기다리세요.
although|비록이지만|Although it is cold, we play outside.|춥지만 우리는 밖에서 놀아요.
since|이므로|Since it is late, we should go home.|늦었으므로 우리는 집에 가야 해요.
unless|하지 않으면|We cannot play unless we finish first.|먼저 끝내지 않으면 우리는 놀 수 없어요.
whether|인지 아닌지|I wonder whether she will come.|나는 그녀가 올지 궁금해요.
as|처럼|Do as I say.|내가 말하는 대로 하세요.
than|보다|My bag is bigger than yours.|내 가방은 네 것보다 커요.
that|라는 것|I know that you can do it.|나는 네가 할 수 있다는 것을 알아.
both|둘 다|Both my sister and I like music.|내 여자 형제와 나는 둘 다 음악을 좋아해요.
either|둘 중 하나|You can choose either book.|둘 중 어느 책이든 골라도 돼요.
`);
add('landscape','tree','지형 탐험 마을','Landscapes','🏞️','N',`
island|섬
desert|사막
ocean|대양
valley|계곡
hill|언덕
field|들판
ground|땅|The ball falls to the ground.|공이 땅에 떨어져요.
soil|흙|Plants grow in soil.|식물은 흙에서 자라요.
seed|씨앗
root|뿌리
branch|나뭇가지
stem|줄기
trunk|나무 몸통
bark|나무껍질|The tree has rough bark.|그 나무에는 거친 껍질이 있어요.
petal|꽃잎
pond|연못
waterfall|폭포
stream|시내
cave|동굴
cliff|절벽
`);
add('science-world','tree','과학 탐험 마을','Science World','🧪','X',`
energy|에너지|The sun gives us energy.|태양은 우리에게 에너지를 줘요.
force|힘|A force can move an object.|힘은 물체를 움직일 수 있어요.
heat|열|Heat can melt ice.|열은 얼음을 녹일 수 있어요.
electricity|전기|We use electricity every day.|우리는 매일 전기를 사용해요.
magnet|자석|This magnet picks up metal.|이 자석은 금속을 끌어당겨요.
metal|금속|This spoon is made of metal.|이 숟가락은 금속으로 만들어졌어요.
plastic|플라스틱|We use less plastic.|우리는 플라스틱을 덜 사용해요.
glass|유리|This cup is made of glass.|이 컵은 유리로 만들어졌어요.
air|공기|We need clean air.|우리는 깨끗한 공기가 필요해요.
oxygen|산소|Plants produce oxygen.|식물은 산소를 만들어요.
planet|행성|Earth is a planet.|지구는 행성이에요.
earth|지구|We live on the earth.|우리는 지구에서 살아요.
space|우주|I want to learn about space.|나는 우주에 대해 배우고 싶어요.
universe|우주 전체|The universe is very large.|우주 전체는 매우 커요.
gravity|중력|Gravity pulls things down.|중력은 물체를 아래로 끌어당겨요.
matter|물질|Water is a kind of matter.|물은 물질의 한 종류예요.
liquid|액체|Water is a liquid.|물은 액체예요.
solid|고체|Ice is a solid.|얼음은 고체예요.
gas|기체|Oxygen is a gas.|산소는 기체예요.
temperature|온도|The temperature is low today.|오늘은 온도가 낮아요.
`);
add('environment','tree','환경 지킴이 마을','Environment','♻️','X',`
environment|환경|We protect the environment.|우리는 환경을 보호해요.
pollution|오염|Pollution harms animals.|오염은 동물에게 해를 끼쳐요.
garbage|쓰레기|Put the garbage in the bin.|쓰레기를 쓰레기통에 넣으세요.
rubbish|쓰레기|Do not leave rubbish in the park.|공원에 쓰레기를 버리지 마세요.
trash|쓰레기|We pick up trash together.|우리는 함께 쓰레기를 주워요.
litter|버려진 쓰레기|There is litter on the beach.|해변에 쓰레기가 있어요.
climate|기후|The climate is changing.|기후가 변하고 있어요.
wildlife|야생 생물|We should protect wildlife.|우리는 야생 생물을 보호해야 해요.
habitat|서식지|The forest is their habitat.|숲은 그들의 서식지예요.
resource|자원|Water is an important resource.|물은 중요한 자원이에요.
material|재료|Paper is a useful material.|종이는 유용한 재료예요.
fuel|연료|Cars need fuel.|자동차는 연료가 필요해요.
oil|기름|Oil can pollute water.|기름은 물을 오염시킬 수 있어요.
coal|석탄|Coal is a kind of fuel.|석탄은 연료의 한 종류예요.
carbon|탄소|Carbon is part of living things.|탄소는 생물의 구성 요소예요.
smoke|연기|Smoke rises from the fire.|불에서 연기가 올라와요.
dust|먼지|There is dust on the shelf.|선반 위에 먼지가 있어요.
noise|소음|Too much noise is harmful.|지나친 소음은 해로워요.
drought|가뭄|Plants need water during a drought.|가뭄 동안 식물은 물이 필요해요.
flood|홍수|Heavy rain can cause a flood.|많은 비는 홍수를 일으킬 수 있어요.
`);
add('society','tree','세계와 사회 마을','World & Society','🌏','X',`
country|나라|Korea is my country.|한국은 나의 나라예요.
nation|국가|Every nation has its own culture.|모든 국가는 고유한 문화가 있어요.
culture|문화|I want to learn about your culture.|나는 너의 문화를 배우고 싶어요.
language|언어|English is a language.|영어는 하나의 언어예요.
history|역사|I enjoy learning history.|나는 역사 배우기를 즐겨요.
tradition|전통|This festival is an old tradition.|이 축제는 오래된 전통이에요.
custom|풍습|This custom is very old.|이 풍습은 아주 오래됐어요.
rule|규칙|Please follow the rule.|규칙을 지켜 주세요.
law|법|We must follow the law.|우리는 법을 지켜야 해요.
right|권리|Every child has a right to learn.|모든 아이는 배울 권리가 있어요.
duty|의무|It is our duty to protect nature.|자연을 보호하는 것은 우리의 의무예요.
citizen|시민|A good citizen helps others.|좋은 시민은 다른 사람을 도와요.
community|공동체|We help our community.|우리는 지역 공동체를 도와요.
population|인구|The city has a large population.|그 도시는 인구가 많아요.
government|정부|The government builds public schools.|정부는 공립학교를 세워요.
leader|지도자|Our team needs a leader.|우리 팀에는 지도자가 필요해요.
president|대통령|The president gives a speech.|대통령이 연설을 해요.
mayor|시장|The mayor works for the city.|시장은 도시를 위해 일해요.
neighbor|이웃|My neighbor is friendly.|내 이웃은 다정해요.
guest|손님|We welcome every guest.|우리는 모든 손님을 환영해요.
`);
add('ideas','tree','생각과 이유 마을','Ideas & Reasons','💭','X',`
idea|생각|I have a new idea.|나는 새로운 생각이 있어요.
opinion|의견|What is your opinion?|네 의견은 무엇이니?
reason|이유|Tell me the reason.|이유를 말해 줘.
result|결과|We check the result.|우리는 결과를 확인해요.
example|예|Please give me an example.|예를 들어 주세요.
problem|문제|We solve the problem together.|우리는 함께 문제를 풀어요.
solution|해결책|We found a solution.|우리는 해결책을 찾았어요.
purpose|목적|What is the purpose of the trip?|여행의 목적은 무엇이니?
goal|목표|My goal is to read every day.|내 목표는 매일 책을 읽는 거예요.
dream|꿈|My dream is to be a pilot.|내 꿈은 조종사가 되는 거예요.
effort|노력|Your effort is important.|네 노력은 중요해.
success|성공|We celebrate our success.|우리는 성공을 축하해요.
failure|실패|We can learn from failure.|우리는 실패에서 배울 수 있어요.
chance|기회|This is a chance to learn.|이것은 배울 기회예요.
choice|선택|You have a choice.|너에게 선택권이 있어.
decision|결정|It was a good decision.|그것은 좋은 결정이었어요.
mistake|실수|Everyone can make a mistake.|누구나 실수할 수 있어요.
fact|사실|This fact is interesting.|이 사실은 흥미로워요.
truth|진실|Please tell the truth.|진실을 말해 주세요.
information|정보|The website has useful information.|그 웹사이트에는 유용한 정보가 있어요.
`);
add('reading-writing','tree','읽기와 쓰기 마을','Reading & Writing','📖','X',`
title|제목|What is the title of the book?|책 제목은 무엇이니?
author|저자|The author writes stories for children.|그 저자는 어린이를 위한 이야기를 써요.
chapter|장|I read one chapter each day.|나는 매일 한 장씩 읽어요.
paragraph|문단|Read the first paragraph.|첫 문단을 읽으세요.
text|글|Read the text carefully.|글을 주의 깊게 읽으세요.
poem|시|I write a short poem.|나는 짧은 시를 써요.
poetry|시 문학|We read poetry in class.|우리는 수업 시간에 시를 읽어요.
novel|소설|This novel is exciting.|이 소설은 흥미진진해요.
dictionary|사전|I use a dictionary.|나는 사전을 사용해요.
meaning|뜻|What is the meaning of this word?|이 단어의 뜻은 무엇이니?
grammar|문법|Grammar helps us make sentences.|문법은 문장 만들기를 도와줘요.
pronunciation|발음|I practice my pronunciation.|나는 발음을 연습해요.
vocabulary|어휘|Reading builds our vocabulary.|독서는 우리의 어휘력을 키워줘요.
spelling|철자|Check the spelling of your name.|이름의 철자를 확인하세요.
punctuation|문장 부호|Punctuation makes writing clear.|문장 부호는 글을 명확하게 해요.
comma|쉼표|Put a comma here.|여기에 쉼표를 넣으세요.
period|마침표|End the sentence with a period.|문장을 마침표로 끝내세요.
quotation|인용문|Read the quotation aloud.|인용문을 소리 내어 읽으세요.
dialogue|대화문|We practice the dialogue.|우리는 대화문을 연습해요.
summary|요약|Write a short summary.|짧은 요약을 쓰세요.
`);
add('technology','tree','디지털 도구 마을','Technology','⌨️','N',`
internet|인터넷|We use the internet to learn.|우리는 배우려고 인터넷을 이용해요.
website|웹사이트
screen|화면
keyboard|키보드
mouse|컴퓨터 마우스
tablet|태블릿
laptop|노트북 컴퓨터
printer|프린터
speaker|스피커
microphone|마이크
password|비밀번호|Keep your password private.|비밀번호를 비밀로 지키세요.
account|계정|I have a school account.|나는 학교 계정이 있어요.
file|파일
folder|폴더
software|소프트웨어|We update our software.|우리는 소프트웨어를 갱신해요.
program|프로그램
application|응용 프로그램
network|통신망|The network connects computers.|통신망은 컴퓨터들을 연결해요.
device|기기
link|링크|Click this link to learn more.|더 배우려면 이 링크를 클릭하세요.
`);
add('travel-world','tree','세계 여행 마을','Travel the World','🧳','N',`
map|지도
passport|여권
luggage|여행 짐|Keep your luggage with you.|여행 짐을 지니고 계세요.
suitcase|여행 가방
guide|안내자
tourist|관광객
visitor|방문객
tour|관광|We take a tour of the museum.|우리는 박물관을 둘러봐요.
adventure|모험|Our adventure begins today.|우리 모험은 오늘 시작돼요.
direction|방향|Which direction should we go?|우리는 어느 방향으로 가야 할까?
distance|거리|What is the distance to the park?|공원까지의 거리는 얼마니?
corner|모퉁이
entrance|입구
departure|출발|Our departure is at nine.|우리의 출발은 아홉 시예요.
arrival|도착|We wait for the arrival of the train.|우리는 기차의 도착을 기다려요.
destination|목적지|Our destination is the museum.|우리의 목적지는 박물관이에요.
schedule|일정|Check the travel schedule.|여행 일정을 확인하세요.
event|행사|The event starts tomorrow.|행사는 내일 시작해요.
journey|여정|Our journey takes two hours.|우리 여정은 두 시간이 걸려요.
souvenir|기념품
`);
