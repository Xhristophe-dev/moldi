/* ===== Plano de estudos: você diz o tema e quando pode estudar; a IA monta as sessões; o Moldi encaixa tudo na agenda =====
   Segue o mesmo jeito da aba Aprender (prompt -> resposta colada). Usa funções do app.js e é carregado depois dele. */
const WD=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'],WS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const PTP={leitura:'Leitura',flashcards:'Flashcards',quiz:'Quiz',exercicio:'Exercício',revisao:'Revisão',simulado:'Simulado'},PMAX=40;
let PLANS=[],PLA=0,PVW='';
let PD={t:'',n:'iniciante',o:'aprender do zero',sem:4,dsp:{1:60,3:60,5:60},p:'',r:'',m:[],fix:''};
try{const x=JSON.parse(localStorage.getItem('estudofacil.plans')||'null');if(x&&Array.isArray(x.l)){PLANS=x.l.filter(p=>p&&Array.isArray(p.s));PLA=x.a||0}}catch(e){}
/* rascunho: tema, dias, prompt e resposta colada ficam salvos; se o celular recarregar a página enquanto você usa a IA, nada se perde */
try{const d=JSON.parse(localStorage.getItem('estudofacil.plano.draft')||'null');if(d&&typeof d==='object'){for(const k of ['t','n','o','p','r'])if(typeof d[k]==='string')PD[k]=d[k];if(+d.sem>0)PD.sem=+d.sem;if(d.dsp&&typeof d.dsp==='object')PD.dsp=d.dsp;if(Array.isArray(d.m))PD.m=d.m}}catch(e){}
const savePL=()=>{try{localStorage.setItem('estudofacil.plans',JSON.stringify({l:PLANS,a:PLA}))}catch(e){}};
const saveDR=()=>{try{localStorage.setItem('estudofacil.plano.draft',JSON.stringify(PD))}catch(e){}};
function planReset(){PLANS=[];PLA=0;PVW='';PD={t:'',n:'iniciante',o:'aprender do zero',sem:4,dsp:{1:60,3:60,5:60},p:'',r:'',m:[],fix:''};savePL();saveDR()}

/* ---------- datas e horários (dias contados como em today(): o número do dia local) ---------- */
const pdd=n=>{const d=new Date(n*864e5);return{w:d.getUTCDay(),d:d.getUTCDate(),m:d.getUTCMonth()+1}};
const p2=n=>String(n).padStart(2,'0');
const pdm=n=>{const x=pdd(n);return p2(x.d)+'/'+p2(x.m)};
const dlab=n=>WS[pdd(n).w]+' '+pdm(n);
const hm=m=>m<60?m+' min':Math.floor(m/60)+' h'+(m%60?' '+m%60:'');
const pA=()=>PLANS.find(p=>p.id===PLA)||PLANS[0];
/* encontros dentro de um período; e os próximos N encontros a partir de um dia (usado para reagendar) */
function pSlots(dsp,sem,from){const o=[];for(let k=0;k<sem*7;k++){const dt=from+k,m=+dsp[pdd(dt).w]||0;if(m>0)o.push({dt,m})}return o}
function pFuture(dsp,n,from){const o=[];for(let k=0;k<1100&&o.length<n;k++){const dt=from+k,m=+dsp[pdd(dt).w]||0;if(m>0)o.push({dt,m})}return o}

