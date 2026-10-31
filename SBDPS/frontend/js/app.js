/* SBDPS frontend logic: voice assistant, NLP symptom extraction, UI. */
const GR={"Aam":"fv ch ft wk sw ns wl wg al cf pa","Sir aur nerves":"hd dz vs nm sp se fd ls nk sf tr","Seena aur saans":"co sb cp wz bc pl sn rn st sy ls2 hb","Pet aur peshab":"na vo di ap bl cn rq ye du th fu","Skin, aankh, jodh":"rs it sl jp ba bg bv ep ci hi cw la"};
const CL={"Aam":"var(--y)","Sir aur nerves":"var(--l)","Seena aur saans":"var(--s)","Pet aur peshab":"var(--m)","Skin, aankh, jodh":"var(--p)"},GC={};
Object.keys(GR).forEach(g=>GR[g].split(" ").forEach(c=>GC[c]=CL[g]));
const GN=["Sab",...Object.keys(GR)];let tab="Sab";
const EX=["Bukhar, sir dard aur badan dard","Khansi mein khoon aur wazan kam","Pet dard, ulti aur dast","Seene mein dard aur thanda pasina","Chheenk aur naak behna","Pyaas, baar baar peshab, thakan"];
const EMERG=["fd","sp","bc","se","cw"];
const UL={g:["Self-care","Rest, drink fluids and watch your symptoms. See a doctor if they last more than 3 days or get worse.","घर पर आराम करें, पानी पिएं और लक्षणों पर नज़र रखें।","Ghar par aaram karo, paani piyo. 3 din se zyada ya badhne par doctor ko dikhao."],y:["Visit a clinic","Please see a doctor or a nearby health centre within 24 to 48 hours.","कृपया जल्द ही डॉक्टर या नज़दीकी स्वास्थ्य केंद्र से मिलें।","24 se 48 ghante mein doctor ya nazdiki health centre jao."],r:["Emergency","Seek care now. Call 108 or 112, or go to the nearest hospital.","यह आपातकालीन हो सकता है। तुरंत 108 या 112 पर कॉल करें।","Turant 108 ya 112 par call karo ya nazdiki hospital jao."]};
const $=i=>document.getElementById(i);const sel=new Set();let last=null,rec=null,listening=false,autoSpeak=true;
const EMPTY='<div class="empty"><b>🩺</b>Your results will appear here. Speak, type, or pick symptoms to begin.</div>';
const syn=window.speechSynthesis,SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const nm=c=>H[c],en=c=>S.find(s=>s.c===c).n;
const inFrame=(()=>{try{return window.self!==window.top}catch(e){return true}})();
const blocked=()=>{try{const pp=document.permissionsPolicy||document.featurePolicy;return !!(pp&&pp.allowsFeature&&!pp.allowsFeature("microphone"))}catch(e){return false}};
function showNote(){$("mn").hidden=false;$("nt").hidden=!inFrame}
const norm=t=>" "+t.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s]/gu," ").replace(/\s+/g," ")+" ";
function extract(text){const t=norm(text),found=[];
 for(const s of S){outer:for(const a of s.a){let i=t.indexOf(a);while(i>=0){const pre=t.slice(Math.max(0,i-16),i),post=t.slice(i+a.length,i+a.length+12);
  const neg=/\b(no|not|without|never|nahi|nahin|bina)\s+(\S+\s+)?$/.test(pre)||/^\s*(nahi|nahin|nhi|नहीं)/.test(post);
  if(!neg){found.push(s.c);break outer}i=t.indexOf(a,i+1)}}}
 return found}
function render(){const p=$("picked");p.innerHTML="";
 if(!sel.size)p.innerHTML='<span class="none">None selected</span>';
 sel.forEach(c=>{const b=document.createElement("button");b.textContent=nm(c)+" ✕";b.setAttribute("aria-label",nm(c)+" hatao");b.onclick=()=>{sel.delete(c);render()};p.appendChild(b)});
 drawTabs();drawList()}
