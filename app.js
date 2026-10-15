try{['cards','v2','theme','aim'].forEach(k=>{const o='estudo_'+k,n='estudofacil.'+k;if(localStorage.getItem(n)===null&&localStorage.getItem(o)!==null)localStorage.setItem(n,localStorage.getItem(o))})}catch(e){}
const TABS=[['home','Início','home'],['learn','Aprender','book'],['plan','Plano','cal'],['cards','Criar','pen'],['study','Estudar','cards'],['quiz','Quiz','quiz'],['math','Matemática','math'],['pomo','Pomodoro','timer'],['pet','Moldi','spark'],['profile','Perfil','user']];
const MODES=[['foco','Foco'],['curta','Pausa curta'],['longa','Pausa longa']];
const DAYS=[0,1,3,7,14,30],MC={foco:'var(--ac)',curta:'var(--ok)',longa:'#9DB4F2'},MT={foco:'var(--act)',curta:'var(--onp)',longa:'var(--onp)'};
let q2='',edId=null,PV=null,lastCat='',catF='',cards=[],tab='home',cur=null,shown=false,ses={g:0,n:0,hit:0,p:0},UNDO=null,FR=null,EDC=false,Q=[],quiz=null,score={ok:0,n:0};
let T={foco:25,curta:5,longa:15},M=10,L={},NEWMAX=20,NX=0,NXd=0;
let P={mode:'foco',left:25*60,running:false,end:0};
/* ===== CONFIGURE AQUI ===== */
const CONTATO='moldicontato@gmail.com';   /* e-mail de contato mostrado no rodapé */
const IMGDIR='img/'; /* pasta das imagens (ao lado do index.html) */
const $=s=>document.querySelector(s);
const IC={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',moon:'<path d="M20 14A8 8 0 0110 4a8 8 0 1010 10z"/>',home:'<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',cards:'<rect x="3" y="7" width="13" height="13"/><path d="M7 7V3h14v14h-5"/>',pen:'<path d="M4 20h4L20 8l-4-4L4 16z"/>',ai:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 015 0c0 2-2.5 2-2.5 4M12 17v.01"/>',math:'<path d="M18 4H6l7 8-7 8h12"/>',timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',flame:'<path d="M12 3c1 4 6 6 6 11a6 6 0 01-12 0c0-3 2-4 3-6 1 2 2 2 3-5z"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',check:'<path d="M4 12l5 5 11-11"/>',x:'<path d="M5 5l14 14M19 5L5 19"/>',book:'<path d="M4 4h7a2 2 0 012 2v14a2 2 0 00-2-2H4zM20 4h-7v16h7z"/>',menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',plus:'<path d="M12 5v14M5 12h14"/>',mind:'<circle cx="12" cy="12" r="3"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="20" r="2"/><path d="M10 10L6.5 7.5M14 10l3.5-2.5M12 15v3"/>',repeat:'<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 013-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 01-3 3H3"/>',save:'<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 20h16"/>',cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',trophy:'<path d="M8 4h8v5a4 4 0 01-8 0zM8 6H4v1a3 3 0 003 3M16 6h4v1a3 3 0 01-3 3M12 13v4M8 21h8M10 17h4"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'};
const ic=(n,z=20)=>`<svg width="${z}" height="${z}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-4px;flex:none">${IC[n]}</svg>`;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5);
const dk=(o=0)=>{const d=new Date();d.setDate(d.getDate()-o);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
const day=(o=0)=>L[dk(o)]||{rev:0,p:{foco:0,curta:0,longa:0}};
function bump(f){const k=dk();L[k]=L[k]||{rev:0,p:{foco:0,curta:0,longa:0}};const b4=L[k].rev;f(L[k]);save();if(b4<M&&L[k].rev>=M){toast('Meta de hoje batida! Parabéns!');window.petEvt&&petEvt('meta')}}
const studied=o=>{const d=day(o);return d.rev>0||d.p.foco>0};
const hit=o=>day(o).rev>=M;
function streak(f){let o=f(0)?0:1,n=0;while(f(o)){n++;o++}return n}
const pool=()=>cards.filter(c=>!catF||c.cat===catF);
const cats=()=>[...new Set(cards.map(c=>c.cat))];
function load(){try{const s=localStorage.getItem('estudofacil.cards');if(s)cards=JSON.parse(s);const v=localStorage.getItem('estudofacil.v2');if(v){const o=JSON.parse(v);M=o.M||M;L=o.L||{};if(o.T)for(const k of ['foco','curta','longa'])if(+o.T[k]>0)T[k]=+o.T[k];if(typeof o.N==='number')NEWMAX=Math.max(0,o.N);for(const k in L)if(L[k]&&k!==dk())delete L[k].u}}catch(e){}
cards.forEach(c=>{c.cat=c.cat||'Geral';if((c.due>0||c.box>0)&&!c.sn)c.r=1});P.left=dur('foco')}
function save(){try{localStorage.setItem('estudofacil.cards',JSON.stringify(cards));localStorage.setItem('estudofacil.v2',JSON.stringify({M,L,T,N:NEWMAX}))}catch(e){saveFail()}}
function saveFail(){if(saveFail.s)return;saveFail.s=1;setTimeout(()=>toast('Não consegui salvar neste navegador. Baixe um backup para não perder seus dados.','Baixar',bkExport),0)}
const curDark=()=>{const t=document.documentElement.dataset.theme;return t?t==='dark':matchMedia('(prefers-color-scheme:dark)').matches};
function toggleTheme(){const t=curDark()?'light':'dark';document.documentElement.classList.add('tt');setTimeout(()=>document.documentElement.classList.remove('tt'),450);document.documentElement.dataset.theme=t;try{localStorage.setItem('estudofacil.theme',t)}catch(e){}document.querySelectorAll('[data-tb]').forEach(b=>b.innerHTML=ic(t==='dark'?'sun':'moon',22))}
function drawer(o){document.body.classList.toggle('open',!!o)}
function go(t){tab=t;shown=false;drawer(0);scrollTo(0,0);if(t==='study'){ses={g:0,n:0,hit:0,p:0};UNDO=null;FR=null;Q=[];pick()}if(t==='quiz')nextQ(true);render();enter()}
/* Transição suave ao trocar de aba */
function enter(){if(tab==='home')return;['#th','#view'].forEach(s=>{const e=$(s);e.classList.remove('enter');void e.offsetWidth;e.classList.add('enter')})}
/* Logo do Moldi: arquivo img/logo.webp (a imagem já contém o nome, então não se escreve "Moldi" ao lado).
   Se o arquivo não existir, aparece só o ícone + o nome, uma única vez. */
const LOGOW=h=>`<img class="logo-w" src="${IMGDIR}logo.webp" data-c="${IMGDIR}logo.webp|${IMGDIR}logo.png|logo.webp|logo.png" data-z="logo" data-h="${h}" height="${h}" alt="Moldi" decoding="async" onerror="imgNext(this)">`;
function nav(){if(catF&&!cats().includes(catF))catF='';
$('#dr').innerHTML=`<div class="t">${LOGOW(56)}</div>`+TABS.map(([k,l,i])=>`<button class="${tab===k?'on':''}" onclick="go('${k}')">${ic(i)}${l}</button>`).join('');
document.querySelector('main').classList.toggle('wide',tab==='home'||tab==='profile');
$('#tn').innerHTML=`<span class="lg">${LOGOW(60)}</span>`+[['home','Início'],['learn','Aprender'],['plan','Plano'],['study','Estudar'],['quiz','Quiz'],['pomo','Pomodoro'],['pet','Moldi'],['profile','Perfil']].map(([k,l])=>`<button class="l ${tab===k?'on':''}" onclick="go('${k}')">${l}</button>`).join('')+`<button class="l ib" data-tb onclick="toggleTheme()" aria-label="Alternar tema"></button><button class="l ib" onclick="drawer(1)" aria-label="Abrir menu">${ic('menu',24)}</button>`;
{const f=$('#fab'),d=dueN();f.hidden=tab==='study'||(tab==='quiz'&&QM==='sim');f.innerHTML=ic('cards',22)+' Estudar'+(d?' · '+d:'')}
{const th=TH[tab];$('#th').innerHTML=th?`<div class="th"><div><b>${th[1]}</b><span>${th[2]}</span></div>${IMG(th[0],'Ilustração da aba '+TABS.find(x=>x[0]===tab)[1])}</div>`:''}
$('#ttl').textContent=TABS.find(x=>x[0]===tab)[1];document.querySelectorAll('[data-tb]').forEach(b=>b.innerHTML=ic(curDark()?'sun':'moon',22));
const show=['cards','study','quiz'].includes(tab)&&cats().length&&!(tab==='quiz'&&QM==='sim'); /* no simulado a fonte das perguntas é escolhida na própria tela */
$('#filt').innerHTML=show?`<select aria-label="Filtrar por matéria" onchange="catF=this.value;go(tab)"><option value="">Todas as matérias</option>${cats().map(c=>`<option ${c===catF?'selected':''}>${esc(c)}</option>`).join('')}</select>`:''}
function render(){nav();({home:vHome,cards:vCards,learn:vLearn,study:vStudy,quiz:vQuiz,math:vMath,pomo:vPomo,pet:typeof vPet==='function'?vPet:vHome,plan:typeof vPlan==='function'?vPlan:vHome,profile:vProfile})[tab]();if(tab==='home'&&typeof planHome==='function')planHome();window.petSync&&petSync()}
const catField=()=>`<input id="cat" aria-label="Matéria" list="cl" placeholder="Matéria (ex.: Biologia)" value="${esc(catF||lastCat)}"><datalist id="cl">${cats().map(c=>`<option value="${esc(c)}">`).join('')}</datalist>`;
const getCat=()=>$('#cat').value.trim()||'Geral';
const mk=(q,a,cat,i=0)=>({id:Date.now()+i,q,a,cat,box:0,due:0});
/* Criar */
function vCards(){const l=pool();
$('#view').innerHTML=`<div class="box">${catField()}<input id="q" aria-label="Pergunta" placeholder="Pergunta"><textarea id="a" aria-label="Resposta" rows="2" placeholder="Resposta"></textarea><button class="btn" onclick="add()">Adicionar cartão</button><div class="mut" style="margin-top:14px;text-align:center">Com preguiça de fazer tudo? <button class="lnk" onclick="go('learn')">Crie utilizando I.A</button></div></div>
<div class="box"><div class="mut" id="cnt"></div>${l.length?`<input id="sq" aria-label="Buscar cartões" placeholder="Buscar cartões…" value="${esc(q2)}" oninput="q2=this.value;drawList()" style="margin-top:8px">`:''}<div id="lst"></div></div>`;drawList()}
function drawList(){const t=q2.trim().toLowerCase(),all=pool(),l=t?all.filter(c=>(c.q+' '+c.a+' '+c.cat).toLowerCase().includes(t)):all;
$('#cnt').textContent=t?l.length+' de '+all.length+' cartões':all.length+' cartões';
$('#lst').innerHTML=l.length?l.map(c=>c.id===edId?`<div class="item" style="display:block"><input id="eq" aria-label="Pergunta" value="${esc(c.q)}"><textarea id="ea" aria-label="Resposta" rows="2">${esc(c.a)}</textarea><input id="ec" aria-label="Matéria" list="cl" value="${esc(c.cat)}"><div class="row"><button class="btn" onclick="saveEd(${c.id})">Salvar</button><button class="btn gh" onclick="edId=null;drawList()">Cancelar</button></div></div>`:`<div class="item"><div><b>${esc(c.q)}</b><br><span class="mut">${esc(c.a)} · ${esc(c.cat)}</span></div><div style="display:flex;flex:none"><button class="x" style="color:var(--mut)" aria-label="Editar cartão" onclick="edId=${c.id};drawList()">${ic('pen',18)}</button><button class="x" aria-label="Apagar cartão" onclick="del(${c.id})">${ic('x',18)}</button></div></div>`).join(''):`<div class="mut" style="margin-top:8px">${all.length?'Nada encontrado.':'Nenhum cartão ainda. Crie o primeiro acima.'}</div>`}
function saveEd(id){const c=cards.find(x=>x.id===id),q=$('#eq').value.trim(),a=$('#ea').value.trim();if(!c||!q||!a)return;c.q=q;c.a=a;c.cat=$('#ec').value.trim()||'Geral';edId=null;save();render()}
function add(){const q=$('#q').value.trim(),a=$('#a').value.trim();if(!q||!a)return;const ct=getCat();cards.push(mk(q,a,ct));lastCat=ct;save();render();$('#q').focus()}
function del(id){const i=cards.findIndex(c=>c.id===id);if(i<0)return;const c=cards[i];cards.splice(i,1);save();render();toast('Cartão apagado','Desfazer',()=>{cards.splice(Math.min(i,cards.length),0,c);save();render()})}
/* ===== Imagens: coloque os arquivos na pasta img/ =====
   hero-lua.webp  -> topo da Home (à direita do título)
   estudando.webp -> ao lado dos cards de "Continue estudando"
   Se um arquivo não existir, fica só o espaço reservado (sem imagem quebrada). */
function imgFb(i){const d=document.createElement('div');d.className='ph';d.setAttribute('aria-hidden','true');i.replaceWith(d)}
/* Aceita .webp ou .png. Tenta cada caminho de data-c (img/ antes da raiz, webp antes de png). Acabando a lista: placeholder (ph), remove (rm) ou texto da logo (logo) */
function imgNext(i){const c=(i.dataset.c||'').split('|'),k=(+i.dataset.k||0)+1;if(k<c.length){i.dataset.k=k;i.src=c[k];return}
const z=i.dataset.z;if(z==='logo')i.outerHTML=ic('book',+i.dataset.h>34?28:24)+' Moldi';else if(z==='ph')imgFb(i);else i.remove()}
const IMG=(src,alt,eager)=>{const n=src.replace(/\.\w+$/,'');return `<img src="${IMGDIR+n}.webp" data-c="${IMGDIR+n}.webp|${IMGDIR+n}.png|${n}.webp|${n}.png" data-z="ph" alt="${alt}" ${eager?'':'loading="lazy" '}decoding="async" onerror="imgNext(this)">`};
const I_LUA=()=>IMG('hero-lua.webp','Ilustração de boas-vindas',true),
I_LER=()=>IMG('estudando.webp','Ilustração de estudo');
/* Ilustração de cada aba (arquivos na pasta img/) */
const TH={pomo:['pomodoro.webp','Um ciclo de cada vez.','25 minutos de foco e 5 de pausa.'],quiz:['quiz.webp','Hora de testar o que você sabe.','Responda e veja o quanto você já aprendeu.'],study:['estudar.webp','Revise um pouquinho por dia.','Cartões com revisão espaçada.'],learn:['aprender.webp','Aprenda qualquer tema.','Crie flashcards e um quiz em poucos passos.']};
/* Animação de entrada ao rolar (fade + slide) */
function countOne(e){const n=+e.dataset.n;if(!n)return;const t0=performance.now();e.textContent=0;const f=t=>{const p=Math.min(1,(t-t0)/800);e.textContent=Math.round(n*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
function revealIn(el,anim){el.classList.add('in');el.querySelectorAll('.bar i[data-w]').forEach(i=>anim?requestAnimationFrame(()=>requestAnimationFrame(()=>{i.style.width=i.dataset.w+'%'})):(i.style.width=i.dataset.w+'%'));if(anim)el.querySelectorAll('[data-n]').forEach(countOne)}
function reveal(){const e=[...document.querySelectorAll('#view .rv')];if(!('IntersectionObserver'in window)){e.forEach(x=>revealIn(x,false));return}
const o=new IntersectionObserver(r=>r.forEach(x=>{if(x.isIntersecting){revealIn(x.target,true);o.unobserve(x.target)}}),{threshold:.1});e.forEach(x=>o.observe(x))}

/* ===== Home: topo, painel (estatísticas), faixas estilo Netflix ===== */
/* Calendário mensal: só os números dos dias do mês, com cor conforme o estudo e setas para meses anteriores */
let CALM=0;
function calGo(n){CALM=Math.min(0,CALM+n);const e=$('#calc');if(e){e.outerHTML=calendar();const b=$('#calc '+(n<0?'.cp':'.cn'));if(b&&!b.disabled)b.focus()}}
function calendar(){const MS=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'],now=new Date(),t0=new Date(now.getFullYear(),now.getMonth(),now.getDate()),
base=new Date(t0.getFullYear(),t0.getMonth()+CALM,1),y=base.getFullYear(),mo=base.getMonth(),nd=new Date(y,mo+1,0).getDate(),off=base.getDay(),
lv=x=>{const r=x.rev;if(!r&&!x.p.foco)return 0;return r>=2*M?4:r>=M?3:r>=M/2?2:1};
let cells='<span class="cm e"></span>'.repeat(off),days=0,hits=0;
for(let d=1;d<=nd;d++){const dt=new Date(y,mo,d),o=Math.round((t0-dt)/864e5);
if(o<0){cells+=`<span class="cm fu" aria-hidden="true">${d}</span>`;continue}
const x=day(o),l=lv(x);if(l)days++;if(x.rev>=M)hits++;
cells+=`<span class="cm l${l}${o===0?' td':''}" role="img" aria-label="${d} de ${MS[mo]}: ${x.rev} cartões, ${x.p.foco} ciclos de foco" title="${x.rev} cartões · ${x.p.foco} ciclos de foco">${d}</span>`}
return `<div class="dc wf" id="calc"><span class="mut">${ic('cal',18)} Calendário de estudo</span><div class="cmh"><button class="cp" aria-label="Mês anterior" onclick="calGo(-1)">‹</button><b>${MS[mo][0].toUpperCase()+MS[mo].slice(1)} de ${y}</b><button class="cn" aria-label="Próximo mês" onclick="calGo(1)"${CALM>=0?' disabled':''}>›</button></div><div class="cmw" aria-hidden="true">${'DSTQQSS'.split('').map(c=>`<span>${c}</span>`).join('')}</div><div class="cmg" role="group" aria-label="Dias de ${MS[mo]}">${cells}</div><div class="cal-f"><small class="mut">${days} ${days===1?'dia estudado':'dias estudados'} · ${hits} com meta batida</small><div class="cal-lg" aria-hidden="true">menos <i class="cd"></i><i class="cd l1"></i><i class="cd l2"></i><i class="cd l3"></i><i class="cd l4"></i> mais</div></div></div>`}
/* Ilustração dos cards da Home: aceita .webp ou .png com o mesmo nome; se não existir, some sem quebrar */
const CARDIMG=n=>`<img class="cimg" src="${IMGDIR}${n}.webp" data-c="${IMGDIR}${n}.webp|${IMGDIR}${n}.png|${n}.webp|${n}.png" data-z="rm" alt="" aria-hidden="true" loading="lazy" decoding="async" onerror="imgNext(this)">`;
/* Confete da meta batida (toca uma vez por dia, ao abrir a Home) */
const CONF=`<div class="cfw" aria-hidden="true">${Array.from({length:16},(_,i)=>`<i class="cf" style="--x:${(i*6+4)%96}%;--d:${(i%5)*.12}s;--c:${['#F4A58E','#4169E1','#8CCBA8','#F7C2B1','#7C97F0'][i%5]}"></i>`).join('')}</div>`;let CEL={};
/* Slime: a massa amassa, balança e solta gotinhas. Toca quando o mouse passa por cima e ao clicar
   (no clique a tela só muda depois da animação, senão a troca cortaria o efeito) */
function splat(el){const o=el.querySelector('.sb');if(o)o.remove();el.classList.remove('splat');void el.offsetWidth;el.classList.add('splat');
const b=document.createElement('span');b.className='sb';b.setAttribute('aria-hidden','true');b.innerHTML='<i></i><i></i><i></i><i></i><i></i><i></i>';el.appendChild(b);
clearTimeout(el._sp);el._sp=setTimeout(()=>{el.classList.remove('splat');b.remove()},620)}
function slime(el,fn){if(matchMedia('(prefers-reduced-motion:reduce)').matches){fn();return}
if(el.dataset.go)return;el.dataset.go=1;splat(el);setTimeout(fn,460)}
function vHome(){
const t=day(),y=day(1),td=today(),goal=t.rev>=M,cel=goal&&!CEL[dk()]&&(CEL[dk()]=1),pct=Math.min(100,Math.round(t.rev/M*100)),due=dueN(),
sy=studied(1)?`Ontem você revisou <b>${y.rev}</b> cartões e fez <b>${y.p.foco}</b> ciclos de foco.`:(Object.keys(L).length?'Você não estudou ontem. Hoje é um bom dia para recomeçar!':'Bem-vindo! Estude ou crie cartões hoje para começar sua sequência.'),
card=(b,s,g,i,x='')=>`<button class="sc" role="listitem" ${x} onclick="slime(this,()=>{${g}})"><i class="sl" aria-hidden="true"><i></i><i></i><i></i></i><em class="ci">${ic(i,22)}</em><b>${b}</b><span>${s}</span></button>`,
strip=(h,it,side='')=>`<section class="sw rv"><h2>${h}</h2><div class="sr"><div class="sx"><div class="cgrid" role="list">${it}</div></div>${side}</div></section>`,
mats=cats().map(c=>{const n=dueN(c);return card(esc(c),n?n+' para revisar':'Tudo em dia',"catF=this.dataset.c;go('study')",'book',`data-c="${esc(c)}"`)}).join('')+card('Aprender um tema','Gere seu estudo',"go('learn')",'spark')+card('Nova matéria','Crie cartões',"go('cards')",'plus'),
tec=[['Pomodoro','25 min de foco','pomo','timer'],['Flashcards','Pergunta e resposta','study','cards'],['Revisão espaçada','De 1 a 30 dias','study','repeat'],['Quiz','Teste o que sabe','quiz','quiz'],['Matemática','Treino e calculadora','math','math']].map(([a,b,g,i])=>card(a,b,`go('${g}')`,i)).join(''),
hero=`<section class="hero rv"><div><span class="hello">${PF.name?'Olá, '+esc(PF.name)+'!':'Olá, bom te ver por aqui'}</span><h2>Estude com foco e constância.</h2><p>Revise no seu ritmo e acompanhe seu progresso, um passo de cada vez.</p><button class="btn" onclick="go('study')">Começar a estudar${due?' ('+due+')':''}</button></div>${I_LUA()}</section>`,
dash=`<section class="rv"><h2 style="font-size:20px;margin:0 0 10px">Seu painel</h2><div class="dash">
<div class="dc w2${goal?' goal':''}">${cel?CONF:''}<span class="mut">${ic('target',18)} Meta de hoje</span><b><span data-n="${t.rev}">${t.rev}</span><small> / ${M} cartões</small></b><div class="bar"><i style="width:0" data-w="${pct}"></i></div>${goal?`<div class="cong" role="status">${ic('check',26)}<div><strong>Meta batida! Parabéns!</strong><span>${t.rev>M?'+'+(t.rev-M)+(t.rev-M===1?' cartão':' cartões')+' além da meta. Que ritmo!':'Você revisou tudo o que planejou para hoje.'}</span></div></div>`:''}</div>
<div class="dc t1"><span>Feitos hoje</span><b data-n="${t.rev}">${t.rev}</b><small>cartões revisados</small>${CARDIMG('exercicio')}</div>
<div class="dc t2"><span>Meus cartões</span><b data-n="${cards.length}">${cards.length}</b><small>${due} para revisar hoje</small>${CARDIMG('dormindo')}</div>
<div class="dc w2"><span class="mut">${ic('flame',18)} Sequências</span><div class="stat"><div><b>${ic('flame',22)} ${streak(studied)}</b><span class="mut">dias estudando</span></div><div><b>${ic('target',22)} ${streak(hit)}</b><span class="mut">dias com meta batida</span></div></div><div style="font-size:14px">${sy}</div></div>
</div></section>`;
const guide=cards.length?'':`<section class="rv"><div class="box"><h2 style="margin-bottom:6px">${ic('spark',20)} Comece por aqui</h2><div class="mut" style="margin-bottom:14px">Você ainda não tem cartões. Crie o primeiro ou gere vários de uma vez a partir de um tema.</div><div class="row"><button class="btn" onclick="go('cards')">Criar meu primeiro cartão</button><button class="btn gh" onclick="go('learn')">Gerar com um tema</button></div></div></section>`;
$('#view').innerHTML=hero+guide+dash+strip('Continue estudando',mats,`<div class="side">${I_LER()}</div>`)+strip('Técnicas de estudo',tec);reveal()}

let TOP=[];try{TOP=JSON.parse(localStorage.getItem('estudofacil.topics')||'[]')}catch(e){}
function saveT(){try{localStorage.setItem('estudofacil.topics',JSON.stringify(TOP))}catch(e){saveFail()}}
let LS={t:'',n:'iniciante',o:'aprender do zero',p:'',r:'',open:null};
/* O que você já fez na aba Aprender (tema, prompt gerado e resposta colada) fica salvo no aparelho: se o celular fechar o navegador
   enquanto você usa a IA, ao voltar não precisa gerar o prompt de novo. */
try{const o=JSON.parse(localStorage.getItem('estudofacil.learn')||'{}');for(const k of ['t','n','o','p','r'])if(typeof o[k]==='string')LS[k]=o[k]}catch(e){}
function saveLS(){try{localStorage.setItem('estudofacil.learn',JSON.stringify({t:LS.t,n:LS.n,o:LS.o,p:LS.p,r:LS.r}))}catch(e){}}
const NIV=['iniciante','intermediário','avançado'],OBJ=['aprender do zero','me preparar para uma prova','revisar o que já sei','me aprofundar'];
const opts=(a,v)=>a.map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join('');
const SUG=['Frações','Revolução Francesa','Crase','Fotossíntese','Juros compostos'];
function vLearn(){if(PV){vPrev();return}if(LS.open!=null&&TOP[LS.open]){vTopic(TOP[LS.open]);return}
$('#view').innerHTML=`<div class="box"><h2>${ic('spark',20)} O que você quer aprender?</h2>
<input id="Lt" aria-label="Tema que você quer aprender" placeholder="Ex.: Frações, Revolução Francesa, Crase…" value="${esc(LS.t)}" oninput="LS.t=this.value;saveLS()" onkeydown="if(event.key==='Enter')lGen()">
<div class="chips">${SUG.map(x=>`<button class="chip" onclick="$('#Lt').value=this.textContent;$('#Lt').focus()">${x}</button>`).join('')}</div>
<div class="mut">Seu nível</div><select id="Ln" aria-label="Nível" onchange="LS.n=this.value;saveLS()">${opts(NIV,LS.n)}</select><div class="mut">Seu objetivo</div><select id="Lo" aria-label="Objetivo" onchange="LS.o=this.value;saveLS()">${opts(OBJ,LS.o)}</select>
<button class="btn" onclick="lGen()">Gerar prompt</button></div>
${LS.p?`<div class="box"><h2>1. Copie e cole na sua IA</h2><textarea id="Lp" aria-label="Prompt para copiar" rows="6" readonly>${esc(LS.p)}</textarea><button class="btn" onclick="lCopy()">Copiar prompt</button><div class="mut" style="margin-top:10px">Abrir: <a href="https://chatgpt.com" target="_blank" rel="noopener">ChatGPT</a> · <a href="https://gemini.google.com" target="_blank" rel="noopener">Gemini</a> · <a href="https://claude.ai" target="_blank" rel="noopener">Claude</a> · <a href="https://copilot.microsoft.com" target="_blank" rel="noopener">Copilot</a>. Os planos gratuitos delas costumam bastar, mas têm limites.</div></div>
<div class="box"><h2>2. Cole a resposta aqui</h2><div class="mut" style="font-size:13px;margin-bottom:8px">No celular, use o botão <b>Copiar</b> do bloco de código da IA. Se você selecionar o texto na mão, alguns apps de IA acrescentam barras invertidas (\\[ \\*). O Moldi tenta consertar isso sozinho.</div><textarea id="Lr" aria-label="Resposta da IA" rows="6" placeholder="Cole aqui tudo o que a IA devolveu" oninput="LS.r=this.value;saveLS()">${esc(LS.r)}</textarea><button class="btn" onclick="lBuild()">Montar meu estudo</button><div id="Lm" class="mut" style="margin-top:8px"></div></div>`:`<div class="box"><h2>Já tem a resposta da IA?</h2><div class="mut" style="font-size:13px;margin-bottom:8px">Cole aqui o que a IA devolveu e monte o estudo, sem precisar gerar o prompt de novo.</div><textarea id="Lr" aria-label="Resposta da IA" rows="4" placeholder="Cole aqui tudo o que a IA devolveu" oninput="LS.r=this.value;saveLS()">${esc(LS.r)}</textarea><button class="btn" onclick="lBuild()">Montar meu estudo</button><div id="Lm" class="mut" style="margin-top:8px"></div></div>`}
${TOP.length?`<div class="box"><h2>Meus estudos</h2>${TOP.map((t,i)=>`<div class="item" role="button" tabindex="0" onclick="LS.open=${i};vLearn()" onkeydown="if(event.key==='Enter')this.click()" style="cursor:pointer"><div style="flex:1"><b>${esc(t.titulo)}</b><br><span class="mut">${t.cartoes.length} cartões · ${t.quiz.length} questões${t.best!=null?' · melhor: '+t.best+'/'+t.quiz.length:''}</span></div><span class="mut">›</span></div>`).join('')}</div>`:''}`}
function lPrompt(t){return `Você é um professor experiente, paciente e didático. Crie flashcards e um quiz para estudar sobre: "${t}".

Perfil do aluno: nível ${LS.n}. Objetivo: ${LS.o}.

Regras:
- Escreva em português do Brasil, com linguagem simples e exemplos do dia a dia quando ajudar.
- Não invente informações. Se tiver dúvida sobre algo, avise no campo "aviso".
- Crie de 12 a 20 flashcards, indo do básico ao avançado (dentro do nível pedido), com pergunta curta e resposta curta e objetiva.
- Crie 8 questões de múltipla escolha, com 4 alternativas e só uma correta. Em "explicacao", explique por que a correta está certa. Em "porque", escreva um motivo curto para CADA alternativa, na mesma ordem das alternativas: nas erradas, diga por que estão erradas; na correta, confirme em poucas palavras.
- Não numere as perguntas nem as questões.\n- Escreva fórmulas e símbolos em texto simples (exemplo: x^2, raiz(9)), sem LaTeX.
- Dentro dos textos (cartões e questões), NUNCA use aspas duplas: use aspas simples. Se precisar mostrar um JSON ou um código como exemplo, escreva-o em uma única linha trocando as aspas duplas por aspas simples. Não coloque quebras de linha reais dentro dos textos.

Responda SOMENTE com um JSON válido, dentro de um único bloco de código (abra com três crases seguidas da palavra json e feche com três crases), sem nenhum texto fora do bloco, exatamente neste formato:
{"titulo":"...","resumo":"resumo em 1 ou 2 frases","aviso":"","cartoes":[{"q":"pergunta","a":"resposta"}],"quiz":[{"p":"pergunta","opcoes":["A","B","C","D"],"correta":0,"explicacao":"...","porque":["...","...","...","..."]}]}
O campo "correta" é o número da alternativa certa, começando em 0.`}
function lRead(){const t=$('#Lt').value.trim().replace(/"/g,"'");LS.n=$('#Ln').value;LS.o=$('#Lo').value;LS.t=t;if(!t)toast('Digite o tema que você quer estudar');return t}
function lGen(){const t=lRead();if(!t)return;LS.p=lPrompt(t);saveLS();vLearn()}
function lCopy(){const f=()=>{$('#Lp').select();document.execCommand('copy');toast('Prompt copiado')};try{navigator.clipboard.writeText(LS.p).then(()=>toast('Prompt copiado'),f)}catch(e){f()}}
const KEYS='titulo|resumo|aviso|explicacao|cartoes|q|a|quiz|p|opcoes|correta';
function fixJ(j){const st=[];let o='',s=false,key=false,prev='';
for(let i=0;i<j.length;i++){const c=j[i];
if(!s){o+=c;if(c==='"'){s=true;key=st[st.length-1]==='o'&&(prev==='{'||prev===',')}else if(c==='{'||c==='[')st.push(c==='{'?'o':'a');else if(c==='}'||c===']')st.pop();if(!/\s/.test(c))prev=c;continue}
if(c==='\\'){o+=c+(j[++i]||'');continue}
if(c==='\n'){o+='\\n';continue}if(c==='\r')continue;if(c==='\t'){o+='\\t';continue}
if(c==='"'){const r=j.slice(i+1);let close;
if(key)close=/^\s*:/.test(r);
else close=/^\s*[}\]]\s*([,}\]]|$)/.test(r)||(st[st.length-1]==='o'?new RegExp('^\\s*,\\s*"('+KEYS+')"\\s*:').test(r):/^\s*,\s*["\]]/.test(r))||/^\s*$/.test(r);
if(close){o+=c;s=false;prev='"'}else o+='\\"';continue}
o+=c}
return o}
/* Ao copiar de alguns apps de IA no celular, o texto vem com "escapes de markdown" (\[ \] \* \_ ...). Isto tira a barra
   invertida desses casos e preserva os escapes válidos de JSON (\" \\ \/ \b \f \n \r \t \uXXXX). */
const mdUnesc=s=>s.replace(/\\(?:(["\\\/bfnrt])|(u[0-9a-fA-F]{4})|([\s\S]))/g,(m,a,b,c)=>c!==undefined?c:m);
function jparse(raw){const a=raw.indexOf('{'),b=raw.lastIndexOf('}');if(a<0||b<a)throw{m:a>=0?'a resposta parece cortada no final: peça para a IA continuar ou gerar menos cartões':'não achei um JSON na resposta'};const j=raw.slice(a,b+1);let e0;
for(const f of [x=>x,mdUnesc,fixJ,x=>fixJ(mdUnesc(x))]){try{return JSON.parse(f(j))}catch(e){if(!e0)e0=e}}
const m=String(e0.message),pm=m.match(/position (\d+)/),lm=m.match(/line (\d+) column (\d+)/);let p=-1;if(pm)p=+pm[1];else if(lm)p=j.split('\n').slice(0,lm[1]-1).reduce((n,x)=>n+x.length+1,0)+(+lm[2]-1);
throw{m:p>=0?'erro perto de: "…'+j.slice(Math.max(0,p-40),p+40).replace(/\s+/g,' ')+'…"':m.slice(0,120)}}
function cp(t){const f=()=>{const x=document.createElement('textarea');x.value=t;document.body.appendChild(x);x.select();document.execCommand('copy');x.remove();toast('Copiado')};try{navigator.clipboard.writeText(t).then(()=>toast('Copiado'),f)}catch(e){f()}}
/* "correta" pode vir como número (0 a 3), letra (A a D) ou o texto da alternativa; o resultado sempre cai dentro das alternativas */
function jcorr(c,o){let n=0;if(typeof c==='number')n=c;else{const t=String(c==null?'':c).trim(),L=t.match(/^\(?([A-Da-d])[\).:]?$/);if(/^\d+$/.test(t))n=+t;else if(L)n=L[1].toUpperCase().charCodeAt(0)-65;else{const k=o.findIndex(x=>x.trim().toLowerCase()===t.toLowerCase());n=k>=0?k:0}}return Math.min(Math.max(0,n|0),Math.max(0,o.length-1))}
function lParse(raw){const d=jparse(raw)||{},S=x=>String(x==null?'':x),A=x=>Array.isArray(x)?x:[],N=x=>S(x).replace(/^\s*\d+[.)]\s+/,'');
const t={id:Date.now(),titulo:S(d.titulo||LS.t),resumo:S(d.resumo),aviso:S(d.aviso),best:null,cartoes:A(d.cartoes).filter(x=>x&&x.q&&x.a).map(x=>({q:N(x.q),a:S(x.a)})),quiz:A(d.quiz).filter(q=>q&&q.p&&A(q.opcoes).length>1).map(q=>{const o=q.opcoes.map(S),pq=A(q.porque).map(S);return{p:N(q.p),opcoes:o,correta:jcorr(q.correta,o),explicacao:S(q.explicacao),porque:o.map((_,i)=>pq[i]||'')}})};
if(!t.cartoes.length&&!t.quiz.length)throw{m:'faltam os cartões e o quiz'};return t}
function lSave(t){TOP.unshift(t);saveT();window.petEvt&&petEvt('estudo');LS.p='';LS.r='';saveLS();LS.open=0;vLearn()}
function lBuild(){const raw=$('#Lr').value,bad=w=>{const t='Não consegui ler a resposta'+(w?' ('+w+')':'')+'. Costuma ser aspas duplas dentro de um texto, ou texto copiado com barras invertidas. Use o botão Copiar do bloco de código da IA.';LS.fix='A resposta que você enviou tem um erro de JSON'+(w?' ('+w+')':'')+'. Reenvie o JSON completo e corrigido, dentro de um único bloco de código: não use aspas duplas dentro dos textos (troque por aspas simples, inclusive em exemplos de JSON ou de código), não coloque quebras de linha dentro dos textos, não deixe vírgulas sobrando e não escreva nada fora do JSON.';$('#Lm').innerHTML=esc(t)+'<br><button class="btn gh" style="margin-top:8px" onclick="cp(LS.fix)">Copiar pedido de correção</button>'};let t;try{t=lParse(raw)}catch(e){bad(e.m);return}lSave(t)}
/* Tela do estudo: resumo + flashcards + quiz */
function vTopic(t){const i=TOP.indexOf(t);
$('#view').innerHTML=`<button class="btn gh" onclick="LS.open=null;vLearn()" style="margin-bottom:14px">‹ Voltar</button>
<div class="box"><h2>${esc(t.titulo)}</h2><div style="white-space:pre-wrap">${esc(t.resumo)}</div>${t.aviso?`<div class="mut" style="margin-top:8px">Aviso da IA: ${esc(t.aviso)}</div>`:''}<div class="mut" style="margin-top:8px">Conteúdo gerado por IA: confira o que for importante.</div></div>
<div class="box"><h2>Praticar</h2>${t.cartoes.length?`<button class="btn" onclick="lCards(${i})">${ic('cards')} Criar flashcards (${t.cartoes.length})</button>`:''}${t.quiz.length?`<button class="btn gh" style="margin-top:8px" onclick="lQuiz(${i})">${ic('quiz')} Fazer quiz (${t.quiz.length})</button>`:''}${typeof simFrom==='function'&&t.quiz.length>1?`<button class="btn gh" style="margin-top:8px" onclick="simFrom(${i})">${ic('timer')} Fazer simulado (com tempo)</button>`:''}${t.best!=null?`<div class="mut" style="margin-top:10px">Melhor resultado no quiz: ${t.best} de ${t.quiz.length}</div>`:''}</div>
<button class="btn gh" onclick="lDel(${i})">Apagar este estudo</button>`}
function lCards(i){PV={cat:TOP[i].titulo,l:TOP[i].cartoes.map(x=>({q:x.q,a:x.a,on:true}))};vLearn()}
function lDel(i){const t=TOP.splice(i,1)[0];saveT();LS.open=null;vLearn();toast('Estudo apagado','Desfazer',()=>{TOP.splice(i,0,t);saveT();LS.open=null;render()})}
/* Quiz do estudo: refaz só as erradas e guarda o melhor resultado */
let LQ=null;
function lQuiz(i,list){LQ={i,list:list||TOP[i].quiz.map((_,n)=>n),k:0,s:0,w:[]};lQ()}
function lQ(){const t=TOP[LQ.i],n=LQ.list[LQ.k];
if(n==null){if(LQ.list.length===t.quiz.length){t.best=Math.max(t.best==null?0:t.best,LQ.s);saveT()}
$('#view').innerHTML=`<div class="box"><h2>Fim do quiz</h2><div style="margin-bottom:12px">Você acertou ${LQ.s} de ${LQ.list.length}.${t.best!=null?' Melhor resultado: '+t.best+'/'+t.quiz.length+'.':''}</div>${LQ.w.length?`<button class="btn" onclick="lQuiz(${LQ.i},[${LQ.w}])">Refazer só as que errei (${LQ.w.length})</button>`:''}<button class="btn gh" style="margin-top:8px" onclick="lQuiz(${LQ.i})">Refazer tudo</button><button class="btn gh" style="margin-top:8px" onclick="LS.open=${LQ.i};vLearn()">Voltar ao estudo</button></div>`;return}
const q=t.quiz[n];
$('#view').innerHTML=`<div class="mut" style="margin-bottom:8px">Questão ${LQ.k+1} de ${LQ.list.length}</div><div class="bar"><i style="width:${Math.round(LQ.k/LQ.list.length*100)}%"></i></div><div class="box"><b>${esc(q.p)}</b></div>${q.opcoes.map((o,j)=>`<button class="opt" onclick="lAns(${j})">${esc(o)}</button>`).join('')}<div id="Lx"></div>`}
/* Explicação do que você marcou: usa o campo "porque" (um motivo por alternativa) quando a IA o enviou; estudos antigos mostram só a explicação geral */
function qExpl(q,j){const pq=Array.isArray(q.porque)?q.porque:[],h=(l,t)=>t&&String(t).trim()?`<div><b>${l}</b> ${esc(t)}</div>`:'';
if(j===q.correta)return h('Correto!',q.explicacao)||'<div><b>Correto!</b></div>';
return (j==null?'<div><b>Você não respondeu.</b></div>':h('Você marcou:',q.opcoes[j])+h('Por que está errada:',pq[j]))+h('Resposta certa:',q.opcoes[q.correta])+h('Explicação:',q.explicacao)}
function lAns(j){const t=TOP[LQ.i],n=LQ.list[LQ.k],q=t.quiz[n],g=j===q.correta;if(g)LQ.s++;else LQ.w.push(n);
document.querySelectorAll('.opt').forEach((b,x)=>{b.disabled=true;if(x===q.correta)b.classList.add('right');else if(x===j)b.classList.add('wrong')});
$('#Lx').innerHTML=`<div class="box why">${qExpl(q,j)}</div><button class="btn" onclick="LQ.k++;lQ()">${LQ.k+1<LQ.list.length?'Próxima':'Ver resultado'}</button>`}

/* ===== Perfil: nome, resumo, últimos 7 dias, calendário, conquistas, preferências, backup ===== */
let PF={name:'',av:0};try{Object.assign(PF,JSON.parse(localStorage.getItem('estudofacil.profile')||'{}'))}catch(e){}
function savePF(){try{localStorage.setItem('estudofacil.profile',JSON.stringify(PF))}catch(e){saveFail()}}
const AVC=[['#F4A58E','#2A1710'],['#4169E1','#FFFFFF'],['#7FCBA1','#102A1B'],['#F7C2B1','#2A1710'],['#7C97F0','#101736'],['#E6DAC4','#3A2F25']];
function pDur(k,v){T[k]=Math.max(1,Math.min(180,Math.round(+v||1)));P.rem=null;if(!P.running&&P.mode===k)P.left=dur(k);save()}
/* atualiza a inicial do avatar enquanto digita, sem recriar a tela (não perde o toque seguinte) */
function avUp(){const a=$('.av');if(a)a.innerHTML=(PF.name.trim()[0]||'').toUpperCase()||ic('user',34)}
function wipeAsk(b){if(b.dataset.arm){wipe();return}b.dataset.arm=1;b.textContent='Tem certeza? Toque de novo';setTimeout(()=>{if(b.isConnected){delete b.dataset.arm;b.textContent='Apagar todos os dados'}},5000)}
function wipe(){const s={c:JSON.stringify(cards),L:JSON.stringify(L),t:JSON.stringify(TOP),p:JSON.stringify(PF),e:typeof PET!=='undefined'?JSON.stringify(PET):'',pl:typeof PLANS!=='undefined'?JSON.stringify({l:PLANS,a:PLA}):'',sh:typeof SIMH!=='undefined'?JSON.stringify(SIMH):''};
cards=[];L={};TOP=[];PF={name:'',av:0};window.petReset&&petReset();LS.t=LS.p=LS.r='';saveLS();if(typeof simReset==='function')simReset();if(typeof planReset==='function')planReset();cur=null;quiz=null;catF='';save();saveT();savePF();render();
toast('Todos os dados foram apagados','Desfazer',()=>{cards=JSON.parse(s.c);L=JSON.parse(s.L);TOP=JSON.parse(s.t);PF=JSON.parse(s.p);if(s.e&&window.petImport)petImport(JSON.parse(s.e));if(s.pl&&typeof PLANS!=='undefined'){const q=JSON.parse(s.pl);PLANS=q.l;PLA=q.a;savePL()}if(s.sh&&typeof SIMH!=='undefined'){SIMH=JSON.parse(s.sh);saveSH()}save();saveT();savePF();render()})}
/* Rodapé: privacidade e contato (o e-mail é montado aqui para não ficar solto no HTML) */
function mail(e){/* no computador, muita gente não tem programa de e-mail configurado: abre o Gmail na web. No celular vale o mailto (abre o app de e-mail) */
if(matchMedia('(hover:hover) and (pointer:fine)').matches){e.preventDefault();open('https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(CONTATO)+'&su='+encodeURIComponent('Contato Moldi'),'_blank','noopener')}}
function foot(){const f=$('#ft');if(!f)return;
f.innerHTML=`<span>© ${new Date().getFullYear()} Moldi</span><div class="fl"><a href="privacidade.html">Política de privacidade</a><a href="mailto:${CONTATO}?subject=${encodeURIComponent('Contato Moldi')}" onclick="mail(event)" aria-label="Enviar e-mail para ${CONTATO}">${CONTATO}</a></div>`}
function vProfile(){
const keys=Object.keys(L),ep=k=>{const [y,m,d]=k.split('-').map(Number);return Math.round(Date.UTC(y,m-1,d)/864e5)},
act=keys.filter(k=>{const x=L[k];return x&&(x.rev>0||(x.p&&x.p.foco>0))}).sort((a,b)=>ep(a)-ep(b));
let best=0,run=0,prev=null;act.forEach(k=>{const e=ep(k);run=prev!==null&&e===prev+1?run+1:1;prev=e;best=Math.max(best,run)});
const tot=keys.reduce((s,k)=>s+(L[k].rev||0),0),foco=keys.reduce((s,k)=>s+((L[k].p||{}).foco||0),0),bestDay=Math.max(0,...keys.map(k=>L[k].rev||0)),
hits=keys.filter(k=>(L[k].rev||0)>=M).length,firm=cards.filter(c=>c.box>=3).length,
since=act.length?act[0].split('-').reverse().map(x=>x.padStart(2,'0')).join('/'):'',
av=AVC[PF.av]||AVC[0],ini=(PF.name.trim()[0]||'').toUpperCase(),
wk=[6,5,4,3,2,1,0].map(o=>{const d=new Date();d.setDate(d.getDate()-o);return{r:day(o).rev,l:'DSTQQSS'[d.getDay()],t:o===0}}),mx=Math.max(M,...wk.map(w=>w.r),1),
st=[[tot,'cartões revisados'],[foco,'ciclos de foco'],[act.length,'dias estudados'],[best,'maior sequência (dias)'],[bestDay,'melhor dia (cartões)'],[hits,'dias com meta batida'],[firm,'cartões firmes (7+ dias)'],[cats().length,'matérias']],
BG=[['Primeiro cartão','Crie 1 cartão','pen',cards.length>=1],['Colecionador','Tenha 25 cartões','cards',cards.length>=25],['Primeira revisão','Revise 1 cartão','check',tot>=1],['Cem revisões','Revise 100 cartões','target',tot>=100],
['Meta batida','Bata a meta diária','flame',hits>=1],['3 dias seguidos','Estude 3 dias seguidos','flame',best>=3],['Semana firme','Estude 7 dias seguidos','flame',best>=7],['Primeiro foco','Complete 1 ciclo de foco','timer',foco>=1],
['Maratona de foco','Complete 25 ciclos','timer',foco>=25],['Curioso','Crie um estudo com IA','spark',TOP.length>=1],['Organizado','Use 3 matérias','book',cats().length>=3],['Memória de elefante','Cartão com intervalo de 30 dias','repeat',cards.some(c=>c.box>=5)]],
nb=BG.filter(b=>b[3]).length;
$('#view').innerHTML=`<div class="dash">
<div class="dc wf pf"><div class="av" style="background:${av[0]};color:${av[1]}" aria-hidden="true">${ini||ic('user',34)}</div><div class="pi"><input id="pn" value="${esc(PF.name)}" maxlength="30" placeholder="Como você quer ser chamado?" aria-label="Seu nome" oninput="PF.name=this.value.slice(0,30);savePF();avUp()"><div class="sw2" role="group" aria-label="Cor do avatar">${AVC.map((c,i)=>`<button style="background:${c[0]}" aria-label="Cor ${i+1}" aria-pressed="${i===PF.av}" class="${i===PF.av?'on':''}" onclick="PF.av=${i};savePF();vProfile()"></button>`).join('')}</div><small class="mut">${since?'Estudando desde '+since+' · ':''}${nb} de ${BG.length} conquistas</small></div></div>
<div class="dc wf"><span class="mut">${ic('chart',18)} Seu resumo</span><div class="pst">${st.map(([v,l])=>`<div><b>${v}</b><span>${l}</span></div>`).join('')}</div></div>
<div class="dc wf"><span class="mut">${ic('chart',18)} Últimos 7 dias</span><div class="wk">${wk.map(w=>`<div class="wb"><small>${w.r||''}</small><div class="wc"><i class="${w.r>=M?'ok':''}" style="height:${w.r?Math.max(6,Math.round(w.r/mx*100)):3}%"></i></div><span${w.t?' class="td"':''}>${w.l}</span></div>`).join('')}</div><small class="mut">Cartões revisados por dia. Verde: dia em que você bateu a meta (${M}).</small></div>
${calendar()}
<div class="dc wf"><span class="mut">${ic('trophy',18)} Conquistas · ${nb} de ${BG.length}</span><div class="bdg">${BG.map(([n,d,i,u])=>`<div class="bd2${u?' on':''}"><em>${ic(i,22)}</em><b>${n}</b><small>${u?'Conquistada':d}</small></div>`).join('')}</div></div>
<div class="dc w2"><span class="mut">${ic('target',18)} Preferências</span>
<label class="gl mut">Meta diária (cartões)<input type="number" min="1" max="500" value="${M}" aria-label="Meta diária de cartões" onchange="M=Math.max(1,Math.min(500,+this.value||1));save()"></label>
<label class="gl mut">Cartões novos por dia (0 = sem limite)<input type="number" min="0" max="500" value="${NEWMAX}" aria-label="Cartões novos por dia" onchange="NEWMAX=Math.max(0,Math.min(500,+this.value||0));Q=[];save()"></label>
<div class="mut" style="font-size:13px;margin-top:6px">Pomodoro (minutos)</div><div class="pdr">${[['foco','Foco'],['curta','Pausa curta'],['longa','Pausa longa']].map(([k,l])=>`<label>${l}<input type="number" min="1" max="180" value="${Math.round(T[k])}" onchange="pDur('${k}',this.value)"></label>`).join('')}</div>
<button class="btn gh" style="margin-top:8px" onclick="toggleTheme();vProfile()">${ic(curDark()?'sun':'moon',18)} Tema: ${curDark()?'escuro':'claro'} (trocar)</button></div>
<div class="dc w2"><span class="mut">${ic('save',18)} Backup</span><div class="mut" style="font-size:13px">Seus dados ficam só neste navegador e não sincronizam entre aparelhos. Baixe uma cópia de vez em quando. O backup inclui cartões, estudos, histórico e perfil. <a class="lnk" href="privacidade.html">Política de privacidade</a></div><div class="row" style="margin-top:6px"><button class="btn gh" onclick="bkExport()">Baixar</button><button class="btn gh" onclick="$('#bkf').click()">Restaurar</button></div><input type="file" id="bkf" accept=".json,application/json" hidden onchange="bkImport(this)"></div>
<div class="dc wf"><span class="mut">Zona de risco</span><div class="mut" style="font-size:13px">Apaga cartões, estudos, histórico e perfil deste aparelho. Você terá alguns segundos para desfazer.</div><button class="btn gh dng" style="margin-top:6px" onclick="wipeAsk(this)">Apagar todos os dados</button></div>
</div>`}
/* Flashcards */
/* ===== Revisão: limite de cartões novos, treino livre, editar / pular / adiar ===== */
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const isNew=c=>!c.r; /* cartão que nunca foi avaliado */
/* quantos cartões novos ainda cabem hoje (limite diário + os liberados com "Estudar mais novos") */
function newRoom(){const t=today();if(NXd!==t){NXd=t;NX=0}return NEWMAX>0?Math.max(0,NEWMAX+NX-cards.filter(c=>c.nd===t).length):1e9}
/* quantos cartões vencem hoje, já respeitando o limite de novos */
function dueN(cat){const t=today(),a=cards.filter(c=>c.due<=t&&(!cat||c.cat===cat)),n=a.filter(isNew).length;return a.length-n+Math.min(n,newRoom())}
function edStart(){if(!cur)return;EDC=true;vStudy()}
function seSave(){const q=$('#se_q').value.trim(),a=$('#se_a').value.trim();if(!q||!a){toast('Preencha a pergunta e a resposta');return}cur.q=q;cur.a=a;cur.cat=$('#se_c').value.trim()||'Geral';EDC=false;save();vStudy()}
function skip(){if(!cur)return;if(Q.length<2){toast('Esse é o último cartão de hoje');return}Q.push(Q.shift());cur=Q[0];shown=false;vStudy()}
function snooze(){const c=cur;if(!c)return;const o={due:c.due,Q:Q.slice()};if(isNew(c))c.sn=1;c.due=today()+1;Q=Q.filter(x=>x!==c);pick();vStudy();save();
toast('Cartão adiado para amanhã','Desfazer',()=>{c.due=o.due;Q=o.Q;cur=c;shown=false;save();if(tab==='study'&&!FR)vStudy()})}
/* Treino livre: passa por todos os cartões sem mexer na agenda nem na meta */
function freeStart(list){FR={q:shuf(list||pool()),i:0,ok:0,bad:[],sh:false};vStudy()}
function rvF(){if(!FR||FR.sh)return;FR.sh=true;vFree(true)}
function fr(ok){const F=FR,c=F&&F.q[F.i];if(!c)return;if(ok)F.ok++;else F.bad.push(c);F.i++;F.sh=false;vFree()}
function vFree(anim){const F=FR,c=F.q[F.i],n=F.q.length;
if(!c){const p=n?Math.round(F.ok/n*100):0;$('#view').innerHTML=`<div class="box q">${ic('check',32)} Treino concluído!<span class="mut">Isso não mudou sua agenda de revisão nem sua meta.</span><div class="sum"><div><b>${n}</b><span>cartões</span></div><div><b>${p}%</b><span>acertos</span></div></div></div>${F.bad.length?`<button class="btn" style="margin-bottom:10px" onclick="freeStart(FR.bad)">Treinar só os ${F.bad.length} que errei</button>`:''}<button class="btn gh" onclick="FR=null;pick();vStudy()">Voltar</button>`;return}
const pct=Math.round(F.i/n*100);
$('#view').innerHTML=`<div class="sh"><span class="mut">Treino livre · não altera a agenda</span><span class="mut">${F.i+1} de ${n}</span></div><div class="pg" role="progressbar" aria-label="Progresso do treino" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div><div class="flip${F.sh&&!anim?' fl':''}${!anim&&!F.sh?' cin':''}" role="button" tabindex="0" onclick="rvF()"><div class="fi"><div class="box q fr"><span class="mut">Pergunta · toque para virar</span>${esc(c.q)}</div><div class="box q bk"><span class="bq">${esc(c.q)}</span><span class="mut">Resposta</span>${esc(c.a)}</div></div></div>${F.sh?`<div class="rates two"><button class="btn no" onclick="fr(0)">Errei</button><button class="btn ok" onclick="fr(1)">Acertei</button></div><div class="mut kbhint">Atalhos: 1 Errei · 2 Acertei</div>`:`<button class="btn" onclick="rvF()">Mostrar resposta</button>`}<button class="btn gh" style="margin-top:10px" onclick="FR=null;pick();vStudy()">Sair do treino</button>`;
if(anim)requestAnimationFrame(()=>requestAnimationFrame(()=>{const e=$('.flip');e&&e.classList.add('fl')}))}
/* Fila do dia: embaralhada uma vez. "Errei" volta depois de ~3 cartões; "Difícil" em cartão novo vai para o fim */
function pick(){EDC=false;const t=today();let k=newRoom();
Q=Q.filter(c=>cards.includes(c)&&c.due<=t&&(!catF||c.cat===catF)&&(!isNew(c)||k-->0));
if(!Q.length){const d=pool().filter(c=>c.due<=t);Q=[...shuf(d.filter(c=>!isNew(c))),...shuf(d.filter(isNew)).slice(0,newRoom())]} /* revisões antigas primeiro, depois os novos (até o limite diário) */
cur=Q.length?Q[0]:null;shown=false}
function rv(){if(shown)return;shown=true;vStudy(true)}
function vStudy(anim){if(FR){vFree(anim);return}
if(!pool().length){$('#view').innerHTML=`<div class="box">Crie cartões para começar.<button class="btn" style="margin-top:12px" onclick="go('cards')">Criar cartões</button></div>`;return}
const t=today(),left=dueN(catF);
if(!cur){const nn=pool().filter(c=>c.due<=t&&isNew(c)).length,pend=nn-Math.min(nn,newRoom()),nx=nextInfo(),tom=pool().filter(c=>c.due===t+1).length,
st=ses.n?`<div class="sum"><div><b>${ses.n}</b><span>${ses.n===1?'revisão':'revisões'}</span></div><div><b>${Math.round(ses.hit/ses.n*100)}%</b><span>acertos</span></div><div><b>${tom||(nx&&nx.replace('em ',''))||'0'}</b><span>${tom||!nx?'para amanhã':'próxima revisão'}</span></div></div>`:'',
sub=ses.n?'Bom trabalho!':(nx?`Próxima revisão ${nx}.`:'Volte amanhã ou adicione mais cartões.');
ses.p=100;
$('#view').innerHTML=`<div class="box q">${ic('check',32)} Tudo revisado por hoje!<span class="mut">${sub}</span>${pend>0?`<span class="mut">${pend} ${pend===1?'cartão novo espera':'cartões novos esperam'} pelo limite diário (${NEWMAX}).</span>`:''}${st}</div>${UNDO?`<button class="btn gh" style="margin-bottom:10px" onclick="undo()">↶ Desfazer última nota</button>`:''}${pend>0?`<button class="btn" style="margin-bottom:10px" onclick="NX+=NEWMAX;Q=[];pick();vStudy()">Estudar mais ${Math.min(pend,NEWMAX)} novos</button>`:''}<button class="btn gh" onclick="freeStart()">Treino livre (${pool().length} ${pool().length===1?'cartão':'cartões'})</button>`;return}
if(EDC){$('#view').innerHTML=`<div class="box"><h2>Editar cartão</h2><input id="se_q" aria-label="Pergunta" value="${esc(cur.q)}"><textarea id="se_a" rows="3" aria-label="Resposta">${esc(cur.a)}</textarea><input id="se_c" aria-label="Matéria" value="${esc(cur.cat)}"><div class="row"><button class="btn" onclick="seSave()">Salvar</button><button class="btn gh" onclick="EDC=false;vStudy()">Cancelar</button></div></div>`;return}
const tot=ses.g+left,pct=tot?Math.round(ses.g/tot*100):0,from=ses.p;ses.p=pct;
$('#view').innerHTML=`<div class="sh"><span class="mut">Faltam ${left} para hoje</span>${UNDO?`<button class="ud" onclick="undo()" aria-label="Desfazer a última nota">↶ Desfazer</button>`:`<span class="mut">${ses.g} de ${tot}</span>`}</div><div class="pg" role="progressbar" aria-label="Progresso de hoje" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%;--from:${from}%"></i></div><div class="flip${shown&&!anim?' fl':''}${!anim&&!shown?' cin':''}" role="button" tabindex="0" onclick="rv()"><div class="fi"><div class="box q fr"><span class="mut">Pergunta · toque para virar</span>${esc(cur.q)}</div><div class="box q bk"><span class="bq">${esc(cur.q)}</span><span class="mut">Resposta</span>${esc(cur.a)}</div></div></div>
${shown?`<div class="rates">${[['Errei','no'],['Difícil','gh'],['Bom',''],['Fácil','ok']].map(([l,c],r)=>{const s=sched(cur,r);return `<button class="btn ${c}" onclick="rate(${r})">${l}<small>${s.d?s.d+(s.d===1?' dia':' dias'):(r===0?'já já':'mais tarde')}</small></button>`}).join('')}</div><div class="mut kbhint">Atalhos: 1 Errei · 2 Difícil · 3 Bom · 4 Fácil · E editar · P pular${UNDO?' · Z desfazer':''}</div>`:`<button class="btn" onclick="rv()">Mostrar resposta</button>`}<div class="cact"><button onclick="edStart()">${ic('pen',16)} Editar</button><button onclick="skip()">${ic('repeat',16)} Pular</button><button onclick="snooze()">${ic('moon',16)} Amanhã</button></div>`;if(anim)requestAnimationFrame(()=>requestAnimationFrame(()=>{const e=$('.flip');e&&e.classList.add('fl')}))}
/* Revisão espaçada: r = 0 Errei, 1 Difícil, 2 Bom, 3 Fácil */
function sched(c,r){const b=c.box;if(r===0)return{box:0,d:0};
if(r===1){if(b===0)return{box:0,d:0};const n=Math.max(1,b);return{box:n,d:Math.max(1,Math.ceil(DAYS[n]/2))}}
const n=Math.min(DAYS.length-1,b+(r===3?2:1));return{box:n,d:DAYS[n]}}
function rate(r){const c=cur;if(!c)return;const t=today(),bt=document.querySelectorAll('.rates .btn')[r];
UNDO={c,box:c.box,due:c.due,r:c.r,nd:c.nd,sn:c.sn,add:false,Q:Q.slice(),ses:{...ses},k:dk()};
const s=sched(c,r);c.box=s.box;c.due=t+s.d;if(!c.r){c.r=1;c.nd=t;delete c.sn}
/* a meta conta cada cartão uma vez por dia (repetir um cartão errado não enche a meta) */
bump(d=>{d.u=d.u||[];if(!d.u.includes(c.id)){d.u.push(c.id);d.rev++;UNDO.add=true}});
if(UNDO.add&&window.petEvt)petEvt('card',c.id); /* XP do Moldi: 1x por cartão por dia */
ses.n++;if(r>=2)ses.hit++;
Q=Q.filter(x=>x!==c);if(c.due<=t)Q.splice(r===0?Math.min(3,Q.length):Q.length,0,c);else ses.g++;
if(bt)gotas(bt,r);pick();vStudy()}
/* Desfazer a última nota: devolve o cartão ao estado anterior e mostra o verso para avaliar de novo */
function undo(){const u=UNDO;if(!u)return;UNDO=null;u.c.box=u.box;u.c.due=u.due;u.c.r=u.r;u.c.nd=u.nd;u.c.sn=u.sn;Q=u.Q;ses=u.ses;const d=L[u.k];if(d&&u.add){d.rev=Math.max(0,d.rev-1);if(d.u)d.u=d.u.filter(i=>i!==u.c.id)}save();cur=u.c;shown=true;vStudy()}
/* Slime nas notas: gotinhas saem do botão tocado (ficam por cima da tela, sem atrasar a próxima carta) */
function gotas(el,r){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;const b=el.getBoundingClientRect(),s=document.createElement('span');
s.className='sbf';s.style.cssText=`left:${b.left+b.width/2}px;top:${b.top+b.height/2}px;--c:${['var(--no)','var(--hi)','var(--ac)','var(--ok)'][r]}`;
s.setAttribute('aria-hidden','true');s.innerHTML='<i></i><i></i><i></i><i></i><i></i><i></i>';document.body.appendChild(s);setTimeout(()=>s.remove(),700)}
function nextInfo(){const t=today(),f=pool().filter(c=>c.due>t).map(c=>c.due-t);if(!f.length)return '';const d=Math.min(...f);return d===1?'amanhã':'em '+d+' dias'}
/* Quiz */
function nextQ(reset){if(reset)score={ok:0,n:0};const A=pool();if(new Set(A.map(x=>x.a)).size<2){quiz=null;return}
const c=A[Math.floor(Math.random()*A.length)];
const o=A.filter(x=>x.a!==c.a).sort((x,y)=>(y.cat===c.cat)-(x.cat===c.cat)||Math.random()-.5).map(x=>x.a);
quiz={c,opts:[c.a,...[...new Set(o)].slice(0,3)].sort(()=>Math.random()-.5),done:false,pick:null}}
let QM='treino'; /* 'treino' ou 'sim' (simulado.js) */
function vQuiz(){if(QM==='sim'&&typeof vSim==='function'){vSim();return}const tg=typeof simTabs==='function'?simTabs():'';
if(!quiz){$('#view').innerHTML=tg+`<div class="box">Crie pelo menos 2 cartões (com respostas diferentes) para jogar o quiz.<button class="btn" style="margin-top:12px" onclick="go('cards')">Criar cartões</button></div>`;return}
$('#view').innerHTML=tg+`<div class="mut" style="margin-bottom:8px">Acertos: ${score.ok}/${score.n}</div><div class="box q">${esc(quiz.c.q)}</div>
${quiz.opts.map((o,i)=>`<button class="opt ${quiz.done?(o===quiz.c.a?'right':(i===quiz.pick?'wrong':'')):''}" ${quiz.done?'disabled':''} onclick="ans(${i})">${esc(o)}</button>`).join('')}
${quiz.done?`<button class="btn" onclick="nextQ();vQuiz()">Próxima</button>`:''}`}
function ans(i){quiz.done=true;quiz.pick=i;score.n++;if(quiz.opts[i]===quiz.c.a){score.ok++;window.petEvt&&petEvt('quiz')}else window.petEvt&&petEvt('oops');bump(d=>d.rev++);vQuiz()}
/* Pomodoro: duração em minutos + segundos, círculo animado quadro a quadro */
const dur=k=>Math.max(1,Math.round(T[k]*60));
const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
const fmtH=s=>String(Math.floor(s/60)).padStart(2,'0')+'<span class="cl">:</span>'+String(s%60).padStart(2,'0');
const CIRC=2*Math.PI*100;
let RAF=0;
const remMs=()=>P.running?Math.max(0,P.end-Date.now()):(P.rem!=null?P.rem:P.left*1000);
function setRing(f){f=Math.max(0,Math.min(1,f));const rg=$('#ring'),kb=$('#knob');if(rg)rg.style.strokeDashoffset=CIRC*(1-f);if(kb){const a=f*2*Math.PI;kb.setAttribute('cx',110+100*Math.cos(a));kb.setAttribute('cy',110+100*Math.sin(a));kb.style.opacity=f>0?1:0}}
function ringLoop(){cancelAnimationFrame(RAF);const f=()=>{if(!P.running||!$('#ring'))return;setRing(remMs()/(dur(P.mode)*1000));RAF=requestAnimationFrame(f)};RAF=requestAnimationFrame(f)}
function vPomo(){const p=day().p,fl=P.flash;P.flash=0;
$('#view').innerHTML=`<div class="modes">${MODES.map(([k,l])=>`<button class="${P.mode===k?'on':''}" style="${P.mode===k?'background:'+MC[k]+';color:'+MT[k]:''}" onclick="pMode('${k}')">${l}<small>${p[k]} hoje</small></button>`).join('')}</div>
<div class="dial${P.running?' run':''}${fl?' done':''}" style="--c:${MC[P.mode]}"><div class="halo"></div><svg viewBox="0 0 220 220" style="transform:rotate(-90deg)" aria-hidden="true"><circle cx="110" cy="110" r="100" fill="none" stroke="var(--soft2)" stroke-width="10"/><circle id="ring" cx="110" cy="110" r="100" fill="none" stroke-width="10" stroke-linecap="round" stroke-dasharray="${CIRC}"/><circle id="knob" cx="210" cy="110" r="8"/></svg>
<div id="tmw"></div></div>
<div class="row"><button class="btn" id="pb" style="background:${MC[P.mode]};color:${MT[P.mode]}" onclick="pToggle()"></button><button class="btn gh" onclick="pReset()">Zerar</button></div>`;pTime();pShow();if(P.running)ringLoop()}
function pTime(){$('#tmw').innerHTML=`<div id="tm" role="button" tabindex="0" aria-label="Editar tempo" onclick="pEdit()" onkeydown="if(event.key==='Enter')pEdit()"></div><div class="mut">toque no tempo para editar</div>`}
function pShow(){if(!P.running)document.title='Moldi';const t=$('#tm');if(!t)return;if(t.dataset.s!==String(P.left)){t.dataset.s=P.left;t.innerHTML=fmtH(P.left)}
setRing(remMs()/(dur(P.mode)*1000));const dl=$('.dial');if(dl)dl.classList.toggle('run',P.running);$('#pb').textContent=P.running?'Pausar':'Iniciar'}
function pEdit(){if(P.running)return;const t=dur(P.mode);
$('#tmw').innerHTML=`<div class="te"><label><input id="tim" type="number" min="0" max="180" inputmode="numeric" value="${Math.floor(t/60)}" aria-label="Minutos" onkeydown="pKey(event)">min</label><b>:</b><label><input id="tis" type="number" min="0" max="59" inputmode="numeric" value="${t%60}" aria-label="Segundos" onkeydown="pKey(event)">seg</label></div><div class="mut" style="font-size:12px;margin-top:8px">Fica salvo neste aparelho</div><div class="row" style="margin-top:8px;justify-content:center"><button class="btn sm" onclick="pSave()">Salvar</button><button class="btn gh sm" onclick="pTime();pShow()">Cancelar</button></div>`;const i=$('#tim');i.focus();i.select()}
function pKey(e){if(e.key==='Enter')pSave();else if(e.key==='Escape'){pTime();pShow()}}
function pSave(){const m=Math.max(0,Math.min(180,Math.floor(+$('#tim').value||0))),s=Math.max(0,Math.min(59,Math.floor(+$('#tis').value||0)));T[P.mode]=Math.max(1,m*60+s)/60;P.rem=null;P.left=dur(P.mode);save();pTime();pShow()}
function pMode(k){P.mode=k;P.running=false;cancelAnimationFrame(RAF);P.rem=null;P.left=dur(k);vPomo()}
function pToggle(){if(P.running){P.rem=Math.max(0,P.end-Date.now());P.left=Math.ceil(P.rem/1000);P.running=false;cancelAnimationFrame(RAF)}else{P.running=true;ac();P.end=Date.now()+(P.rem!=null?P.rem:P.left*1000);P.rem=null;ringLoop()}pShow()}
function pReset(){P.running=false;cancelAnimationFrame(RAF);P.rem=null;P.left=dur(P.mode);pShow()}
let AC=null;const ac=()=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}return AC};
function beep(){try{const a=ac(),o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.3,t+.05);g.gain.linearRampToValueAtTime(0,t+.9);o.start();o.stop(t+1);navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}}
setInterval(()=>{if(!P.running)return;P.left=Math.max(0,Math.ceil((P.end-Date.now())/1000));document.title=fmt(P.left)+' · Moldi';
if(P.left<=0){P.running=false;cancelAnimationFrame(RAF);P.rem=null;beep();const m=P.mode;bump(d=>d.p[m]++);if(m==='foco'&&window.petEvt)petEvt('foco');P.mode=m==='foco'?(day().p.foco%4===0?'longa':'curta'):'foco';P.left=dur(P.mode);document.title='Moldi';if(tab==='pomo'){P.flash=1;vPomo()}}
else if(tab==='pomo')pShow()},250);
/* Matemática */
let mt='calc',deg=true,hist=[],mq=null,ms={ok:0,n:0,st:0},mOp='mix',mLv=0;
const rz=v=>Math.abs(v)<1e-12?0:v;const F={sin:x=>rz(Math.sin(deg?x*Math.PI/180:x)),cos:x=>rz(Math.cos(deg?x*Math.PI/180:x)),tan:x=>rz(Math.tan(deg?x*Math.PI/180:x)),sqrt:Math.sqrt,log:Math.log10,ln:Math.log,abs:Math.abs,exp:Math.exp,PI:Math.PI,E:Math.E};
function comp(s){let e=s.replace(/,/g,'.').replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-').replace(/\^/g,'**').replace(/√/g,'sqrt').replace(/π/g,'F.PI').replace(/(sin|cos|tan|sqrt|log|ln|abs|exp)\(/g,'F.$1(').replace(/\bpi\b/g,'F.PI').replace(/\be\b/g,'F.E');
e=e.replace(/(\d|\)|\bx|F\.PI|F\.E)\s*(?=\(|x\b|F\.)/g,'$1*').replace(/^\s*-/,'0-');
if(!/^[\dx+\-*/().\s]*$/.test(e.replace(/F\.(sin|cos|tan|sqrt|log|ln|abs|exp|PI|E)/g,'')))throw 0;
return new Function('F','x','return ('+e+')').bind(null,F)}
const fmtN=r=>Number.isFinite(r)?String(+r.toPrecision(12)).replace('.',','):'Erro';
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const SUBS=[['calc','Calculadora'],['train','Treino'],['graph','Gráfico'],['form','Fórmulas']];
function vMath(){$('#view').innerHTML=`<div class="sub">${SUBS.map(([k,l])=>`<button class="${mt===k?'on':''}" onclick="mt='${k}';vMath()">${l}</button>`).join('')}</div><div id="mc"></div>`;({calc:vCalc,train:vTrain,graph:vGraph,form:vForm})[mt]();const ab=document.querySelector('.sub .on');if(ab)ab.scrollIntoView({inline:'center',block:'nearest'})}
/* calculadora */
function vCalc(){const K=['sin(','cos(','tan(','√(','log(','ln(','(',')','7','8','9','÷','4','5','6','×','1','2','3','−','0','.','^','+','π','⌫','C','='];
$('#mc').innerHTML=`<div class="box"><input id="ce" aria-label="Conta" placeholder="Digite uma conta" onkeydown="if(event.key==='Enter')calcGo()"><div class="big" id="cr"></div><div class="row" style="margin-bottom:8px"><button class="btn gh" onclick="deg=!deg;vCalc()">Ângulos: ${deg?'graus':'radianos'}</button></div>
<div class="kp">${K.map(k=>`<button class="${k==='='?'eq':k.length>1&&k!=='⌫'?'f':''}" onclick="kp('${k}')">${k}</button>`).join('')}</div></div>
<div class="box"><h2>Histórico</h2>${hist.length?hist.map(h=>`<div class="item"><span>${esc(h[0])}</span><b>${esc(h[1])}</b></div>`).join(''):'<div class="mut">Nada ainda.</div>'}</div>`}
function kp(k){const c=$('#ce');if(k==='C'){c.value='';$('#cr').textContent=''}else if(k==='⌫')c.value=c.value.slice(0,-1);else if(k==='=')calcGo();else c.value+=k}
function calcGo(){const e=$('#ce').value.trim();if(!e)return;let r;try{r=fmtN(comp(e)(0))}catch(x){r='Erro'}$('#cr').textContent=r;if(r!=='Erro'){hist.unshift([e,r]);hist=hist.slice(0,6);$('#ce').value=r.replace(',','.');}}
/* treino */
/* ===== Treino: contas, equações (1º e 2º grau), leitura de gráficos e explicação passo a passo ===== */
const m_=v=>String(v).replace('-','−'),p_=v=>v<0?'('+m_(v)+')':m_(v);
/* monta um termo de polinômio: trm(3,'x²',1) -> 3x² ; trm(-1,'x') -> " − x" */
const trm=(v,s,f)=>{if(!v)return '';const ab=Math.abs(v),co=(ab===1&&s)?'':ab;return f?(v<0?'−':'')+co+s:(v<0?' − ':' + ')+co+s};
const qs=(a,b,c)=>trm(a,'x²',1)+trm(b,'x')+trm(c,'')+' = 0';
/* desenha o gráfico de g.f entre g.a e g.b, com grade e (opcional) pontos marcados */
function plot(g,marks){const W=320,H=240,N=300,pts=[];let lo=0,hi=0;
for(let i=0;i<=N;i++){const x=g.a+(g.b-g.a)*i/N,y=g.f(x);pts.push([x,y]);lo=Math.min(lo,y);hi=Math.max(hi,y)}
const pd=(hi-lo)*.1||1;lo-=pd;hi+=pd;
const sx=x=>(x-g.a)/(g.b-g.a)*W,sy=y=>H-(y-lo)/(hi-lo)*H,n=v=>+v.toPrecision(3),
tk=(p,q)=>{const r=(q-p)/6,e=10**Math.floor(Math.log10(r)),m=r/e,st=(m<1.5?1:m<3.5?2:m<7.5?5:10)*e,o=[];for(let v=Math.ceil(p/st)*st;v<=q+1e-9;v+=st)o.push(+v.toFixed(10));return o},
gr=tk(g.a,g.b).map(v=>`<line x1="${sx(v)}" x2="${sx(v)}" y1="0" y2="${H}" stroke="var(--bd)"/><text x="${sx(v)+2}" y="${sy(0)+12}" font-size="10" fill="var(--mut)">${n(v)}</text>`).join('')+tk(lo,hi).map(v=>`<line x1="0" x2="${W}" y1="${sy(v)}" y2="${sy(v)}" stroke="var(--bd)"/><text x="3" y="${sy(v)-2}" font-size="10" fill="var(--mut)">${n(v)}</text>`).join(''),
d=pts.map(([x,y],i)=>(i?'L':'M')+sx(x).toFixed(1)+' '+sy(y).toFixed(1)).join(''),
mk=(marks||[]).map(([x,y])=>`<circle cx="${sx(x)}" cy="${sy(y)}" r="6" fill="var(--hi)" stroke="var(--card)" stroke-width="2"/><text x="${sx(x)}" y="${sy(y)-12}" font-size="12" font-weight="700" text-anchor="middle" fill="var(--tx)">x = ${m_(n(x))}</text>`).join('');
return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block" role="img" aria-label="Gráfico da função">${gr}<line x1="0" x2="${W}" y1="${sy(0)}" y2="${sy(0)}" stroke="var(--mut)" stroke-width="1.5"/>${g.a<0&&g.b>0?`<line y1="0" y2="${H}" x1="${sx(0)}" x2="${sx(0)}" stroke="var(--mut)" stroke-width="1.5"/>`:''}<path d="${d}" fill="none" stroke="var(--ac)" stroke-width="3" stroke-linecap="round"/>${mk}</svg>`}
function genQ(){const ops=['add','sub','mul','div','eq','pot','pct','quad','gr'],t=mOp==='mix'?ops[R(0,8)]:mOp,l=mLv,m=[20,100,1000][l];let a,b;
if(t==='add'){a=R(2,m);b=R(2,m);return{q:`${a} + ${b} = ?`,r:a+b,ex:`Some os dois números:\n${a} + ${b} = ${a+b}`}}
if(t==='sub'){a=R(2,m);b=R(1,a);return{q:`${a} − ${b} = ?`,r:a-b,ex:`Subtraia o segundo número do primeiro:\n${a} − ${b} = ${a-b}`}}
if(t==='mul'){a=R(2,[9,20,40][l]);b=R(2,[9,12,25][l]);return{q:`${a} × ${b} = ?`,r:a*b,ex:`Multiplique os dois números:\n${a} × ${b} = ${a*b}`+(b>10?`\n\nDica: separe em partes.\n${a} × ${b-b%10} + ${a} × ${b%10} = ${a*(b-b%10)} + ${a*(b%10)} = ${a*b}`:'')}}
if(t==='div'){b=R(2,[9,12,25][l]);const r=R(2,[9,15,40][l]);return{q:`${b*r} ÷ ${b} = ?`,r,ex:`Pense ao contrário: que número vezes ${b} dá ${b*r}?\n${r} × ${b} = ${b*r}\nEntão ${b*r} ÷ ${b} = ${r}`}}
if(t==='eq'){const x=R(1,[10,20,50][l]);a=R(2,[5,9,12][l]);b=R(1,[20,50,100][l]);return{q:`${a}x + ${b} = ${a*x+b}  →  x = ?`,r:x,ex:`Isole o x.\n${a}x + ${b} = ${a*x+b}\n${a}x = ${a*x+b} − ${b} = ${a*x}\nx = ${a*x} ÷ ${a} = ${x}`}}
if(t==='pot'){const n=R(2,[9,15,25][l]);return l===2?{q:`√${n*n} = ?`,r:n,ex:`A raiz quadrada de ${n*n} é o número que, multiplicado por ele mesmo, dá ${n*n}.\n${n} × ${n} = ${n*n}\nEntão √${n*n} = ${n}`}:{q:`${n}² = ?`,r:n*n,ex:`Elevar ao quadrado é multiplicar o número por ele mesmo.\n${n}² = ${n} × ${n} = ${n*n}`}}
if(t==='quad'){let r1,r2,A=1;if(l===0){r1=R(1,6);r2=R(1,6)}else if(l===1){r1=R(-8,8);r2=R(-8,8)}else{A=R(2,3);r1=R(-6,6);r2=R(-6,6)}
if(r1===r2&&R(0,3))r2=r1+R(1,3);
const B=-A*(r1+r2),C=A*r1*r2,D=B*B-4*A*C,s=Math.sqrt(D),lo=Math.min(r1,r2),hi=Math.max(r1,r2),dbl=r1===r2,big=!dbl&&R(0,1)===1,ans=dbl?r1:(big?hi:lo),x1=(-B+s)/(2*A),x2=(-B-s)/(2*A);
let ex=`${qs(A,B,C)}   (a = ${A}, b = ${m_(B)}, c = ${m_(C)})\n\n1) Calcule o discriminante Δ = b² − 4ac:\nΔ = ${p_(B)}² − 4 × ${A} × ${p_(C)} = ${D}\n\n2) Use a fórmula de Bhaskara: x = (−b ± √Δ) ÷ 2a\n`;
ex+=dbl?`Como Δ = 0, existe uma única raiz:\nx = ${m_(-B)} ÷ ${2*A} = ${m_(x1)}`:`√Δ = ${s}\nx₁ = (${m_(-B)} + ${s}) ÷ ${2*A} = ${m_(x1)}\nx₂ = (${m_(-B)} − ${s}) ÷ ${2*A} = ${m_(x2)}\n\nAs raízes são ${m_(hi)} e ${m_(lo)}.`;
ex+=`\n\nResposta: ${m_(ans)}.\nConfira: soma das raízes = −b ÷ a = ${m_(r1+r2)} e produto = c ÷ a = ${m_(r1*r2)}.`;
return{q:`${qs(A,B,C)}  →  ${dbl?'x':(big?'maior raiz':'menor raiz')} = ?`,r:ans,ex,g:{f:x=>A*x*x+B*x+C,a:Math.min(lo,-1)-2,b:Math.max(hi,1)+2,marks:[...new Set([r1,r2])].map(x=>[x,0])}}}
if(t==='gr'){const lin=l===0||(l===2&&R(0,1)===0);
if(lin){const A=[1,2,3,-1,-2][R(0,l===0?3:4)]*(l===0?1:1),r=R(1,6)*(R(0,1)?1:-1),B=-A*r,eq=trm(A,'x',1)+trm(B,'');
return{q:`Veja o gráfico de y = ${eq}. Em que valor de x a reta cruza o eixo x?`,r,ex:`No eixo x, o valor de y é 0. Então:\n${eq} = 0\n${trm(A,'x',1)} = ${m_(-B)}\nx = ${m_(-B)} ÷ ${p_(A)} = ${m_(r)}\n\nNo gráfico, é o ponto em que a reta encosta no eixo horizontal: x = ${m_(r)}.`,g:{f:x=>A*x+B,a:Math.min(r,0)-3,b:Math.max(r,0)+3,pre:true,marks:[[r,0]]}}}
let r1=R(l===1?-5:-7,l===1?5:7),r2=R(l===1?-5:-7,l===1?5:7);if(r1===r2)r2=r1+R(1,3);
const A=l===2&&R(0,1)?-1:1,B=-A*(r1+r2),C=A*r1*r2,D=B*B-4*A*C,s=Math.sqrt(D),lo=Math.min(r1,r2),hi=Math.max(r1,r2),big=R(0,1)===1;
return{q:`Veja o gráfico de y = ${trm(A,'x²',1)+trm(B,'x')+trm(C,'')}. Qual é a ${big?'maior':'menor'} raiz?`,r:big?hi:lo,ex:`As raízes são os pontos em que a curva corta o eixo x (onde y = 0).\nNo gráfico isso acontece em x = ${m_(lo)} e x = ${m_(hi)}.\nA ${big?'maior':'menor'} raiz é ${m_(big?hi:lo)}.\n\nConfira por Bhaskara: Δ = ${p_(B)}² − 4 × ${p_(A)} × ${p_(C)} = ${D}, √Δ = ${s}\nx = (${m_(-B)} ± ${s}) ÷ ${m_(2*A)}`,g:{f:x=>A*x*x+B*x+C,a:Math.min(lo,0)-2,b:Math.max(hi,0)+2,pre:true,marks:[[lo,0],[hi,0]]}}}
const p=[10,20,25,50,5][R(0,4)],y=R(1,[10,20,40][l])*20;return{q:`${p}% de ${y} = ?`,r:p*y/100,ex:`Porcentagem: p% de y = p ÷ 100 × y\n${p}% de ${y} = ${p} ÷ 100 × ${y} = ${fmtN(p*y/100)}`}}
function mNext(){mq=genQ();mq.done=false;vTrain()}
function vTrain(){if(!mq)mq=Object.assign(genQ(),{done:false});
const sel=(id,v,o)=>`<select id="${id}" aria-label="${id==='mo2'?'Tipo de conta':'Nível'}" style="margin:0" onchange="${id==='mo2'?'mOp':'mLv'}=${id==='mo2'?'this.value':'+this.value'};mNext()">${o.map(([k,l])=>`<option value="${k}" ${String(v)===String(k)?'selected':''}>${l}</option>`).join('')}</select>`;
$('#mc').innerHTML=`<div class="row" style="margin-bottom:12px">${sel('mo2',mOp,[['mix','Misto'],['add','Soma'],['sub','Subtração'],['mul','Multiplicação'],['div','Divisão'],['eq','Equação 1º grau'],['pot','Potência/raiz'],['pct','Porcentagem'],['quad','Equação 2º grau'],['gr','Ler gráfico']])}${sel('ml2',mLv,[[0,'Fácil'],[1,'Médio'],[2,'Difícil']])}</div>
<div class="mut" style="margin-bottom:8px">Acertos: ${ms.ok}/${ms.n} · ${ic('flame',16)} sequência: ${ms.st}</div><div class="box q">${esc(mq.q)}</div>${mq.g&&(mq.g.pre||mq.done)?`<div class="box" style="padding:8px">${plot(mq.g,mq.done?mq.g.marks:null)}</div>`:''}
${mq.done?`<div class="box" style="text-align:center">${mq.ok?`${ic('check')} Correto!`:`${ic('x')} A resposta era <b>${fmtN(mq.r)}</b>`}</div><div class="box"><h2>Como resolver</h2><div style="white-space:pre-wrap;line-height:1.6">${esc(mq.ex||'')}</div></div><button class="btn" onclick="mNext()">Próxima</button>`:`<div class="row"><input id="ma" aria-label="Sua resposta" inputmode="decimal" placeholder="Sua resposta" onkeydown="if(event.key==='Enter')mAns()"><button class="btn gh" style="width:64px;flex:none;margin-bottom:8px" aria-label="Trocar sinal" onclick="const i=$('#ma');i.value=i.value.startsWith('-')?i.value.slice(1):'-'+i.value;i.focus()">±</button></div><button class="btn" onclick="mAns()">Responder</button>`}`;
if(!mq.done){const i=$('#ma');i&&i.focus()}}
function mAns(){const v=parseFloat(($('#ma').value||'').replace(',','.').replace('−','-'));if(isNaN(v))return;mq.done=true;mq.ok=Math.abs(v-mq.r)<0.01;ms.n++;if(mq.ok){ms.ok++;ms.st++}else ms.st=0;vTrain()}
/* gráfico */
function vGraph(){$('#mc').innerHTML=`<div class="box"><input id="gf" aria-label="Função f(x)" value="x^2 - 4" placeholder="f(x) = ..."><div class="row"><div><div class="mut">x mínimo</div><input id="g0" aria-label="x mínimo" type="number" value="-10"></div><div><div class="mut">x máximo</div><input id="g1" aria-label="x máximo" type="number" value="10"></div></div><button class="btn" onclick="mDraw()">Desenhar</button><div class="mut" style="margin-top:8px">Use x, + − * / ^, sin( cos( tan( √( log( ln( abs( e pi</div></div><div class="box" id="gs" style="padding:8px"></div>`;mDraw()}
function mDraw(){const g=$('#gs'),a=+$('#g0').value,b=+$('#g1').value;let fn;
try{fn=comp($('#gf').value);fn(1);if(!(b>a))throw 0}catch(e){g.innerHTML='<div class="mut">Expressão ou intervalo inválido.</div>';return}
const N=400,pts=[];for(let i=0;i<=N;i++){const x=a+(b-a)*i/N;let y;try{y=fn(x)}catch(e){y=NaN}pts.push([x,Number.isFinite(y)&&Math.abs(y)<1e3?y:NaN])}
const ys=pts.map(p=>p[1]).filter(Number.isFinite);if(!ys.length){g.innerHTML='<div class="mut">A função não tem valores nesse intervalo.</div>';return}
let lo=Math.min(...ys),hi=Math.max(...ys);if(hi-lo<1e-9){lo-=1;hi+=1}const pd=(hi-lo)*.08;lo-=pd;hi+=pd;
const W=320,H=260,sx=x=>(x-a)/(b-a)*W,sy=y=>H-(y-lo)/(hi-lo)*H;let d='',pv=null;
pts.forEach(([x,y])=>{if(!Number.isFinite(y)){pv=null;return}d+=(pv===null||Math.abs(y-pv)>(hi-lo)*.7?'M':'L')+sx(x).toFixed(1)+' '+sy(y).toFixed(1);pv=y});
const n=v=>+v.toPrecision(3),nt=(p,q)=>{const r=(q-p)/5,e=10**Math.floor(Math.log10(r)),m=r/e,st=(m<1.5?1:m<3.5?2:m<7.5?5:10)*e,o=[];for(let v=Math.ceil(p/st)*st;v<=q+1e-9;v+=st)o.push(+v.toFixed(10));return o},
grid=nt(a,b).map(v=>`<line x1="${sx(v)}" x2="${sx(v)}" y1="0" y2="${H}" stroke="var(--bd)"/><text x="${sx(v)+2}" y="${H-3}" font-size="10" fill="var(--mut)">${n(v)}</text>`).join('')+nt(lo,hi).map(v=>`<line x1="0" x2="${W}" y1="${sy(v)}" y2="${sy(v)}" stroke="var(--bd)"/><text x="3" y="${sy(v)-2}" font-size="10" fill="var(--mut)">${n(v)}</text>`).join('');
g.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">${grid}${lo<0&&hi>0?`<line x1="0" x2="${W}" y1="${sy(0)}" y2="${sy(0)}" stroke="var(--mut)"/>`:''}${a<0&&b>0?`<line y1="0" y2="${H}" x1="${sx(0)}" x2="${sx(0)}" stroke="var(--mut)"/>`:''}<path d="${d}" fill="none" stroke="var(--ac)" stroke-width="2.5"/></svg><div class="mut" style="display:flex;justify-content:space-between"><span>x: ${n(a)}</span><span>y: ${n(lo)} a ${n(hi)}</span><span>x: ${n(b)}</span></div>`}
/* fórmulas */
const FORM=[['Geometria',['Quadrado: A = l²','Retângulo: A = b × h','Triângulo: A = b × h ÷ 2','Círculo: A = π r² · C = 2 π r','Trapézio: A = (B + b) × h ÷ 2','Cubo: V = a³','Cilindro: V = π r² h','Esfera: V = 4/3 π r³']],
['Álgebra',['Bhaskara: x = (−b ± √Δ) ÷ 2a, com Δ = b² − 4ac','(a + b)² = a² + 2ab + b²','(a − b)² = a² − 2ab + b²','a² − b² = (a + b)(a − b)','PA: aₙ = a₁ + (n − 1) r','PG: aₙ = a₁ · qⁿ⁻¹']],
['Porcentagem e juros',['p% de y = p × y ÷ 100','Aumento de p%: valor × (1 + p/100)','Desconto de p%: valor × (1 − p/100)','Juros simples: J = C · i · t','Juros compostos: M = C · (1 + i)ᵗ']],
['Trigonometria',['Pitágoras: a² = b² + c²','sen = cateto oposto ÷ hipotenusa','cos = cateto adjacente ÷ hipotenusa','tg = cateto oposto ÷ cateto adjacente','sen²x + cos²x = 1']],
['Estatística',['Média = soma dos valores ÷ quantidade','Mediana = valor central dos dados em ordem','Moda = valor que mais aparece']]];
function vForm(){$('#mc').innerHTML=`<div class="box">${FORM.map(([t,l],i)=>`<details ${i===0?'open':''}><summary>${t}</summary>${l.map(x=>`<p>${esc(x)}</p>`).join('')}</details>`).join('')}</div>`}
try{const t=localStorage.getItem('estudofacil.theme');document.documentElement.dataset.theme=t||'dark'}catch(e){}
function toast(m,b,f){const t=$('#toast');t.innerHTML=esc(m)+(b?`<button id="tu">${b}</button>`:'');t.classList.add('on');if(b)$('#tu').onclick=()=>{f();t.classList.remove('on')};clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),6000)}
function vPrev(){$('#view').innerHTML=`<div class="box"><h2>Revisar ${PV.l.length} cartões</h2><div class="mut" style="margin-bottom:8px">Matéria: ${esc(PV.cat)}. Desmarque ou edite antes de salvar.</div>${PV.l.map((x,i)=>`<div class="item" style="display:block"><label style="display:flex;gap:8px;align-items:center;margin-bottom:6px"><input type="checkbox" style="width:auto;margin:0" ${x.on?'checked':''} onchange="PV.l[${i}].on=this.checked"><span class="mut">Cartão ${i+1}</span></label><input value="${esc(x.q)}" oninput="PV.l[${i}].q=this.value"><textarea rows="2" oninput="PV.l[${i}].a=this.value">${esc(x.a)}</textarea></div>`).join('')}</div><div class="row"><button class="btn" onclick="pvSave()">Salvar selecionados</button><button class="btn gh" onclick="PV=null;render()">Descartar</button></div>`}
function pvSave(){let n=0,d=0;PV.l.forEach((x,i)=>{const q=x.q.trim(),a=x.a.trim();if(!x.on||!q||!a)return;if(cards.some(c=>c.cat===PV.cat&&c.q.trim().toLowerCase()===q.toLowerCase())){d++;return}cards.push(mk(q,a,PV.cat,i));n++});lastCat=PV.cat;PV=null;save();render();toast(n+' cartões salvos'+(d?' · '+d+' repetidos ignorados':''))}
function bkExport(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({v:1,cards,M,L,T,TOP,PF,N:NEWMAX,SH:typeof SIMH!=='undefined'?SIMH:[],PET:typeof PET!=='undefined'?PET:null,PLN:typeof PLANS!=='undefined'?PLANS:[]})],{type:'application/json'}));a.download='estudo-facil-backup-'+dk()+'.json';a.click();toast('Backup gerado')}
function bkImport(inp){const f=inp.files[0];inp.value='';if(!f)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!Array.isArray(o.cards))throw 0;const pv={cards,T:{...T},M,L};cards=o.cards.filter(c=>c&&c.q&&c.a).map((c,i)=>({id:c.id||Date.now()+i,q:String(c.q),a:String(c.a),cat:String(c.cat||'Geral'),box:+c.box||0,due:+c.due||0,r:(c.r||((+c.due>0||+c.box>0)&&!c.sn))?1:0,nd:+c.nd||0,sn:c.sn?1:0}));if(Array.isArray(o.TOP)){TOP=o.TOP;saveT()}if(Array.isArray(o.SH)&&typeof SIMH!=='undefined'){SIMH=o.SH.slice(0,30);saveSH()}if(Array.isArray(o.PLN)&&typeof PLANS!=='undefined'){PLANS=o.PLN.filter(p=>p&&Array.isArray(p.s));PLA=PLANS[0]?PLANS[0].id:0;savePL()}if(o.PET&&typeof o.PET==='object'&&window.petImport)petImport(o.PET);if(o.PF&&typeof o.PF==='object'){PF={name:String(o.PF.name||'').slice(0,30),av:+o.PF.av||0};savePF()}M=o.M||M;L=o.L||{};if(typeof o.N==='number')NEWMAX=Math.max(0,o.N);if(o.T)for(const k of ['foco','curta','longa'])if(+o.T[k]>0)T[k]=+o.T[k];if(!P.running){P.rem=null;P.left=dur(P.mode)}save();render();toast(cards.length+' cartões restaurados','Desfazer',()=>{cards=pv.cards;M=pv.M;L=pv.L;save();render()})}catch(e){toast('Arquivo de backup inválido')}};r.readAsText(f)}
try{if(/^https?:/.test(location.protocol)&&navigator.serviceWorker)navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){}
document.addEventListener('keydown',e=>{if(e.key==='Escape')drawer(0);const typing=/INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
if(tab==='study'&&FR&&!typing){if(!FR.q[FR.i])return;if((e.key===' '||e.key==='Enter')&&!FR.sh){e.preventDefault();rvF()}else if(FR.sh&&(e.key==='1'||e.key==='2'))fr(+e.key-1);return}
if(tab==='study'&&UNDO&&(e.key==='z'||e.key==='Z')&&!e.ctrlKey&&!e.metaKey&&!typing){undo();return}
if(tab!=='study'||!cur||typing||EDC)return;
if((e.key===' '||e.key==='Enter')&&!shown){e.preventDefault();rv()}else if(shown&&'1234'.includes(e.key)&&e.key.length===1)rate(+e.key-1);else if(e.key==='e'||e.key==='E')edStart();else if(e.key==='p'||e.key==='P')skip()});
load();render();foot();
/* Slime ao passar o mouse por cima dos cards (só mouse; no toque vale o clique) */
if(!matchMedia('(prefers-reduced-motion:reduce)').matches)document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const c=e.target.closest&&e.target.closest('.sc');if(!c||(e.relatedTarget&&c.contains(e.relatedTarget))||c._hv>Date.now())return;c._hv=Date.now()+700;splat(c)});

/* ===== Cards de massa (slime): física de mola. A massa segue o ponteiro, estica com a velocidade, amassa ao apertar e balança ao soltar ===== */
(function(){
if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
/* [forma de repouso, forma de hover] de cada tipo de card: 8 raios de borda em % */
const SH=[[[62,38,54,46,48,56,44,52],[40,60,46,54,58,40,60,42]],[[46,54,38,62,58,42,58,42],[60,40,55,45,42,58,42,58]],[[55,45,62,38,42,60,40,58],[38,62,40,60,56,44,56,44]],[[40,60,48,52,55,45,55,45],[58,42,62,38,44,56,44,56]]];
const VARS=['--sl-tx','--sl-ty','--sl-rot','--sl-sx','--sl-sy','--sl-dx','--sl-dy','--sl-br'],S=new Map();let raf=0,last=0,cur=null;
const st=c=>{let s=S.get(c);if(!s){s={x:0,y:0,vx:0,vy:0,m:0,vm:0,p:0,vp:0,tx:0,ty:0,tm:0,tp:0,ph:Math.random()*6,sh:SH[[...c.parentNode.children].indexOf(c)%4]};S.set(c,s)}return s};
const wake=c=>{c.classList.add('on');if(!raf){last=performance.now();raf=requestAnimationFrame(tick)}};
function tick(now){raf=0;const dt=Math.min((now-last)/1000,1/30),t=now/1000;last=now;
S.forEach((s,c)=>{if(!c.isConnected){S.delete(c);return}
const K=170,D=11; /* rigidez e amortecimento: diminua D para balançar mais */
s.vx+=((s.tx-s.x)*K-s.vx*D)*dt;s.x+=s.vx*dt;s.vy+=((s.ty-s.y)*K-s.vy*D)*dt;s.y+=s.vy*dt;
s.vm+=((s.tm-s.m)*K*.7-s.vm*D*.8)*dt;s.m+=s.vm*dt;s.vp+=((s.tp-s.p)*K*1.3-s.vp*D*.7)*dt;s.p+=s.vp*dt;
if(Math.abs(s.x)+Math.abs(s.y)+Math.abs(s.vx)+Math.abs(s.vy)+Math.abs(s.m-s.tm)+Math.abs(s.vm)+Math.abs(s.p-s.tp)+Math.abs(s.vp)<.05&&!s.tm&&!s.tp){S.delete(c);c.classList.remove('on');VARS.forEach(k=>c.style.removeProperty(k));return}
const str=Math.min(Math.hypot(s.vx,s.vy)*.0014,.2),w=Math.max(0,s.m),
b=s.sh[0].map((a,k)=>Math.min(72,Math.max(28,a+(s.sh[1][k]-a)*s.m+Math.sin(t*1.8+s.ph+k*.9)*3.4*w)).toFixed(1)),
set=(k,v)=>c.style.setProperty(k,v);
set('--sl-tx',s.x.toFixed(2)+'px');set('--sl-ty',s.y.toFixed(2)+'px');set('--sl-rot',(Math.atan2(s.vy,s.vx)*57.3).toFixed(1)+'deg');
set('--sl-sx',(1+str+.05*s.p+.015*s.m).toFixed(3));set('--sl-sy',(1-str*.6-.08*s.p+.015*s.m).toFixed(3));
set('--sl-dx',(-s.x*.7).toFixed(2)+'px');set('--sl-dy',(-s.y*.7).toFixed(2)+'px');
set('--sl-br',b.slice(0,4).join('% ')+'% / '+b.slice(4).join('% ')+'%')});
if(S.size)raf=requestAnimationFrame(tick)}
const card=e=>e.target.closest&&e.target.closest('.sc'),
aim=(c,e)=>{const r=c.getBoundingClientRect(),s=st(c);s.tx=((e.clientX-r.left)/r.width*2-1)*10;s.ty=((e.clientY-r.top)/r.height*2-1)*8},
off=c=>{const s=S.get(c);if(s){s.tx=s.ty=s.tm=s.tp=0;c.classList.remove('pr')}},
solta=()=>S.forEach((s,c)=>{if(s.tp){s.tp=0;s.vp-=7;s.vm+=3;c.classList.remove('pr')}});
document.addEventListener('pointermove',e=>{const c=card(e);if(cur&&cur!==c)off(cur);cur=c;if(!c)return;st(c).tm=1;aim(c,e);wake(c)});
document.addEventListener('pointerdown',e=>{const c=card(e);if(!c)return;const s=st(c);s.tm=s.tp=1;aim(c,e);c.classList.add('pr');wake(c)});
document.addEventListener('pointerup',e=>{solta();if(e.pointerType!=='mouse'){const c=card(e);if(c)setTimeout(()=>off(c),380)}});
document.addEventListener('pointercancel',()=>{solta();if(cur)off(cur)});
document.documentElement.addEventListener('mouseleave',()=>{if(cur)off(cur);cur=null});
document.addEventListener('focusin',e=>{const c=card(e);if(c){st(c).tm=1;wake(c)}});
document.addEventListener('focusout',e=>{const c=card(e);if(c)off(c)});
})();