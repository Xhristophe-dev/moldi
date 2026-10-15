/* ===== Simulado: prova com tempo, nota final e explicação de cada erro =====
   Usa as funções do app.js (cards, TOP, shuf, fmt, bump, toast, esc, ic, mk, save, dk) e é carregado depois dele. */
let SM=null,SIMH=[],SMT=0,SIMSET={src:'',n:10,sec:60};
try{const h=JSON.parse(localStorage.getItem('estudofacil.simh')||'[]');if(Array.isArray(h))SIMH=h}catch(e){}
/* simulado em andamento fica salvo: se o celular recarregar a página no meio da prova, ela continua (o relógio segue correndo) */
try{const x=JSON.parse(localStorage.getItem('estudofacil.sim')||'null');if(x&&Array.isArray(x.q)&&x.q.length&&!x.done){SM=x;QM='sim'}}catch(e){}
const saveSH=()=>{try{localStorage.setItem('estudofacil.simh',JSON.stringify(SIMH.slice(0,30)))}catch(e){}};
const saveSM=()=>{try{if(SM&&!SM.done)localStorage.setItem('estudofacil.sim',JSON.stringify(SM));else localStorage.removeItem('estudofacil.sim')}catch(e){}};
function simReset(){clearInterval(SMT);SM=null;SIMH=[];saveSM();saveSH();QM='treino'}

/* abas Treino / Simulado, no topo da aba Quiz */
const simTabs=()=>`<div class="seg" role="group" aria-label="Modo do quiz"><button class="${QM==='treino'?'on':''}" onclick="QM='treino';go('quiz')">Treino</button><button class="${QM==='sim'?'on':''}" onclick="QM='sim';render()">Simulado${SM&&!SM.done?' ●':''}</button></div>`;

/* ---------- questões ---------- */
/* embaralha as alternativas e leva junto o "correta" e o "porque" de cada uma */
function simMix(q){const p=shuf([...Array(q.opcoes.length).keys()]);return{p:q.p,opcoes:p.map(i=>q.opcoes[i]),correta:p.indexOf(q.correta),explicacao:q.explicacao||'',porque:p.map(i=>(q.porque||[])[i]||''),src:q.src||''}}
const simCardsOk=()=>new Set(cards.map(c=>c.a)).size>=2;
/* chaves: all (tudo), cards (todos os cartões), cat:Matéria, top:N (estudo de índice N) */
function simPool(k){const out=[],tq=i=>TOP[i]&&TOP[i].quiz.forEach(q=>out.push({...q,src:TOP[i].titulo})),
cq=cat=>cards.filter(c=>!cat||c.cat===cat).forEach(c=>{const ds=[...new Set(cards.filter(x=>x.a!==c.a).sort((x,y)=>(y.cat===c.cat)-(x.cat===c.cat)||Math.random()-.5).map(x=>x.a))].slice(0,3);if(ds.length)out.push({p:c.q,opcoes:[c.a,...ds],correta:0,explicacao:'',porque:[],src:c.cat})});
if(k==='all'){TOP.forEach((t,i)=>tq(i));if(simCardsOk())cq('')}else if(k==='cards'){if(simCardsOk())cq('')}else if(k.startsWith('cat:')){if(simCardsOk())cq(k.slice(4))}else if(k.startsWith('top:'))tq(+k.slice(4));return out}
function simSources(){const o=[],tops=TOP.map((t,i)=>[t,i]).filter(([t])=>t.quiz.length),nc=simCardsOk()?cards.length:0;
if(tops.length&&nc)o.push(['all','Tudo misturado (estudos e cartões)',tops.reduce((n,[t])=>n+t.quiz.length,0)+nc]);
tops.forEach(([t,i])=>o.push(['top:'+i,'Estudo: '+t.titulo,t.quiz.length]));
if(nc){o.push(['cards','Cartões: todas as matérias',nc]);const cs=[...new Set(cards.map(c=>c.cat))];if(cs.length>1)cs.forEach(c=>o.push(['cat:'+c,'Cartões: '+c,cards.filter(x=>x.cat===c).length]))}
return o}

