/* Knowledge base (mirrors dataset/symptoms.json and dataset/diseases.json). Used for the offline fallback engine. */
const S=`fv|Fever|bukhar,bukhaar,tez bukhar,high temperature,feverish,temperature,बुखार
ch|Chills|thand lagna,kapkapi,kaampna,shivering,rigors,कंपकंपी
hd|Headache|sir dard,sar dard,sirdard,head pain,सिर दर्द,सर दर्द
co|Cough|khansi,khaansi,coughing,खांसी,खाँसी
sb|Shortness of breath|saans phoolna,saans lene mein dikkat,breathless,difficulty breathing,सांस फूलना,सांस लेने में तकलीफ
ft|Fatigue|thakan,thakaan,tired,exhausted,थकान,थकावट
wk|Weakness|kamzori,kamjori,weak,कमजोरी
ba|Body ache|badan dard,body pain,muscle pain,badan toot,बदन दर्द,शरीर में दर्द
na|Nausea|ji michlana,mitli,feel sick,nauseous,जी मिचलाना
vo|Vomiting|ulti,vomit,throwing up,उल्टी
di|Diarrhoea|dast,loose motion,patle dast,diarrhea,दस्त
ap|Abdominal pain|pet dard,pait dard,stomach pain,stomach ache,पेट दर्द
cp|Chest pain|seene mein dard,chest dard,chest pain,tightness in chest,सीने में दर्द
rs|Skin rash|daane,chakatte,rash,लाल दाने
jp|Joint pain|jodon mein dard,joint dard,ghutne mein dard,knee pain,जोड़ों में दर्द
st|Sore throat|gale mein dard,gala kharab,throat pain,गले में दर्द,गला खराब
rn|Runny nose|naak behna,naak beh,nazla,runny nose,नाक बहना
sn|Sneezing|chheenk,chhink,sneeze,छींक
wz|Wheezing|seeti,wheez,saans mein awaz
sw|Sweating|pasina,sweating,पसीना
wl|Weight loss|wazan kam,weight loss,weight kam,वजन कम
ns|Night sweats|raat ko pasina,night sweat
bc|Blood in cough|khoon wali khansi,khansi mein khoon,blood in cough,coughing blood
ye|Yellow eyes or skin|peeli aankhen,peeli aankh,pilia,yellow eyes,yellow skin,jaundice,पीली आंखें
du|Dark urine|gehra peshab,dark urine,dark colored urine
al|Loss of appetite|bhook nahi lagti,bhook kam,no appetite,loss of appetite,भूख नहीं
th|Excessive thirst|pyaas zyada,bahut pyaas,excessive thirst,very thirsty
fu|Frequent urination|baar baar peshab,frequent urination,urinating often
bv|Blurred vision|dhundhla,blurred vision,blurry vision,धुंधला दिखना
dz|Dizziness|chakkar,dizzy,dizziness,चक्कर
vs|Spinning sensation|ghoomna,room spinning,everything spinning,sab ghoomta,vertigo
pl|Palpitations|dhadkan tez,dil tez,palpitation,heart racing,धड़कन तेज
nm|Numbness|sunn,numb,tingling,सुन्न
sp|Slurred speech|bolne mein dikkat,slurred speech,zubaan ladkhadana,difficulty speaking
se|Seizure|daura,mirgi,seizure,convulsion,jhatke
nk|Neck pain|gardan dard,neck pain,gardan mein dard,गर्दन दर्द
sf|Stiffness|akdan,jakdan,stiff,stiffness
ls|Light sensitivity|roshni se takleef,sensitive to light,light sensitivity
bl|Bloating or gas|pet fulna,bloating,gas,pet mein gas
hb|Heartburn|seene mein jalan,heartburn,acidity,khatta dakar,जलन
cn|Constipation|kabz,constipation,कब्ज
pa|Pale skin|peela chehra,pale,khoon ki kami,pale skin
ci|Feeling cold easily|thand zyada lagti,cold intolerance,always cold
hi|Heat intolerance|garmi bardasht nahi,heat intolerance,hamesha garmi
sl|Swelling|sujan,swelling,swollen,सूजन
it|Itching|khujli,itching,itchy,खुजली
ep|Pain behind eyes|aankh ke peeche dard,pain behind eyes,eye pain
bg|Bleeding gums|masoode se khoon,bleeding gums,gums bleeding
fd|Face drooping|chehra tedha,muh tedha,face drooping,face drooping on one side
cf|Confusion|ulajhan,confused,confusion,behoshi,बेहोशी
ls2|Loss of smell or taste|swad nahi,khushboo nahi,loss of smell,loss of taste,cannot smell,cannot taste
sy|Blocked nose or sinus|naak band,naak jam,sinus,blocked nose,stuffy nose,नाक बंद
rq|Lower right belly pain|daayein neeche pet dard,right lower abdomen,lower right abdomen
cw|Cold sweat|thanda pasina,cold sweat
la|Pain in left arm or jaw|baayein haath mein dard,left arm pain,jaw pain,jabde mein dard
wg|Weight gain|wazan badhna,weight gain,weight badh
tr|Tremor|haath kaampna,tremor,shaking hands`.trim().split("\n").map(l=>{const[c,n,a]=l.split("|");return{c,n,a:[n.toLowerCase(),...a.split(",")]}});
const D=`Malaria|Infectious|y|fv,ch,sw,hd,ba,na,vo,ft|Parasitic infection spread by mosquitoes, with fever in cycles of shivering and sweating.
Dengue fever|Infectious|y|fv,ep,jp,rs,ba,hd,na,ft|Mosquito-borne viral fever with severe body and joint pain.
Dengue haemorrhagic fever|Infectious|r|bg,fv,ap,vo,rs,wk,ba|Severe dengue with bleeding and low platelets. Needs hospital care.
Chikungunya|Infectious|y|fv,jp,rs,hd,ba,ft|Viral fever with intense joint pain that can last weeks.
Typhoid|Infectious|y|fv,ap,al,hd,cn,di,wk,ft|Bacterial infection from unsafe food or water, with prolonged fever.
Cholera|Infectious|r|di,vo,wk,ap,th|Severe watery diarrhoea that causes dangerous dehydration.
Hepatitis A|Infectious|y|ye,du,na,al,fv,ft,ap|Liver infection from contaminated food or water.
Hepatitis B|Infectious|y|ye,du,ft,ap,na,jp|Liver infection spread through blood and body fluids.
Hepatitis C|Infectious|y|ft,ye,ap,na,jp,al|Blood-borne liver infection that is often silent for years.
Hepatitis E|Infectious|y|ye,du,na,vo,fv,ap|Water-borne liver infection, risky during pregnancy.
Tuberculosis|Infectious|y|co,bc,wl,ns,fv,ft,cp,al|Lung infection with a cough lasting more than two weeks. Free testing is available at government centres.
COVID-19|Infectious|y|ls2,fv,co,st,ft,hd,ba,sb|Viral respiratory illness. Loss of smell or taste is a common clue.
Influenza|Infectious|g|fv,co,st,rn,ba,ft,hd,ch|Seasonal flu with sudden fever, aches and cough.
Chickenpox|Infectious|y|rs,it,fv,ft,hd,al|Itchy blister-like rash with fever. Spreads easily.
Pneumonia|Infectious|r|co,fv,sb,cp,ch,ft|Lung infection that can worsen quickly, especially in children and elders.
Leptospirosis|Infectious|y|fv,ep,hd,ba,ye,vo,ch|Spread through floodwater or animal urine. Common after monsoon.
Gastroenteritis|Digestive|g|di,vo,na,ap,fv|Stomach infection. Drink ORS and fluids to stay hydrated.
Peptic ulcer|Digestive|y|ap,hb,na,bl,al|Sore in the stomach lining, with burning pain between meals.
Irritable bowel syndrome|Digestive|g|ap,bl,di,cn|Long-term gut condition with cramps and changing stools.
Jaundice|Digestive|y|ye,du,ft,al,ap,pa|Yellowing of eyes and skin due to liver or blood problems.
Appendicitis|Digestive|r|rq,ap,na,vo,fv,al|Inflamed appendix. Pain moves to the lower right belly.
Acid reflux|Digestive|g|hb,hb,cp,bl,co,st|Stomach acid rising into the food pipe.
Asthma|Respiratory|y|wz,sb,co,cp|Airways narrow causing wheeze and breathlessness.
COPD|Respiratory|y|sb,co,wz,ft|Long-term lung disease, often linked to smoking or smoke exposure.
Bronchitis|Respiratory|g|co,wz,ft,st,fv|Irritated airways causing a lingering cough.
Sinusitis|Respiratory|g|sy,hd,rn,co,fv|Inflamed sinuses with facial pressure and a blocked nose.
Allergic rhinitis|Respiratory|g|sn,rn,it,sy|Allergy causing sneezing, itchy and runny nose.
Type 2 diabetes|Metabolic|y|th,fu,bv,ft,wl,nm|High blood sugar. A simple blood test confirms it.
Hypertension|Metabolic|y|hd,dz,pl,bv,cp|High blood pressure, often silent. Check BP regularly.
Hypothyroidism|Metabolic|g|ft,wg,ci,cn,wk|Underactive thyroid that slows the body down.
Hyperthyroidism|Metabolic|y|wl,hi,pl,tr,sw|Overactive thyroid that speeds the body up.
Anaemia|Metabolic|g|pa,ft,wk,dz,pl,sb|Low haemoglobin, commonly from low iron.
Migraine|Neurological|g|hd,ls,na,vo,dz|Throbbing headache, often with light sensitivity and nausea.
Vertigo|Neurological|g|vs,dz,na,vo|Spinning sensation, often from inner ear problems.
Epilepsy|Neurological|r|se,cf,sp|Recurrent seizures. A first seizure needs urgent evaluation.
Cervical spondylosis|Musculoskeletal|g|nk,sf,nm,hd|Neck joint wear causing pain and arm tingling.
Osteoarthritis|Musculoskeletal|g|jp,sf,sl|Joint wear, with pain and stiffness in knees or hips.
Stroke|Neurological|r|fd,sp,nm,wk,cf,hd|Brain blood flow problem. Every minute counts.
Coronary artery disease|Cardiovascular|y|cp,sb,ft,pl,sw|Narrowed heart arteries causing chest pain on effort.
Heart attack|Cardiovascular|r|cp,la,cw,sb,na,sw|Blocked heart artery. Medical emergency.`.trim().split("\n").map(l=>{const[n,c,u,s,d]=l.split("|");const a=s.split(",");return{n,c,u,s:[...new Set(a)],d}});