function drawTabs(){const t=$("tabs");t.innerHTML="";
 GN.forEach(g=>{const n=g==="Sab"?sel.size:GR[g].split(" ").filter(c=>sel.has(c)).length,b=document.createElement("button");b.className="tab";b.setAttribute("role","tab");b.setAttribute("aria-selected",g===tab);b.innerHTML=g+(n?"<em>"+n+"</em>":"");b.onclick=()=>{tab=g;$("q").value="";render()};t.appendChild(b)})}
function drawList(){const f=$("q").value.toLowerCase().trim(),l=$("list");l.innerHTML="";
 const ok=tab==="Sab"?null:GR[tab].split(" ");
 S.filter(s=>f?s.a.some(a=>a.includes(f)):(!ok||ok.includes(s.c))).forEach(s=>{const b=document.createElement("button");b.className="sy";b.style.setProperty("--c",GC[s.c]||"var(--o)");b.innerHTML="<b>"+H[s.c]+"</b><small>"+s.n+"</small>";b.setAttribute("aria-pressed",sel.has(s.c));
  b.onclick=()=>{sel.has(s.c)?sel.delete(s.c):sel.add(s.c);render()};l.appendChild(b)});
 if(!l.children.length)l.innerHTML='<span class="sub">No matching symptom.</span>'}
function predict(){const n=sel.size;
 const sc=D.map(d=>{const w=d.s.map((c,i)=>i<2?3:1),tw=w.reduce((a,b)=>a+b,0);let mw=0,mc=0;const m=[];
  d.s.forEach((c,i)=>{if(sel.has(c)){mw+=w[i];mc++;m.push(c)}});
  return{d,m,mc,s:mc?(mw/tw)*.55+(mc/n)*.45:0}});
 const top=sc.filter(x=>x.mc>0).sort((a,b)=>b.s-a.s),mx=top[0].s,ex=top.map(x=>Math.exp((x.s-mx)*6)),sum=ex.reduce((a,b)=>a+b,0);
 top.forEach((x,i)=>x.p=Math.min(.92,ex[i]/sum));const r=top.slice(0,3),rf=top.find(x=>x.d.u==="r"&&x.mc>=2&&!r.includes(x));if(rf)r[2]=rf;return r}
function say(text){if(!syn)return;syn.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=$("lang").value;u.rate=.95;
 const vs=syn.getVoices(),v=vs.find(v=>v.lang.replace("_","-")===u.lang)||vs.find(v=>v.lang.startsWith(u.lang.slice(0,2)));if(v)u.voice=v;syn.speak(u)}
function speakResults(){const hi=$("lang").value==="hi-IN";
 if(!last)return say(hi?"अभी कोई परिणाम नहीं है।":"There are no results yet.");
 const t=last[0],u=UL[t.d.u];
 say(hi?`सबसे संभावित: ${t.d.n}। ${u[2]} यह निदान नहीं है, कृपया डॉक्टर से सलाह लें।`:`Top matches: ${last.map(x=>x.d.n+", "+Math.round(x.p*100)+" percent").join(". Then ")}. Urgency: ${u[0]}. ${u[1]} This is not a diagnosis. Please confirm with a doctor.`)}
function setStatus(t){$("status").textContent=t}
function copySum(){if(!last)return;const t="SBDPS result\nSymptoms: "+[...sel].map(en).join(", ")+"\n"+last.map((x,i)=>(i+1)+". "+x.d.n+" ("+Math.round(x.p*100)+"% match, "+UL[x.d.u][0]+")").join("\n")+"\nNot a diagnosis. Please consult a doctor.";
 try{navigator.clipboard.writeText(t).then(()=>setStatus("Summary copied."),()=>setStatus("Couldn’t copy."))}catch(e){setStatus("Couldn’t copy.")}}