/* ---------- prompt ---------- */
function pPrompt(){const t=PD.t.trim(),sl=pSlots(PD.dsp,PD.sem,today());PD.m=sl.map(x=>x.m);const N=sl.length;
return `Você é um professor e mentor de estudos experiente, paciente e didático. Monte um plano de estudos sobre: "${t}".

Perfil do aluno: nível ${PD.n}. Objetivo: ${PD.o}.

O aluno vai estudar em ${N} encontros, nesta ordem:
${sl.map((x,i)=>`${i+1}) ${WD[pdd(x.dt).w]} (${pdm(x.dt)}), ${hm(x.m)}`).join('\n')}

Regras:
- Escreva em português do Brasil, com linguagem simples.
- Crie EXATAMENTE ${N} sessões, uma para cada encontro, na mesma ordem, e cada sessão deve caber no tempo daquele encontro.
- Vá do básico ao avançado (dentro do nível pedido). A cada 3 ou 4 sessões, inclua uma sessão de revisão do que já foi visto, e use a última sessão para uma revisão final ou um simulado.
- Em cada sessão: um foco curto, de 2 a 4 tópicos e de 2 a 4 tarefas práticas (o que o aluno deve fazer).
- Cada tarefa tem um tipo: "leitura", "flashcards", "quiz", "exercicio", "revisao" ou "simulado". O aluno usa o app Moldi, que tem flashcards, quiz e simulado, então use esses tipos quando fizer sentido.
- Não invente informações. Se tiver dúvida sobre algo, avise no campo "aviso".
- Não numere as sessões no texto do foco.
- Dentro dos textos, NUNCA use aspas duplas: use aspas simples. Não coloque quebras de linha reais dentro dos textos.

Responda SOMENTE com um JSON válido, dentro de um único bloco de código (abra com três crases seguidas da palavra json e feche com três crases), sem nenhum texto fora do bloco, exatamente neste formato:
{"titulo":"...","resumo":"resumo do plano em 1 ou 2 frases","aviso":"","sessoes":[{"foco":"título curto da sessão","topicos":["..."],"tarefas":[{"t":"o que fazer","tipo":"leitura"}],"dica":"uma dica curta"}]}`}