/* ---------- andamento ---------- */
function simStart(list,label){const src=simSources().find(s=>s[0]===SIMSET.src),n=SIMSET.n;
const qs=list||shuf(simPool(SIMSET.src)).slice(0,n>0?n:undefined).map(simMix);
if(!qs.length){toast('Não há questões suficientes nessa fonte');return}
const now=Date.now();SM={q:qs,a:qs.map(()=>null),i:0,sec:SIMSET.sec,t0:now,end:SIMSET.sec?now+qs.length*SIMSET.sec*1000:0,done:false,src:label||(src?src[1]:'Simulado'),f:'err'};
saveSM();vSim()}
function simTick(){clearInterval(SMT);if(!SM||SM.done||!SM.end)return;
SMT=setInterval(()=>{if(!SM||SM.done){clearInterval(SMT);return}const r=SM.end-Date.now(),e=document.getElementById('simt');
if(e){e.textContent=fmt(Math.max(0,Math.ceil(r/1000)));e.classList.toggle('low',r<60000)}if(r<=0){clearInterval(SMT);simEnd(true)}},500)}
const simGo=i=>{SM.i=Math.max(0,Math.min(SM.q.length-1,i));saveSM();vSim()};
const simPick=j=>{SM.a[SM.i]=j;saveSM();vSim()};
function simFin(){const b=SM.a.filter(x=>x==null).length;if(b&&!confirm('Você deixou '+b+(b===1?' questão em branco':' questões em branco')+'. Finalizar mesmo assim?'))return;simEnd()}
function simEnd(auto){if(!SM||SM.done)return;clearInterval(SMT);SM.done=true;
const fim=SM.end?Math.min(Date.now(),SM.end):Date.now(),ok=SM.q.filter((q,i)=>SM.a[i]===q.correta).length,ans=SM.a.filter(x=>x!=null).length;
SM.ok=ok;SM.ans=ans;SM.used=Math.max(0,Math.round((fim-SM.t0)/1000));SM.f=ans>ok||ans<SM.q.length?'err':'all';
SIMH.unshift({d:dk(),l:SM.src.slice(0,60),n:SM.q.length,ok,u:SM.used,sec:SM.sec});saveSH();
window.petEvt&&petEvt('sim',ok,SM.q.length); /* XP do Moldi pelo simulado */
if(ans)bump(d=>d.rev+=ans); /* responder questões conta como estudo do dia, igual ao treino */
saveSM();if(auto)toast('Tempo esgotado: simulado finalizado');if(tab==='quiz'&&QM==='sim')vSim()}
function simNew(){clearInterval(SMT);SM=null;saveSM();vSim()}
function simRetry(){const bad=SM.q.filter((q,i)=>SM.a[i]!==q.correta);if(!bad.length)return;simStart(bad.map(simMix),SM.src.replace(/ · só as erradas$/,'')+' · só as erradas')}
/* cria cartões com as questões que você errou ou deixou em branco (sem repetir os que já existem) */
function simCards(){const bad=SM.q.filter((q,i)=>SM.a[i]!==q.correta);let n=0;
bad.forEach(q=>{if(cards.some(c=>c.q===q.p))return;const a=q.opcoes[q.correta]+(q.explicacao&&q.explicacao.length<=160?' — '+q.explicacao:'');cards.push(mk(q.p,a,'Simulado',n++))});
if(!n){toast('Esses cartões já existem');return}save();toast(n+(n===1?' cartão criado':' cartões criados')+' na matéria Simulado')}
/* botão "Fazer simulado" dentro de um estudo (aba Aprender) */
function simFrom(i){if(!(SM&&!SM.done)){SM=null;saveSM();SIMSET.src='top:'+i;SIMSET.n=0}QM='sim';go('quiz')}
const simFlip=()=>{SM.f=SM.f==='all'?'err':'all';vSim()};