async function show(){const out=$("out");
 if(!sel.size){out.innerHTML='<div class="empty"><b>🤔</b>I couldn’t find any symptoms. Try words like “fever”, “bukhar” or “pet dard”, or pick from the list.</div>';last=null;return}
 const r=await getPred();last=r;const wu=r.some(x=>x.d.u==="r"&&x.mc>=2&&x.p>.2)||[...sel].some(c=>EMERG.includes(c))?"r":r.some(x=>x.d.u==="y")?"y":"g",IC={g:"✓",y:"!",r:"▲"};
 let h=`<div class="ov ${wu}"><span class="oi">${IC[wu]}</span><div><b>${{g:"Home care may be enough",y:"Please see a doctor",r:"Seek medical help now"}[wu]}</b><small>Based on the most urgent result</small></div></div>`;
 r.forEach((x,i)=>{const u=UL[x.d.u],p=Math.round(x.p*100),lv=x.s>=.6?"Strong match":x.s>=.4?"Good match":"Possible match";
  h+=`<article class="res" style="animation-delay:${i*.12}s"><div class="rk">${i+1}</div><div class="head"><div><h3>${x.d.n}</h3><span class="cat">${x.d.c} · ${lv}</span></div><span class="u ${x.d.u}">${IC[x.d.u]} ${u[0]}</span></div>
  <div class="pc"><div class="track" role="img" aria-label="${p} percent match"><i style="width:${Math.max(5,p)}%"></i></div><b>${p}%</b></div>
  <div class="more"><p>${x.d.d}</p><p>${x.m.map(c=>'<span class="m">'+nm(c)+'</span>').join("")}</p>${i===0?`<p class="next"><b>What to do:</b> ${u[1]}</p>`:""}</div></article>`});
 h+=`<div class="act"><button class="bt" id="rd">🔊 Read aloud</button><button class="bt" id="cp">📋 Copy summary</button><a class="bt" href="tel:14555">Ayushman Bharat 14555</a><a class="bt sos" href="tel:108">Ambulance 108</a></div>`;
 saveH(r);out.innerHTML=h;$("rd").onclick=speakResults;$("cp").onclick=copySum;if(autoSpeak)speakResults();
 if(matchMedia("(max-width:920px)").matches)$("resbox").scrollIntoView({behavior:"smooth",block:"start"})}
function analyse(){try{extract($("txt").value).forEach(c=>sel.add(c));render();
 $("out").innerHTML='<div class="empty"><b>⏳</b>Analysing your symptoms…</div>';setTimeout(()=>{show().catch(()=>{$("out").innerHTML='<div class="empty">Something went wrong. Please try again.</div>'})},350)}catch(e){$("out").innerHTML='<div class="empty">Something went wrong. Please try again.</div>'}}
function startVoice(){
 if(!SR){setStatus("Voice input isn’t supported in this browser. Use Chrome, Edge or Safari, or type your symptoms.");showNote();return}
 if(blocked()){setStatus("The microphone can’t be used inside this embedded preview. See the options below.");showNote();return}
 if(listening){rec&&rec.stop();return}
 syn&&syn.cancel();rec=new SR();rec.lang=$("lang").value;rec.interimResults=true;rec.continuous=false;let fin="";const base=$("txt").value.trim();
 rec.onstart=()=>{listening=true;$("mic").classList.add("on");$("wave").classList.add("on");$("mic").setAttribute("aria-pressed","true");setStatus("Listening… describe how you feel.")};
 rec.onresult=e=>{let it="";fin="";for(const r of e.results){if(r.isFinal)fin+=r[0].transcript;else it+=r[0].transcript}$("txt").value=(base+" "+fin+it).trim()};
 rec.onerror=e=>{if(e.error==="not-allowed"||e.error==="service-not-allowed"){setStatus("Microphone permission was denied.");showNote()}else setStatus(e.error==="no-speech"?"I didn’t hear anything. Tap the mic and try again.":e.error==="network"?"Couldn’t reach the speech service. Check your internet connection.":"Voice band ho gaya ("+e.error+"). Likh sakte ho.")};
 rec.onend=()=>{listening=false;$("mic").classList.remove("on");$("wave").classList.remove("on");$("mic").setAttribute("aria-pressed","false");
  const cmd=fin.toLowerCase().trim();
  if(/^(clear|reset|start over|saaf karo|हटाओ)/.test(cmd)){clearAll();setStatus("Cleared. Tap the mic to start again.");return}
  if(/(read (it )?(out|aloud)|sunao|bolo)/.test(cmd)&&last){$("txt").value=base;speakResults();setStatus("Reading your results.");return}
  if(fin){setStatus("Got it. Tap the mic again to add more symptoms.");analyse()}else if($("status").textContent.startsWith("Sun"))setStatus("Tap the mic and speak.")};
 try{rec.start()}catch(e){setStatus("Couldn’t start the microphone. Please try again.");showNote()}}