/* ---------- leitura da resposta ---------- */
/* resposta cortada no meio: aproveita as sessões que vieram completas e fecha o JSON */
function psalv(raw){const a=raw.indexOf('{');if(a<0)throw{m:'não achei um JSON na resposta'};const st=[];let s=false,cut=-1,cs=null;
for(let i=a;i<raw.length;i++){const c=raw[i];if(s){if(c==='\\')i++;else if(c==='"')s=false;continue}if(c==='"'){s=true;continue}
if(c==='{'||c==='[')st.push(c);else if(c==='}'||c===']'){st.pop();if(st.length<=2){cut=i+1;cs=st.slice()}if(!st.length)break}}
if(cut<0)throw{m:'não achei as sessões do plano'};return raw.slice(a,cut)+cs.reverse().map(x=>x==='{'?'}':']').join('')}
const ptipo=k=>{const t=String(k||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();return PTP[t]?t:'leitura'};
function pBuild(raw){raw=raw==null?$('#Pr').value:raw;if(!raw.trim()){toast('Cole primeiro a resposta da IA');return}
/* o celular costuma copiar espaços especiais e caracteres invisíveis, que quebram o JSON */
raw=raw.replace(/[\u200b-\u200d\u2060\ufeff]/g,'').replace(/[\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/g,' ');
const bad=w=>{const t='Não consegui ler a resposta'+(w?' ('+w+')':'')+'. Costuma ser aspas duplas dentro de um texto, ou texto copiado com barras invertidas. Use o botão Copiar do bloco de código da IA.';
PD.fix='A resposta que você enviou tem um erro de JSON'+(w?' ('+w+')':'')+'. Reenvie o JSON completo e corrigido, dentro de um único bloco de código: não use aspas duplas dentro dos textos (troque por aspas simples), não coloque quebras de linha dentro dos textos, não deixe vírgulas sobrando e não escreva nada fora do JSON.';
const m=$('#Pm');if(m){m.innerHTML=esc(t)+'<br><button class="btn gh" style="margin-top:8px" onclick="cp(PD.fix)">Copiar pedido de correção</button>';m.scrollIntoView({behavior:'smooth',block:'center'})}};
let d,cut=false;try{d=jparse(raw)}catch(e){try{d=jparse(psalv(raw));cut=true}catch(e2){bad(e.m);return}}
const S=x=>String(x==null?'':x).trim(),A=x=>Array.isArray(x)?x:[],G=(o,...k)=>{for(const n of k)if(o&&o[n]!=null)return o[n]},
N=x=>S(x).replace(/^(?:sess[aã]o\s*)?\d+\s*[.):-]\s+/i,''),src=A(G(d,'sessoes','sessões','sessions','plano'));
if(!src.length){bad('não achei as sessões do plano');return}
const mins=PD.m&&PD.m.length?PD.m:pSlots(PD.dsp,PD.sem,today()).map(x=>x.m),fresh=pFuture(PD.dsp,mins.length,today());
if(!fresh.length){toast('Escolha pelo menos um dia de estudo');return}
const livre=m=>({f:'Sessão livre: revisar e tirar dúvidas',tp:[],ta:[{t:'Revisar o que ficou mais difícil',k:'revisao',x:0},{t:'Fazer um quiz ou um simulado do tema',k:'quiz',x:0}],dc:'',m,ok:0,sk:0}),
s=mins.map((m,i)=>{const x=src[i];if(!x)return livre(m);
const ta=A(x.tarefas).map(t=>typeof t==='string'?{t:S(t),k:'leitura',x:0}:{t:N(G(t,'t','tarefa','texto')),k:ptipo(G(t,'tipo','k')),x:0}).filter(t=>t.t).slice(0,6);
return{f:N(G(x,'foco','titulo','tema'))||'Sessão '+(i+1),tp:A(x.topicos).map(S).filter(Boolean).slice(0,6),ta:ta.length?ta:[{t:'Estudar o foco da sessão',k:'leitura',x:0}],dc:S(x.dica),m,ok:0,sk:0}});
s.forEach((x,i)=>{x.dt=(fresh[i]||fresh[fresh.length-1]).dt});
const p={id:Date.now(),tema:PD.t.trim(),nivel:PD.n,obj:PD.o,dsp:{...PD.dsp},resumo:S(d.resumo),aviso:S(d.aviso),s};
PLANS.unshift(p);PLA=p.id;savePL();PD.p='';PD.r='';PD.m=[];saveDR();PVW='';vPlan();
const falt=Math.max(0,s.length-src.length),sobra=Math.max(0,src.length-s.length);
toast(falt?`A IA enviou ${Math.min(src.length,s.length)} de ${s.length} sessões: completei o resto com sessões livres.`:sobra?`A IA enviou ${sobra} sessões a mais: usei só as ${s.length} do seu período.`:'Plano criado!')}
function pQuick(){const go2=t=>{PD.r=t;saveDR();pBuild(t)},no=()=>{const e=$('#Pr');if(e){e.scrollIntoView({behavior:'smooth',block:'center'});e.focus()}toast('Cole a resposta da IA nesta caixa')};try{navigator.clipboard.readText().then(t=>t&&t.trim()?go2(t):no(),no)}catch(e){no()}}
function pPaste(){const ok=t=>{$('#Pr').value=t;PD.r=t;saveDR();toast('Colado')},no=()=>toast('Segure o dedo na caixa e escolha Colar');try{navigator.clipboard.readText().then(t=>t&&t.trim()?ok(t):no(),no)}catch(e){no()}}

/* ---------- configuração ---------- */
function pGen(){PD.t=($('#Pt').value||'').trim();const n=pSlots(PD.dsp,PD.sem,today()).length;
if(!PD.t){toast('Escreva o tema que você quer estudar');$('#Pt').focus();return}
if(!n){toast('Escolha pelo menos um dia de estudo');return}
if(n>PMAX){toast('São '+n+' encontros: o máximo é '+PMAX+'. Diminua as semanas ou os dias');return}
PD.p=pPrompt();saveDR();vPlan();const e=$('#Pp');if(e)e.scrollIntoView({behavior:'smooth',block:'start'})}
function pCopy(){cp(PD.p)}
const pDay=(w,on)=>{PD.dsp[w]=on?(+PD.dsp[w]||60):0;PD.p='';saveDR();vPlan()};
const pMin=(w,v)=>{PD.dsp[w]=+v;PD.p='';saveDR();vPlan()};
const pSem=v=>{PD.sem=+v;PD.p='';saveDR();vPlan()};
function pPre(k){PD.dsp=k==='util'?{1:60,2:60,3:60,4:60,5:60}:k==='todos'?{0:60,1:60,2:60,3:60,4:60,5:60,6:60}:k==='fds'?{0:120,6:120}:{};PD.p='';saveDR();vPlan()}
function pSetup(){const sl=pSlots(PD.dsp,PD.sem,today()),n=sl.length,tot=sl.reduce((a,x)=>a+x.m,0);
$('#view').innerHTML=`${PLANS.length?`<button class="btn gh" style="margin-bottom:14px" onclick="PVW='';vPlan()">‹ Voltar ao plano</button>`:''}
<div class="box"><h2>${ic('cal',20)} Novo plano de estudos</h2><div class="mut" style="margin-bottom:10px">Diga o tema e quando você pode estudar. O Moldi monta o pedido para a IA e depois organiza as sessões na sua agenda.</div>
<input id="Pt" aria-label="Tema do plano" placeholder="Ex.: Frações, Revolução Francesa, Crase" value="${esc(PD.t)}" oninput="PD.t=this.value;saveDR()" onkeydown="if(event.key==='Enter')pGen()">
<div class="mut">Seu nível</div><select aria-label="Nível" onchange="PD.n=this.value;PD.p='';saveDR()">${opts(NIV,PD.n)}</select>
<div class="mut">Seu objetivo</div><select aria-label="Objetivo" onchange="PD.o=this.value;PD.p='';saveDR()">${opts(OBJ,PD.o)}</select>
<div class="mut" style="margin-top:4px">Quando você pode estudar?</div>
<div class="chips" style="margin-top:6px"><button class="chip" onclick="pPre('util')">Segunda a sexta</button><button class="chip" onclick="pPre('todos')">Todos os dias</button><button class="chip" onclick="pPre('fds')">Fim de semana</button><button class="chip" onclick="pPre('')">Limpar</button></div>
<div class="pds">${[1,2,3,4,5,6,0].map(w=>`<div class="pd${PD.dsp[w]?' on':''}"><label><input type="checkbox" ${PD.dsp[w]?'checked':''} onchange="pDay(${w},this.checked)"> ${WS[w]}</label>${PD.dsp[w]?`<select aria-label="Tempo na ${WD[w]}" onchange="pMin(${w},this.value)">${[15,30,45,60,90,120,150,180,240].map(m=>`<option value="${m}"${m===+PD.dsp[w]?' selected':''}>${hm(m)}</option>`).join('')}</select>`:'<span class="mut">folga</span>'}</div>`).join('')}</div>
<div class="mut">Por quantas semanas?</div><select aria-label="Semanas" onchange="pSem(this.value)">${[1,2,3,4,6,8].map(x=>`<option value="${x}"${x===PD.sem?' selected':''}>${x} ${x===1?'semana':'semanas'}</option>`).join('')}</select>
<div class="${n>PMAX?'late-t':'mut'}" style="margin:2px 0 12px">${n?`<b>${n}</b> ${n===1?'encontro':'encontros'} · ${hm(tot)} no total${n>PMAX?` (máximo ${PMAX}: diminua as semanas ou os dias)`:''}`:'Escolha pelo menos um dia de estudo.'}</div>
<button class="btn" onclick="pGen()">Gerar prompt do plano</button></div>
${PD.p?`<div class="box" id="Pp"><h2>1. Copie e cole na sua IA</h2><textarea id="Pk" aria-label="Prompt para copiar" rows="6" readonly>${esc(PD.p)}</textarea><button class="btn" onclick="pCopy()">Copiar prompt</button><div class="mut" style="margin-top:8px;font-size:13px">Cole em ChatGPT, Gemini, Claude, Copilot ou outra IA. Os planos gratuitos costumam bastar.</div></div>`:''}
<div class="box"><h2>${PD.p?'2. Cole a resposta aqui':'Já tem a resposta da IA?'}</h2><div class="mut" style="font-size:13px;margin-bottom:8px">No celular, use o botão <b>Copiar</b> do bloco de código da IA.</div>
<button class="btn" onclick="pQuick()">Colar e montar plano</button>
<textarea id="Pr" aria-label="Resposta da IA" rows="5" style="margin-top:10px" placeholder="Ou cole aqui o que a IA devolveu" oninput="PD.r=this.value;saveDR()">${esc(PD.r)}</textarea>
<div class="row"><button class="btn gh" onclick="pPaste()">Colar</button><button class="btn" onclick="pBuild()">Montar plano</button></div><div id="Pm" class="mut" style="margin-top:8px"></div></div>`}

/* ---------- plano montado ---------- */
const pk=fn=>{const o=[...document.querySelectorAll('details[data-i][open]')].map(d=>d.dataset.i);fn();o.forEach(i=>{const d=document.querySelector('details[data-i="'+i+'"]');if(d)d.open=true})};
const pAct=k=>({flashcards:`<button class="chip" onclick="go('study')">Abrir Estudar</button>`,quiz:`<button class="chip" onclick="QM='treino';go('quiz')">Abrir Quiz</button>`,simulado:`<button class="chip" onclick="QM='sim';go('quiz')">Fazer simulado</button>`})[k]||'';
function pTk(i,j){const p=pA(),s=p.s[i];s.ta[j].x=s.ta[j].x?0:1;const ok=s.ta.every(t=>t.x);const era=s.ok;s.ok=ok?1:0;savePL();pk(vPlan);if(ok&&!era){toast('Sessão concluída!');window.petEvt&&petEvt('plano',p.id+':'+i)}}
function pDone(i){const s=pA().s[i];const ok=!s.ok;s.ta.forEach(t=>t.x=ok?1:0);s.ok=ok?1:0;s.sk=0;savePL();pk(vPlan);if(ok){toast('Sessão concluída!');window.petEvt&&petEvt('plano',pA().id+':'+i)}}
function pSkip(i){const s=pA().s[i];s.sk=s.sk?0:1;if(s.sk){s.ok=0;s.ta.forEach(t=>t.x=0)}savePL();pk(vPlan)}
function pSel(id){PLA=+id;savePL();vPlan()}
function pNew(){PVW='new';vPlan()}
function pDel(){const p=pA();if(!p||!confirm('Apagar o plano "'+p.tema+'"? Isso não pode ser desfeito.'))return;PLANS=PLANS.filter(x=>x!==p);PLA=PLANS[0]?PLANS[0].id:0;savePL();vPlan()}
function pLearn(){const p=pA();LS.t=p.tema;saveLS();go('learn')}
/* reagendar: as sessões que não foram feitas passam para os próximos dias de estudo, na mesma ordem */
function pResched(){const p=pA(),t=today(),pend=p.s.map((_,i)=>i).filter(i=>!p.s[i].ok&&!p.s[i].sk),usado=new Set(p.s.filter(s=>s.ok).map(s=>s.dt)),fut=pFuture(p.dsp,pend.length+p.s.length,t).filter(x=>!usado.has(x.dt)).slice(0,pend.length); /* um dia com sessão já feita não recebe outra */
if(!fut.length){toast('Este plano não tem dias de estudo definidos');return}
pend.forEach((i,k)=>{p.s[i].dt=fut[k].dt});savePL();pk(vPlan);toast('Sessões reagendadas a partir de hoje')}
function pBody(s,i){return `${s.tp.length?`<div class="mut" style="margin-top:6px">Tópicos</div><ul class="ptp">${s.tp.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
<div class="mut" style="margin-top:6px">Tarefas</div>${s.ta.map((t,j)=>`<div class="tkr"><label class="tk${t.x?' on':''}"><input type="checkbox" ${t.x?'checked':''} onchange="pTk(${i},${j})"><span><small class="tpk">${PTP[t.k]||''}</small> ${esc(t.t)}</span></label>${pAct(t.k)}</div>`).join('')}
${s.dc?`<div class="why"><b>Dica:</b> ${esc(s.dc)}</div>`:''}
<div class="row" style="margin-top:10px"><button class="btn${s.ok?' gh':''}" onclick="pDone(${i})">${s.ok?'Reabrir sessão':'Concluir sessão'}</button><button class="btn gh" onclick="go('pomo')">${ic('timer',18)} Foco</button><button class="btn gh" onclick="pSkip(${i})">${s.sk?'Desfazer pular':'Pular'}</button></div>`}
function vPlan(){if(PVW==='new'||!PLANS.length){pSetup();return}
const p=pA(),t=today(),n=p.s.length,ok=p.s.filter(s=>s.ok).length,sk=p.s.filter(s=>s.sk).length,pct=Math.round(ok/Math.max(1,n-sk)*100),
pend=p.s.filter(s=>!s.ok&&!s.sk),late=pend.filter(s=>s.dt<t),idx=s=>p.s.indexOf(s),hoje=p.s.find(s=>s.dt===t&&!s.sk),prox=pend.find(s=>s.dt>t),fim=p.s[n-1].dt;
const base=p.s[0].dt-((pdd(p.s[0].dt).w+6)%7);let wk=-1;
const agenda=p.s.map((s,i)=>{const w=Math.floor((s.dt-base)/7),h=w!==wk?(wk=w,`<div class="mut pw">Semana ${w+1} · ${pdm(base+w*7)} a ${pdm(base+w*7+6)}</div>`):'',
st=s.ok?'ok':s.sk?'sk':s.dt<t?'late':s.dt===t?'now':'fut',ic2={ok:'✓',sk:'⊘',late:'!',now:'●',fut:'○'}[st];
return h+`<details class="sri pl-${st}" data-i="${i}"><summary><span class="ico" aria-hidden="true">${ic2}</span> <b>${dlab(s.dt)}</b> · ${esc(s.f)} <small class="mut">(${hm(s.m)})</small></summary>${pBody(s,i)}</details>`}).join('');
$('#view').innerHTML=`${PLANS.length>1?`<select aria-label="Escolher plano" onchange="pSel(this.value)" style="margin-bottom:10px">${PLANS.map(x=>`<option value="${x.id}"${x===p?' selected':''}>${esc(x.tema)}</option>`).join('')}</select>`:''}
<div class="box"><h2>${esc(p.tema)}</h2>${p.resumo?`<div style="white-space:pre-wrap">${esc(p.resumo)}</div>`:''}${p.aviso?`<div class="mut" style="margin-top:8px">Aviso da IA: ${esc(p.aviso)}</div>`:''}
<div class="mut" style="margin-top:8px">${ok} de ${n-sk} ${n-sk===1?'sessão':'sessões'} concluídas${sk?` · ${sk} ${sk===1?'pulada':'puladas'}`:''} · termina em ${dlab(fim)}</div><div class="bar" role="progressbar" aria-label="Progresso do plano" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>
<div class="mut" style="font-size:13px">Conteúdo gerado por IA: confira o que for importante.</div></div>
${late.length?`<div class="box pl-lt"><b class="late-t">${late.length} ${late.length===1?'sessão atrasada':'sessões atrasadas'}</b><div class="mut" style="margin:4px 0 10px">As sessões que não foram feitas passam para os próximos dias de estudo, na mesma ordem.</div><button class="btn" onclick="pResched()">Reagendar para os próximos dias</button></div>`:''}
${!pend.length?`<div class="box q">${ic('check',32)} Plano concluído!<span class="mut">Você fez todas as sessões. Que tal um simulado para fechar?</span><button class="btn" onclick="QM='sim';go('quiz')">Fazer simulado</button></div>`
:hoje?`<div class="box pl-hoje"><h2>Hoje · ${esc(hoje.f)}</h2><div class="mut">${dlab(hoje.dt)} · ${hm(hoje.m)}${hoje.ok?' · concluída ✓':''}</div>${pBody(hoje,idx(hoje))}</div>`
:`<div class="box"><h2>Hoje não tem sessão</h2>${prox?`<div class="mut">Próxima: <b>${dlab(prox.dt)}</b> · ${esc(prox.f)} (${hm(prox.m)})</div>`:''}</div>`}
<h2 style="margin:18px 0 6px">Agenda</h2>${agenda}
<div style="margin-top:16px"><button class="btn gh" onclick="pLearn()">${ic('spark',18)} Gerar flashcards e quiz deste tema</button><button class="btn gh" style="margin-top:8px" onclick="pNew()">Novo plano</button><button class="btn gh" style="margin-top:8px" onclick="pDel()">Apagar este plano</button></div>`}

/* cartão de "Plano de hoje" na tela Início (chamado pelo render() do app.js) */
function planHome(){const p=pA();if(!p)return;const t=today(),pend=p.s.filter(s=>!s.ok&&!s.sk);if(!pend.length)return;
const hoje=p.s.find(s=>s.dt===t&&!s.sk),late=pend.filter(s=>s.dt<t).length,prox=pend.find(s=>s.dt>t),n=p.s.length,sk=p.s.filter(s=>s.sk).length,pct=Math.round(p.s.filter(s=>s.ok).length/Math.max(1,n-sk)*100);
const msg=hoje?(hoje.ok?'Sessão de hoje concluída ✓':`Hoje: <b>${esc(hoje.f)}</b> · ${hm(hoje.m)}`):prox?`Próxima sessão: <b>${dlab(prox.dt)}</b> · ${esc(prox.f)}`:'';
const v=$('#view'),h=v&&v.firstElementChild;if(!h||v.querySelector('.pl-home'))return;
h.insertAdjacentHTML('afterend',`<div class="box pl-home"><span class="mut">${ic('cal',18)} Plano: ${esc(p.tema)}</span><div style="margin:4px 0">${msg}</div>${late?`<div class="late-t" style="margin-bottom:6px">${late} ${late===1?'sessão atrasada':'sessões atrasadas'}</div>`:''}<div class="bar"><i style="width:${pct}%"></i></div><button class="btn" onclick="go('plan')">Abrir plano</button></div>`)}