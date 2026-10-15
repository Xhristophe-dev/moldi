/* Moldi, o pet (etapa 1): fica no canto da tela (menos na aba Moldi, onde aparece grande). Massa em SVG, XP, nível, humores e eventos.
   Ligações no app.js: petEvt(tipo), vPet() (aba), petSync() (a cada render), petReset(), petImport(obj) e a variável PET (backup).
   Eventos: 'card' (id) | 'plano' (chave da sessão) | 'quiz' | 'oops' | 'sim' (acertos, total) | 'foco' | 'estudo' | 'meta'
   Regras: sem punição (nada de fome ou morte; quem some só deixa ele dormindo), teto diário por fonte
   e cada cartão rende XP uma única vez por dia. Estado só neste aparelho (chave estudofacil.pet). */
const PTEST=true; /* true = painel com botões de teste (XP, nível, cor, humor). Troque para false antes de publicar. */
let PET=null,PETM={m:'',t:0,s:''}; /* PETM = humor temporário (só em memória) */
const PETKEY='estudofacil.pet';
/* cores = as mesmas massas dos cards: c = massa, d = tom escuro (bochechas), e = olhos e boca */
const PETPAL=[{c:'#F4B6A3',d:'#E08C74',e:'#2A1710'},{c:'#4169E1',d:'#2B4DB8',e:'#FFFFFF'},{c:'#7FCBA1',d:'#55AB7D',e:'#102A1B'},{c:'#7C97F0',d:'#5876D6',e:'#101736'}];
const PETCAP={card:40,quiz:30,sim:60,foco:60,estudo:20,plano:45,meta:20}; /* teto de XP por dia em cada fonte */
const PETFORM=[[1,'Gotinha'],[3,'Massinha'],[6,'Topetinho'],[10,'Orelhudo'],[15,'Realeza']]; /* nível em que cada forma aparece */
const PETSRC=[['card','cards','Cartões revisados','+2 por cartão, uma vez por dia em cada um'],['quiz','quiz','Acertos no quiz','+3 por acerto'],['sim','target','Simulados','10 a 30 conforme a nota'],['foco','timer','Ciclos de foco','+15 por ciclo de 25 min'],['estudo','spark','Estudos criados','+10 por estudo na aba Aprender'],['plano','cal','Sessões do plano','+15 por sessão concluída, uma vez por dia em cada'],['meta','check','Meta do dia','+20 ao bater a meta']];
const PETSAY={dormindo:['Zzz… sem pressa, eu fico aqui quietinho.','Zzz… quando você quiser, a gente volta com calma.','Zzz… sonhando com flashcards.'],feliz:['Hoje já rendeu! Cada cartão conta.','Estou feliz de estudar com você.','Mais um pouquinho de cada vez, e pronto!','Gosto de ver você por aqui.'],neutro:['Que tal revisar um cartão para começar?','Estou aqui. Vamos juntos?','Um cicloinho de foco cairia bem.','Sem pressa, no seu ritmo.'],comemorando:['Eba! Você é demais!','Que orgulho de você!'],pensando:['Hmm… errar também ensina.','Vamos olhar de novo com calma?']};
const petName=()=>{try{return(PF.name||'').trim()}catch(e){return''}};
const petDef=()=>({v:1,xp:0,coins:0,last:0,day:'',g:{},u:[],hist:{},col:0,inv:[],eq:{}});
const petDay=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
const petNum=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5);
const petPick=a=>a[Math.floor(Math.random()*a.length)];
function petSave(){try{localStorage.setItem(PETKEY,JSON.stringify(PET))}catch(e){window.saveFail&&saveFail()}}
/* carrega e também valida o que vem do backup (nada de confiar em números ou textos de fora) */
function petImport(o,quiet){const d=petDef();
if(o&&typeof o==='object'){const n=(v,m=1e9)=>Math.min(m,Math.max(0,Math.floor(+v)||0));
d.xp=n(o.xp);d.coins=n(o.coins);d.last=n(o.last);d.day=String(o.day||'').slice(0,12);d.col=n(o.col,PETPAL.length-1);
if(o.g&&typeof o.g==='object')for(const k in PETCAP)d.g[k]=n(o.g[k],PETCAP[k]);
if(Array.isArray(o.u))d.u=o.u.filter(x=>typeof x==='number'||typeof x==='string').slice(0,500);
if(o.hist&&typeof o.hist==='object')for(const k of Object.keys(o.hist).slice(-30))d.hist[String(k).slice(0,12)]=n(o.hist[k],99999);
if(Array.isArray(o.inv))d.inv=o.inv.map(x=>String(x).slice(0,24)).slice(0,60);
if(o.eq&&typeof o.eq==='object')for(const k of ['hat','glasses'])if(o.eq[k])d.eq[k]=String(o.eq[k]).slice(0,24)}
PET=d;PETM.t=0;if(!quiet)petSave()}
function petReset(){PET=petDef();PETM.t=0;petSave()}
(function(){let o=null;try{o=JSON.parse(localStorage.getItem(PETKEY)||'null')}catch(e){}petImport(o,1)})();
/* nível: do 1 para o 2 faltam 40 XP e cada nível seguinte pede 20 a mais */
const petCum=l=>40*(l-1)+10*(l-1)*(l-2),petNeed=l=>40+20*(l-1);
function petLvl(xp){let l=1;while(xp>=petCum(l+1))l++;return l}
function petInfo(){const l=petLvl(PET.xp),h=PET.xp-petCum(l),n=petNeed(l);return{l,have:h,need:n,pct:Math.round(h/n*100)}}
const petStage=l=>PETFORM.filter(f=>l>=f[0]).length-1;
function petRoll(){const k=petDay();if(PET.day!==k){PET.day=k;PET.g={};PET.u=[]}}
const petIdle=()=>PET.last?petNum()-PET.last:0;
function petMood(){if(PETM.t>Date.now())return PETM.m;if(petIdle()>=3)return'dormindo';return PET.day===petDay()&&Object.values(PET.g).some(v=>v>0)?'feliz':'neutro'}
const petSay=(m,fresh)=>{if(PETM.t>Date.now()&&PETM.s&&PETM.m===m&&!fresh)return PETM.s;let t=petPick(PETSAY[m]||PETSAY.neutro);const n=petName();if(n&&m!=='comemorando'&&Math.random()<.5)t='Oi, '+n+'! '+t;return t};
const petSk=()=>typeof streak==='function'&&typeof studied==='function'?streak(studied):0;
/* ---------- o desenho: só formas chapadas, uns 2 KB por humor ---------- */
function petSvg(mood){const i=petInfo(),s=petStage(i.l),p=PETPAL[PET.col]||PETPAL[0],c=p.c,d=p.d,e=p.e,ps=Math.min(1.12,.8+(i.l-1)*.02).toFixed(2),
body=s===0?'M100 22C108 44 160 74 160 120C160 152 134 166 100 166C66 166 40 152 40 120C40 74 92 44 100 22Z':'M100 36C148 36 184 72 184 120C184 152 152 166 100 166C48 166 16 152 16 120C16 72 52 36 100 36Z',
st=(w=5)=>'fill="none" stroke="'+e+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"';
let bk='',fr='',f='';
if(s>=3)bk=`<circle cx="42" cy="58" r="17" fill="${c}"/><circle cx="158" cy="58" r="17" fill="${c}"/><circle cx="42" cy="58" r="8" fill="${d}"/><circle cx="158" cy="58" r="8" fill="${d}"/>`;
if(s===4)fr+=`<path d="M72 46L78 20L90 34L100 14L110 34L122 20L128 46Z" fill="#F2C14E"/><circle cx="100" cy="38" r="4" fill="${d}"/>`;
else if(s>=2)fr+=`<path d="M100 12C108 26 114 32 100 42C86 32 92 26 100 12Z" fill="${c}"/>`;
if(s>=1)fr+=`<ellipse cx="50" cy="128" rx="12" ry="7" fill="${d}" opacity=".5"/><ellipse cx="150" cy="128" rx="12" ry="7" fill="${d}" opacity=".5"/>`;
if(s>=3)fr+='<ellipse cx="100" cy="152" rx="30" ry="11" fill="#fff" opacity=".22"/>';
fr+=`<path d="${s?'M44 90Q52 66 80 56':'M60 98Q64 80 84 70'}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="8" stroke-linecap="round"/>`;
const eyes=(dx,dy)=>`<g class="pe" fill="${e}"><ellipse cx="${78+dx}" cy="${106+dy}" rx="7.5" ry="10"/><ellipse cx="${122+dx}" cy="${106+dy}" rx="7.5" ry="10"/><circle cx="${80.5+dx}" cy="${102+dy}" r="2.6" fill="#fff"/><circle cx="${124.5+dx}" cy="${102+dy}" r="2.6" fill="#fff"/></g>`,
star=(x,y,z)=>`<g transform="translate(${x} ${y}) scale(${z})"><path class="psp" d="M0-9L2.6-2.6L9 0L2.6 2.6L0 9L-2.6 2.6L-9 0L-2.6-2.6Z" fill="#F2C14E"/></g>`;
if(mood==='dormindo')f=`<path d="M68 108Q78 117 88 108M112 108Q122 117 132 108" ${st()}/><ellipse cx="100" cy="130" rx="5" ry="4" fill="${e}"/><text class="pzz" x="150" y="46" font-size="22" font-weight="800" style="fill:var(--mut)">z</text><text class="pzz" x="168" y="26" font-size="16" font-weight="800" style="fill:var(--mut);animation-delay:.8s">z</text>`;
else if(mood==='comemorando')f=`<path d="M68 111Q78 98 88 111M112 111Q122 98 132 111" ${st()}/><path d="M84 122Q100 154 116 122Z" fill="${e}"/><path d="M92 140Q100 133 108 140Q100 148 92 140Z" fill="${d}"/>${star(24,44,1.1)}${star(178,36,1.3)}${star(170,92,.8)}${star(30,98,.7)}`;
else if(mood==='pensando')f=eyes(3,-3)+`<path d="M110 86Q122 78 134 86" ${st(4)}/><path d="M88 128q6-6 12 0t12 0" ${st()}/><circle cx="150" cy="52" r="3.5" style="fill:var(--soft2)"/><circle cx="160" cy="42" r="5" style="fill:var(--soft2)"/><circle cx="176" cy="24" r="14" style="fill:var(--soft2)"/><text x="176" y="30" text-anchor="middle" font-size="18" font-weight="800" style="fill:var(--tx)">?</text>`;
else f=eyes(0,0)+(mood==='feliz'?`<path d="M86 124Q100 140 114 124" ${st()}/>`:`<path d="M90 128H110" ${st()}/>`);
return `<svg class="pet-svg" viewBox="0 0 200 180" role="img" aria-label="Moldi, nível ${i.l}, ${mood}" style="--ps:${ps}"><ellipse cx="100" cy="170" rx="64" ry="7" fill="#000" opacity=".12"/>${bk}<path d="${body}" fill="${c}"/>${fr}${f}</svg>`}
function petEl(m,fn){if(m==='comemorando')setTimeout(()=>document.querySelectorAll('.pet.cheer').forEach(x=>x.classList.remove('cheer')),1600);
const i=petInfo();return `<div class="pet${m==='comemorando'?' cheer':''}" role="button" tabindex="0" aria-label="Moldi, nível ${i.l}. Tocar para ele falar" onclick="${fn}(this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();${fn}(this)}">${petSvg(m)}</div>`}
const petG=id=>document.getElementById(id);
function petJelly(el){el.classList.remove('jl');void el.offsetWidth;el.classList.add('jl');clearTimeout(el._j);el._j=setTimeout(()=>el.classList.remove('jl'),650)}
/* ---------- o Moldi no canto da tela: aparece em todas as telas, menos na aba dele (para não duplicar) ---------- */
function petBuild(){if(petG('pw'))return;const w=document.createElement('div');w.id='pw';w.innerHTML='<div id="ps" role="status" hidden></div><div id="pa"></div>';document.body.appendChild(w);petPaint();petSync()}
function petPaint(){const a=petG('pa');if(!a)return;petRoll();a.innerHTML=petEl(petMood(),'petSayW')}
function petSync(){const w=petG('pw');if(!w)return;const on=typeof tab!=='undefined'&&tab==='pet';w.hidden=on;if(on)petG('ps').hidden=true}
/* tocar no pet do canto: ele balança e fala uma frase que some sozinha em 5 segundos */
function petSayW(el){petJelly(el);petSpeak(petSay(petMood(),1),5000)}
function petSpeak(t,ms){const e=petG('ps');if(!e)return;e.textContent=t;e.hidden=false;clearTimeout(petSpeak.t);petSpeak.t=setTimeout(()=>{e.hidden=true},ms||5000)}
/* na aba Moldi a frase aparece abaixo do nível e também some em 5 segundos */
function petSayT(el){petJelly(el);const t=document.querySelector('[data-say]');if(!t)return;t.textContent=petSay(petMood(),1);clearTimeout(petSayT.t);petSayT.t=setTimeout(()=>{t.textContent=''},5000)}
/* ---------- aba Moldi: nome, nível, progresso do dia e (com PTEST) ferramentas de teste ---------- */
function vPet(){petRoll();const m=petMood(),i=petInfo(),st=petStage(i.l),sk=petSk(),hoje=Object.values(PET.g).reduce((a,b)=>a+b,0),nx=PETFORM[st+1],bonus=Math.min(sk,10)*5,B=(t,l)=>`<button class="chip" onclick="petTest('${t}')">${l}</button>`;
$('#view').innerHTML=`<section class="box pet-main">${petEl(m,'petSayT')}<div class="pt"><h2>Moldi</h2><span class="mut">Nível ${i.l} · forma ${PETFORM[st][1]}${nx?' · nova forma no nível '+nx[0]:' · forma máxima'}</span><div class="xpb" role="progressbar" aria-label="Experiência" aria-valuemin="0" aria-valuemax="${i.need}" aria-valuenow="${i.have}"><i style="width:${i.pct}%"></i></div><span class="mut">${i.have} / ${i.need} XP para o nível ${i.l+1}</span><div class="pchips"><span>${ic('flame',16)} ${sk} ${sk===1?'dia':'dias'}</span><span>+${hoje} XP hoje</span></div><p class="pmsg" data-say style="min-height:1.5em" aria-live="polite"></p></div></section>
<section class="box"><h2 style="margin-bottom:8px">Como você quer ser chamado?</h2><input id="pn2" value="${esc(PF.name)}" maxlength="30" placeholder="Como você quer ser chamado?" aria-label="Seu nome" oninput="PF.name=this.value.slice(0,30);savePF()"><div class="mut" style="font-size:13px;margin-top:6px">O Moldi usa seu nome nas conversas. Você também muda isso no Perfil.</div></section>
<section class="box"><h2 style="margin-bottom:4px">Como ganhar XP</h2><div class="mut" style="font-size:14px">${bonus?`Sua sequência dá <b>+${bonus}%</b> de XP. `:'Estudar em dias seguidos dá até +50% de XP. '}Cada fonte tem um teto por dia.</div><ul class="mis">${PETSRC.map(([k,ico,nm,ds])=>{const g=PET.g[k]||0,full=g>=PETCAP[k];return `<li class="${full?'ok':''}"><span>${ic(ico,18)}<span>${nm}<br><small>${ds}</small></span></span><small>${g}/${PETCAP[k]}</small></li>`}).join('')}</ul></section>
${PTEST?`<section class="box ptest"><b>Modo teste</b><div class="mut" style="margin:4px 0 8px">Use para ver as formas do Moldi. Não conta nos tetos do dia.</div><div class="pchips">${B('xp10','+10 XP')}${B('xp100','+100 XP')}${B('up','Nível +1')}${B('down','Nível −1')}${B('col','Cor')}${B('mood','Humor')}${B('zero','Zerar XP')}</div></section>`:''}
<section class="box"><div class="mut" style="font-size:14px">O Moldi nunca passa fome nem morre. Se você ficar uns dias fora, ele só dorme quietinho e te recebe feliz na volta.</div></section>`}
function petTest(a){petRoll();const l0=petLvl(PET.xp),L=['feliz','neutro','dormindo','comemorando','pensando'];
if(a==='xp10')PET.xp+=10;else if(a==='xp100')PET.xp+=100;else if(a==='up')PET.xp=petCum(l0+1);else if(a==='down')PET.xp=petCum(Math.max(1,l0-1));else if(a==='zero')PET.xp=0;
else if(a==='col')PET.col=(PET.col+1)%PETPAL.length;else if(a==='mood')PETM={m:L[(L.indexOf(petMood())+1)%L.length],t:Date.now()+10000,s:''};
const l1=petLvl(PET.xp);if(l1>l0)PETM={m:'comemorando',t:Date.now()+8000,s:'Subi para o nível '+l1+'!'};
petSave();petRefresh()}
/* atualiza na hora se o Moldi estiver visível (ex.: o Pomodoro termina com a Home aberta) */
function petRefresh(){petPaint();if(typeof tab!=='undefined'&&tab==='pet'&&typeof vPet==='function'&&!(document.activeElement&&document.activeElement.id==='pn2'))vPet()}
function petFloat(n,lv){if(!n&&!lv)return;document.querySelectorAll('.xpf').forEach(x=>x.remove());const e=document.createElement('div');e.className='xpf';e.setAttribute('role','status');e.textContent=(lv?'Nível '+lv+'! ':'')+(n?'+'+n+' XP':'');document.body.appendChild(e);setTimeout(()=>e.remove(),1400)}
/* ---------- eventos: a única porta de entrada do jogo ---------- */
function petEvt(t,a,b){try{if(!PET)return;petRoll();const idle=petIdle();let base=0,msg='',mood='comemorando',ms=15000;
switch(t){
case'card':if(PET.u.includes(a))return;PET.u.push(a);base=2;break;
case'quiz':base=3;msg=petPick(['Acertou!','Boa, é isso!','Mandou bem!']);mood='feliz';ms=4000;break;
case'oops':mood='pensando';ms=9000;msg='Tudo bem errar. Veja a resposta e siga em frente.';break; /* errar nunca tira XP */
case'sim':{const n=Math.max(1,b|0),ok=Math.max(0,a|0),r=Math.min(1,ok/n);base=n>=5?Math.round(10+20*r):ok*2;msg=r>=.7?'Que simulado! Estou orgulhoso.':'Simulado feito! Rever os erros ajuda muito.';break}
case'foco':base=Math.max(1,Math.min(15,Math.round((typeof dur==='function'?dur('foco')/60:25)*.6)));msg='Ciclo de foco concluído!';break; /* foco curtinho rende proporcionalmente */
case'plano':if(PET.u.includes(a))return;PET.u.push(a);base=15;msg='Sessão do plano concluída!';break;
case'estudo':base=10;msg='Novo estudo criado!';break;
case'meta':base=20;msg='Meta do dia batida! Que orgulho.';break;
default:return}
let gain=0;if(base>0){gain=Math.min(base,Math.max(0,PETCAP[t]-(PET.g[t]||0)));PET.g[t]=(PET.g[t]||0)+gain}
const tot=gain?Math.round(gain*(1+Math.min(petSk(),10)*.05)):0,l0=petLvl(PET.xp); /* bônus de sequência: +5% por dia, até +50% */
PET.xp+=tot;if(tot){PET.coins+=Math.max(1,Math.round(tot/3));const k=petDay();PET.hist[k]=(PET.hist[k]||0)+tot;const hk=Object.keys(PET.hist);if(hk.length>30)delete PET.hist[hk[0]]}
const l1=petLvl(PET.xp);PET.last=petNum();
if(l1>l0){mood='comemorando';ms=20000;msg='Subi para o nível '+l1+'!'}else if(idle>=3&&t!=='oops'){mood='comemorando';ms=12000;msg='Que bom que você voltou!'}
if(msg)PETM={m:mood,t:Date.now()+ms,s:msg};
petSave();petFloat(tot,l1>l0?l1:0);petRefresh();if(msg)petSpeak(msg,5000)}catch(e){}}

if(document.body)petBuild();else addEventListener('DOMContentLoaded',petBuild);