function clearAll(){sel.clear();$("txt").value="";last=null;$("out").innerHTML=EMPTY;syn&&syn.cancel();render()}
function loadH(){try{return JSON.parse(localStorage.getItem("sbdps_h")||"[]")}catch(e){return[]}}
function saveH(r){try{const k=[...sel].sort().join(),h=loadH().filter(x=>[...x.s].sort().join()!==k);h.unshift({t:Date.now(),s:[...sel],n:r[0].d.n,u:r[0].d.u});localStorage.setItem("sbdps_h",JSON.stringify(h.slice(0,5)))}catch(e){}drawH()}
function drawH(){const h=loadH(),b=$("hist");if(!h.length){b.hidden=true;return}b.hidden=false;
 $("hl").innerHTML=h.map((x,i)=>`<button class="hi" data-i="${i}"><span class="dot ${x.u}"></span><span><b>${x.n}</b><small>${x.s.map(c=>H[c]).join(", ")} · ${new Date(x.t).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</small></span></button>`).join("");
 $("hl").querySelectorAll(".hi").forEach(el=>el.onclick=()=>{const x=h[el.dataset.i];sel.clear();x.s.forEach(c=>sel.add(c));render();analyse()})}
$("hc").onclick=()=>{try{localStorage.removeItem("sbdps_h")}catch(e){}drawH()};
$("mic").onclick=startVoice;$("go").onclick=analyse;$("clr").onclick=clearAll;$("q").oninput=drawList;
$("kb").onclick=()=>{$("txt").focus();setStatus("Now dictate with your keyboard’s mic, then press Check symptoms.")};
$("nt").onclick=()=>{try{window.open(location.href,"_blank")}catch(e){}};
$("speakT").onclick=e=>{autoSpeak=!autoSpeak;e.currentTarget.setAttribute("aria-pressed",autoSpeak);if(!autoSpeak&&syn)syn.cancel()};
$("theme").onclick=()=>{const d=document.documentElement,dark=d.dataset.theme?d.dataset.theme==="dark":matchMedia("(prefers-color-scheme:dark)").matches;d.dataset.theme=dark?"light":"dark"};
$("txt").addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey))analyse()});
EX.forEach(t=>{const b=document.createElement("button");b.textContent=t;b.onclick=()=>{$("txt").value=t;analyse()};$("ex").appendChild(b)});
if(!SR)setStatus("Voice input isn’t supported in this browser. Please type or pick symptoms.");
/* ---- Backend integration: Flask API with offline fallback ---- */
const API=location.protocol==="file:"?"http://localhost:5000":"";
function setEngine(t,ok){const e=$("engine");if(e){e.textContent=t;e.className="eng"+(ok?" ok":"")}}
async function getPred(){
 try{const res=await fetch(API+"/api/predict",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({symptoms:[...sel]})});
  if(!res.ok)throw new Error("api");const j=await res.json();
  setEngine("Engine: "+j.model_label+" · Flask API",true);
  return j.predictions.map(p=>({d:{n:p.disease,c:p.category,u:{low:"g",medium:"y",high:"r"}[p.urgency],d:p.description},m:p.matched,mc:p.matched.length,s:p.match_score,p:p.probability}))}
 catch(e){setEngine("Engine: offline browser model (backend not reachable)",false);return predict()}}
async function pingEngine(){try{const j=await (await fetch(API+"/api/health")).json();setEngine("Engine: "+j.model_label+" · Flask API",true)}catch(e){setEngine("Engine: offline browser model (backend not reachable)",false)}}
$("out").innerHTML=EMPTY;render();drawH();pingEngine();