/* ---------- telas ---------- */
function vSim(){
if(SM&&!SM.done&&SM.end&&Date.now()>=SM.end){simEnd(true);return}
if(SM&&SM.done)return simResult();
if(SM)return simRun();
return simSetup()}
function simSetup(){const so=simSources(),tg=simTabs();
if(!so.length){$('#view').innerHTML=tg+`<div class="box"><h2>Simulado</h2>Para fazer um simulado você precisa de cartões (com respostas diferentes) ou de um estudo com quiz criado na aba Aprender.<button class="btn" style="margin-top:12px" onclick="go('learn')">Criar um estudo com IA</button><button class="btn gh" style="margin-top:8px" onclick="go('cards')">Criar cartões</button></div>`;return}
if(!so.find(s=>s[0]===SIMSET.src))SIMSET.src=so[0][0];
const av=so.find(s=>s[0]===SIMSET.src)[2],ns=[5,10,15,20,30].filter(x=>x<av),n=SIMSET.n>0&&SIMSET.n<av?SIMSET.n:0,cnt=n||av,
TS=[[0,'Sem limite de tempo'],[30,'30 segundos por questão'],[45,'45 segundos por questão'],[60,'1 minuto por questão'],[90,'1 min 30 s por questão'],[120,'2 minutos por questão']];
const hist=SIMH.slice(0,5).map(h=>{const d=String(h.d).split('-');return `<div class="sh1"><span>${d[2]}/${d[1]} · ${esc(h.l)}</span><b>${h.ok}/${h.n} (${Math.round(h.ok/h.n*100)}%)</b></div>`}).join('');
$('#view').innerHTML=tg+`<div class="box"><h2>${ic('timer',20)} Simulado</h2><div class="mut" style="margin-bottom:10px">Responda no tempo, sem ver o certo ou o errado. No final você vê a nota e a explicação de cada erro.</div>
<div class="mut">Perguntas de</div><select aria-label="Fonte das perguntas" onchange="SIMSET.src=this.value;SIMSET.n=0;vSim()">${so.map(s=>`<option value="${esc(s[0])}"${s[0]===SIMSET.src?' selected':''}>${esc(s[1])} (${s[2]})</option>`).join('')}</select>
<div class="mut">Quantidade de questões</div><select aria-label="Quantidade de questões" onchange="SIMSET.n=+this.value;vSim()">${ns.map(x=>`<option value="${x}"${x===n?' selected':''}>${x}</option>`).join('')}<option value="0"${!n?' selected':''}>Todas (${av})</option></select>
<div class="mut">Tempo</div><select aria-label="Tempo do simulado" onchange="SIMSET.sec=+this.value;vSim()">${TS.map(([v,l])=>`<option value="${v}"${v===SIMSET.sec?' selected':''}>${l}</option>`).join('')}</select>
<div class="mut" style="margin:2px 0 12px">${SIMSET.sec?'Tempo total: <b>'+fmt(cnt*SIMSET.sec)+'</b> para '+cnt+(cnt===1?' questão':' questões'):cnt+(cnt===1?' questão, sem cronômetro':' questões, sem cronômetro')}</div>
<button class="btn" onclick="simStart()">Começar simulado</button></div>${hist?`<div class="box"><h2>Últimos simulados</h2>${hist}</div>`:''}`}
function simRun(){const q=SM.q[SM.i],n=SM.q.length,r=SM.end?Math.max(0,Math.ceil((SM.end-Date.now())/1000)):0;
$('#view').innerHTML=`<div class="sim-h"><span class="mut">Questão ${SM.i+1} de ${n}</span>${SM.end?`<span id="simt" class="simt${r<60?' low':''}" role="timer" aria-label="Tempo restante">${fmt(r)}</span>`:'<span class="simt" aria-label="Sem limite de tempo">sem limite</span>'}</div>
<div class="bar"><i style="width:${Math.round((SM.i+1)/n*100)}%"></i></div>
<div class="box"><b>${esc(q.p)}</b></div>
${q.opcoes.map((o,j)=>`<button class="opt${SM.a[SM.i]===j?' sel':''}" aria-pressed="${SM.a[SM.i]===j}" onclick="simPick(${j})">${esc(o)}</button>`).join('')}
<div class="row" style="margin-top:4px"><button class="btn gh" ${SM.i?'':'disabled'} onclick="simGo(${SM.i-1})">‹ Anterior</button>${SM.i<n-1?`<button class="btn" onclick="simGo(${SM.i+1})">Próxima ›</button>`:`<button class="btn" onclick="simFin()">Finalizar</button>`}</div>
<div class="simmap" aria-label="Ir para a questão">${SM.q.map((_,k)=>`<button class="${k===SM.i?'cur':''}${SM.a[k]!=null?' done':''}" aria-label="Questão ${k+1}${SM.a[k]!=null?', respondida':''}" onclick="simGo(${k})">${k+1}</button>`).join('')}</div>
<button class="lnk" onclick="simFin()">Finalizar agora</button>`;simTick()}
function simItem(q,i){const a=SM.a[i],ok=a===q.correta,st=a==null?'blank':ok?'ok':'bad';
return `<details class="sri ${st}"${st!=='ok'?' open':''}><summary><span class="ico" aria-hidden="true">${st==='ok'?'✓':st==='bad'?'✗':'○'}</span> ${i+1}. ${esc(q.p)}</summary>${q.opcoes.map((o,j)=>`<div class="ro${j===q.correta?' right':j===a?' wrong':''}">${esc(o)}${j===a?' <small>(sua resposta)</small>':''}</div>`).join('')}<div class="why">${qExpl(q,a)}</div></details>`}
function simResult(){const n=SM.q.length,pct=Math.round(SM.ok/n*100),blank=n-SM.ans,wrong=SM.ans-SM.ok,miss=wrong+blank,
msg=pct>=80?'Muito bem!':pct>=60?'Bom resultado!':'Dá para melhorar: veja os erros abaixo.',
lista=SM.q.map((q,i)=>[q,i]).filter(([q,i])=>SM.f==='all'||SM.a[i]!==q.correta);
$('#view').innerHTML=simTabs()+`<div class="box q">${ic('check',32)} Simulado finalizado<span class="mut">${esc(SM.src)}</span>
<div class="sum"><div><b>${SM.ok}/${n}</b><span>acertos</span></div><div><b>${pct}%</b><span>nota</span></div><div><b>${fmt(SM.used)}</b><span>${SM.sec?'de '+fmt(n*SM.sec):'tempo'}</span></div></div>
<span class="mut">${wrong} ${wrong===1?'errada':'erradas'} · ${blank} em branco</span><span>${msg}</span></div>
${miss?`<button class="btn" onclick="simRetry()">Refazer só as que errei (${miss})</button><button class="btn gh" style="margin-top:8px" onclick="simCards()">Criar cartões das que errei</button>`:''}
<button class="btn gh" style="margin:8px 0 14px" onclick="simNew()">Novo simulado</button>
<div class="sim-h"><b>Revisão</b>${miss?`<button class="lnk" onclick="simFlip()">${SM.f==='all'?'Mostrar só os erros':'Mostrar todas'}</button>`:''}</div>
${lista.map(([q,i])=>simItem(q,i)).join('')||'<div class="box">Você acertou tudo!</div>'}`}