const H={fv:"Bukhar",ch:"Kapkapi / thand lagna",hd:"Sir dard",co:"Khansi",sb:"Saans phoolna",ft:"Thakan",wk:"Kamzori",ba:"Badan dard",na:"Ji michlana",vo:"Ulti",di:"Dast / loose motion",ap:"Pet dard",cp:"Seene mein dard",rs:"Badan par daane",jp:"Jodon mein dard",st:"Gale mein dard",rn:"Naak behna",sn:"Chheenkein aana",wz:"Saans mein seeti",sw:"Zyada pasina",wl:"Wazan kam hona",ns:"Raat ko pasina",bc:"Khansi mein khoon",ye:"Aankh / skin peeli",du:"Gehra peshab",al:"Bhook na lagna",th:"Bahut pyaas",fu:"Baar baar peshab",bv:"Dhundhla dikhna",dz:"Chakkar aana",vs:"Sab ghoomna",pl:"Dhadkan tez hona",nm:"Sunn pan",sp:"Bolne mein dikkat",se:"Daura / mirgi",nk:"Gardan dard",sf:"Akdan / jakdan",ls:"Roshni se takleef",bl:"Pet fulna / gas",hb:"Seene mein jalan",cn:"Kabz",pa:"Chehra peela padna",ci:"Zyada thand lagna",hi:"Zyada garmi lagna",sl:"Sujan",it:"Khujli",ep:"Aankh ke peeche dard",bg:"Masoode se khoon",fd:"Chehra tedha hona",cf:"Ulajhan / behoshi",ls2:"Swad / khushboo na aana",sy:"Naak band",rq:"Daayein neeche pet dard",cw:"Thanda pasina",la:"Baayein haath / jabde mein dard",wg:"Wazan badhna",tr:"Haath kaampna"};
S.forEach(s=>s.a.push(H[s.c].toLowerCase()));
