/* RafaFit 2.0 — PWA local, preserva armazenamento e backups v1. */
(()=>{
'use strict';
const KEY='rafafit.v1';
const BASELINE_DATE='2026-11-09';
const DAYS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const PLAN={
  1:{name:'Peito + tríceps',time:'17h30–17h55',other:['Bike indoor · 18h–18h40','FitDance · 19h–19h50'],activities:['walk','strength','bike','dance'],exercises:[
    {id:'m_incline',name:'Supino inclinado (halteres)',target:'3 × 8–12'},
    {id:'m_press',name:'Supino reto (máquina)',target:'2 × 8–12'},
    {id:'m_triceps',name:'Tríceps na polia',target:'2 × 10–15'}]},
  2:{name:'Pernas A (leve) + GAP',time:'17h30–18h00',other:['GAP · 18h10–18h40'],activities:['walk','strength','gap'],exercises:[
    {id:'t_legpress',name:'Leg press',target:'2 × 10–12'},
    {id:'t_legcurl',name:'Mesa flexora',target:'2 × 10–15'},
    {id:'t_calf',name:'Panturrilha',target:'2 × 12–20'}]},
  3:{name:'Costas + bíceps',time:'17h30–17h55',other:['Bike indoor · 18h–18h40','FitDance · 19h–19h50'],activities:['walk','strength','bike','dance'],exercises:[
    {id:'w_pulldown',name:'Puxada alta',target:'3 × 8–12'},
    {id:'w_row',name:'Remada sentada',target:'2 × 8–12'},
    {id:'w_curl',name:'Rosca bíceps (halteres)',target:'2 × 10–15'}]},
  4:{name:'Pernas B (leve) + GAP',time:'17h30–18h00',other:['GAP · 18h10–18h40'],activities:['walk','strength','gap'],exercises:[
    {id:'th_smith',name:'Agachamento Smith',target:'2 × 8–12'},
    {id:'th_stiff',name:'Stiff',target:'2 × 8–12'},
    {id:'th_hip',name:'Hip thrust (máquina)',target:'2 × 10–15'}]},
  5:{name:'Superior completo',time:'17h30–17h55',other:['Bike indoor · 18h–18h40','FitDance · 19h–19h50'],activities:['walk','strength','bike','dance'],exercises:[
    {id:'f_press',name:'Supino reto (máquina)',target:'2 × 8–12'},
    {id:'f_row',name:'Remada sentada',target:'2 × 8–12'},
    {id:'f_lateral',name:'Elevação lateral',target:'2 × 12–15'},
    {id:'f_face',name:'Face pull',target:'2 × 12–20'}]}
};
const ACTIVITIES={walk:['Caminhada de 1 km','Trajeto até a academia'],strength:['Musculação','Exercícios do Hevy'],bike:['Bike indoor','18h00–18h40'],dance:['FitDance','19h00–19h50'],gap:['GAP','18h10–18h40'],mobility:['Mobilidade / alongamento','Opcional, sem dor']};
const MEALS=[
  ['breakfast','06h30–07h','Café da manhã','Ovos, pão integral e fruta'],
  ['morning','09h','Lanche opcional','Fruta se houver fome'],
  ['lunch','11h','Almoço','Arroz, feijão, proteína e legumes'],
  ['afternoon','14h30','Lanche da tarde','Whey e/ou iogurte caseiro com aveia'],
  ['preworkout','16h15','Pré-treino','Banana, com complemento se necessário'],
  ['dinner','Pós-aula','Jantar','Proteína, carboidrato, feijão e vegetais'],
  ['supper','21h30','Ceia opcional','Iogurte ou leite, se precisar']
];
function localISO(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function parseDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return new Date();const [y,m,d]=s.split('-').map(Number);const v=new Date(y,m-1,d,12,0,0);return Number.isNaN(v.getTime())?new Date():v;}
function shiftDate(iso,days){const d=parseDate(iso);d.setDate(d.getDate()+days);return localISO(d);}
function monday(iso){const d=parseDate(iso);const dow=(d.getDay()+6)%7;d.setDate(d.getDate()-dow);return localISO(d);}
function displayDate(iso,opts={day:'2-digit',month:'short',year:'numeric'}){return parseDate(iso).toLocaleDateString('pt-BR',opts);}
function num(v){if(v===undefined||v===null||v==='')return null;const n=Number(String(v).replace(',','.'));return Number.isFinite(n)?n:null;}
function esc(value){return String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function clamp(v,min,max){return Math.min(max,Math.max(min,v));}
function freshState(){return {version:1,settings:{waterGoal:2700,proteinGoal:130,startDate:BASELINE_DATE},daily:{},measurements:{},customExercises:{},workoutPresets:{},workoutRest:{},createdAt:new Date().toISOString()};}
function load(){try{const raw=localStorage.getItem(KEY);if(!raw)return freshState();const input=JSON.parse(raw);if(!input||input.version!==1||typeof input!=='object')return freshState();const state=freshState();return {...state,...input,settings:{...state.settings,...input.settings},daily:input.daily&&typeof input.daily==='object'&&!Array.isArray(input.daily)?input.daily:{},measurements:input.measurements&&typeof input.measurements==='object'&&!Array.isArray(input.measurements)?input.measurements:state.measurements,customExercises:input.customExercises&&typeof input.customExercises==='object'&&!Array.isArray(input.customExercises)?input.customExercises:{},workoutPresets:input.workoutPresets&&typeof input.workoutPresets==='object'&&!Array.isArray(input.workoutPresets)?input.workoutPresets:{},workoutRest:input.workoutRest&&typeof input.workoutRest==='object'&&!Array.isArray(input.workoutRest)?input.workoutRest:{}};}catch(e){return freshState();}}
let model=load();
let ui={tab:'today',date:localISO(),week:monday(localISO()),toast:'',guide:null};
let toastTimer;
const root=document.getElementById('app');
function save(){try{localStorage.setItem(KEY,JSON.stringify(model));return true;}catch(e){showToast('Armazenamento indisponível. Faça um backup dos dados.');return false;}}
function day(iso=ui.date){return model.daily[iso]||{};}
function ensureDay(iso=ui.date){if(!model.daily[iso]||typeof model.daily[iso]!=='object')model.daily[iso]={};return model.daily[iso];}
function measurement(iso=ui.date){return model.measurements[iso]||{};}
function dow(iso){return parseDate(iso).getDay();}
function currentPlan(iso=ui.date){return PLAN[dow(iso)]||null;}
function fmt(v,suffix=''){return v===null||v===undefined||v===''?'—':`${Number(v).toLocaleString('pt-BR',{maximumFractionDigits:1})}${suffix}`;}
function showToast(msg){const old=document.querySelector('.toast');if(old)old.remove();const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=msg;document.body.append(el);clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.remove(),3000);}
function section(title,meta=''){return `<div class="section-title"><h2>${title}</h2>${meta?`<span>${meta}</span>`:''}</div>`;}
function field(label,key,value,options={}){const typ=options.type||'number';const opts=options.step||'any';const min=options.min!==undefined?` min="${options.min}"`:'';const max=options.max!==undefined?` max="${options.max}"`:'';return `<div class="field"><label for="${esc(key)}">${label}</label><input id="${esc(key)}" type="${typ}" step="${opts}"${min}${max} data-${options.measure?'measure':'field'}="${esc(key)}" value="${esc(value??'')}" placeholder="${esc(options.placeholder||'—')}" /></div>`;}
function header(){return `<header class="top"><div class="brand"><div class="brandmark" aria-hidden="true">R+</div><div><div class="brandname">RafaFit</div><div class="micro">Seu diário de evolução</div></div></div><div class="top-right"><strong>30 dias de foco</strong><small>09 nov – 08 dez 2026</small></div></header>`;}
function nav(){const entries=[['today','⌂','Hoje'],['training','▥','Treino'],['evolution','↗','Evolução'],['reports','▤','Relatório'],['settings','⚙','Ajustes']];return `<nav class="nav" aria-label="Navegação principal"><div class="nav-inner">${entries.map(([id,icon,label])=>`<button type="button" class="${ui.tab===id?'active':''}" data-tab="${id}" aria-current="${ui.tab===id?'page':'false'}"><span class="sym" aria-hidden="true">${icon}</span><span>${label}</span></button>`).join('')}</div></nav>`;}
function datebar(){return `<div class="datebar"><button type="button" data-shift="-1" aria-label="Dia anterior">‹</button><input aria-label="Data do registro" type="date" id="datePicker" value="${ui.date}" /><button type="button" data-shift="1" aria-label="Próximo dia">›</button></div>`;}
function achieved(iso){const d=day(iso);const plan=currentPlan(iso);return plan?plan.activities.filter(id=>d.activities?.[id]===true).length:0;}
function metricsForWeek(start){const all=Array.from({length:7},(_,i)=>shiftDate(start,i));const today=localISO();const elapsed=all.filter(x=>x<=today);const eligible=elapsed.filter(x=>PLAN[dow(x)]);let planned=0,completed=0;for(const iso of eligible){const p=currentPlan(iso);planned+=p.activities.length;completed+=p.activities.filter(id=>day(iso).activities?.[id]===true).length;}
 const logged=all.filter(iso=>model.daily[iso]&&Object.keys(model.daily[iso]).length>0);
 const sugar=all.filter(iso=>day(iso).sugar===true).length;
 const sugarBad=all.filter(iso=>day(iso).sugar===false).length;
 const waterDays=all.filter(iso=>num(day(iso).waterMl)!==null&&num(day(iso).waterMl)>0);
 const avgWater=waterDays.length?Math.round(waterDays.reduce((s,iso)=>s+num(day(iso).waterMl),0)/waterDays.length):null;
 const sleepDays=all.filter(iso=>num(day(iso).sleep)!==null);
 const avgSleep=sleepDays.length?sleepDays.reduce((s,iso)=>s+num(day(iso).sleep),0)/sleepDays.length:null;
 const proteinDays=all.filter(iso=>num(day(iso).protein)!==null);
 const avgProtein=proteinDays.length?proteinDays.reduce((s,iso)=>s+num(day(iso).protein),0)/proteinDays.length:null;
 const creatineDays=all.filter(iso=>num(day(iso).creatine)!==null&&num(day(iso).creatine)>0).length;
 const wheyDays=all.filter(iso=>(num(day(iso).whey)||0)>0).length;
 return {all,elapsed,eligible,planned,completed,logged,sugar,sugarBad,waterDays,avgWater,sleepDays,avgSleep,proteinDays,avgProtein,creatineDays,wheyDays};}
function today(){const d=day(),p=currentPlan(),w=metricsForWeek(monday(ui.date)),a=d.activities||{};const workoutStatus=p?`${achieved(ui.date)}/${p.activities.length}`:'Livre';const water=Number(d.waterMl)||0;const target=Number(model.settings.waterGoal)||2700;const dMark=measurement();const activityKeys=p?[...p.activities,'mobility']:['walk','mobility'];
return `<div class="heading"><div class="micro">Registro diário</div><h1>${esc(DAYS[dow(ui.date)])}, ${displayDate(ui.date,{day:'numeric',month:'long'})}</h1><p>Tudo registrado no próprio aparelho, inclusive offline.</p></div>${datebar()}
<div class="grid3" style="margin-top:13px"><div class="stat"><div class="micro">Água</div><div class="value cyan">${fmt(water/1000,' L')}</div><div class="hint">Meta de ${fmt(target/1000,' L')}</div></div><div class="stat"><div class="micro">Atividades</div><div class="value">${workoutStatus}</div><div class="hint">Previstas hoje</div></div><div class="stat"><div class="micro">Sem açúcar</div><div class="value ${d.sugar===true?'accent':''}">${d.sugar===true?'Sim':d.sugar===false?'Não':'—'}</div><div class="hint">Açúcar adicionado</div></div></div>
${section('Hidratação','Meta ajustável em Ajustes')}<section class="card"><div class="row between"><div><div class="water-big">${fmt(water)} <span style="font-size:16px;color:var(--sub)">ml</span></div><div class="water-target">Referência do dia: ${fmt(target)} ml</div></div><button class="button tiny minimal" data-action="water-zero">Zerar</button></div><div class="progress" style="margin-top:13px"><span style="width:${clamp(100*water/target,0,100)}%"></span></div><div class="water-controls"><button class="button" data-water="-250">− 250 ml</button><button class="button primary" data-water="500">+ 1 garrafinha (500 ml)</button><button class="button" data-water="250">+ 250 ml</button></div><p class="hint" style="margin-top:12px">A referência é flexível; ajuste conforme calor, sede, suor e orientação clínica. Não beba além da sede à força.</p></section>
${section('Atividades',p?esc(p.name):'Fim de semana • recuperação')}<section class="card">${activityKeys.map(id=>{const entry=ACTIVITIES[id];return `<div class="activity"><label><input type="checkbox" data-activity="${id}" ${a[id]===true?'checked':''}/><span><strong>${entry[0]}</strong><span class="sub">${entry[1]}</span></span></label><span class="${a[id]?'done':'planned'}">${a[id]?'Concluído':p&&p.activities.includes(id)?'Previsto':'Opcional'}</span></div>`;}).join('')}<div class="hint" style="margin-top:11px">Marque somente depois de realizar a atividade. A caminhada conta como o trajeto de aproximadamente 1 km.</div></section>
${section('Alimentação','Sem açúcar adicionado • 30 dias')}<section class="card"><div class="row between" style="flex-wrap:wrap"><div><h3>Consumiu açúcar adicionado hoje?</h3><p class="hint">Marque ao final do dia. Frutas inteiras são permitidas.</p></div><div class="buttons"><button class="pill ${d.sugar===true?'selected':''}" data-sugar="true">Não consumi ✓</button><button class="pill danger ${d.sugar===false?'selected':''}" data-sugar="false">Consumi</button></div></div></section><section class="card">${MEALS.map(([id,time,label,placeholder])=>{const effectiveTime=id==='dinner'&&[2,4].includes(dow(ui.date))?'19h–19h30':id==='dinner'?'20h15':time;return `<div class="meal"><div class="when">${effectiveTime}<div style="color:var(--sub);font-weight:500;margin-top:4px">${label}</div></div><div><textarea data-meal="${id}" rows="2" placeholder="${esc(placeholder)}" aria-label="${esc(label)}">${esc(d.meals?.[id]||'')}</textarea></div></div>`;}).join('')}</section>
${section('Suplementos e proteínas')}<section class="card"><div class="field-group">${field('Creatina (g)','creatine',d.creatine,{min:0,max:30})}${field('Whey (doses)','whey',d.whey,{min:0,max:10})}${field('Proteína total (g) — opcional','protein',d.protein,{min:0,max:500})}${field('Sono (horas)','sleep',d.sleep,{min:0,max:24})}${field('Ovos no café (unidades)','eggs',d.eggs,{min:0,max:20,step:'1'})}${field('Iogurte caseiro (g)','yogurt',d.yogurt,{min:0,max:2000})}</div><p class="hint" style="margin-top:12px">Meta de proteína aproximada: 120–140 g/dia. A creatina costuma ser usada em 3–5 g/dia, conforme orientação profissional. Registre apenas o que consumiu.</p></section>
${section('Bem-estar e observações')}<section class="card"><div class="field-group">${field('Energia (1 a 5)','energy',d.energy,{min:1,max:5,step:'1'})}${field('Fadiga (1 a 5)','fatigue',d.fatigue,{min:1,max:5,step:'1'})}</div><div class="field" style="margin-top:12px"><label for="notes">Notas do dia</label><textarea id="notes" data-field="notes" placeholder="Fome, disposição, dificuldade no exercício, recuperação, sintomas...">${esc(d.notes||'')}</textarea></div></section>
${section('Medidas registradas neste dia')}<section class="card"><div class="field-group">${field('Peso (kg)','weight',dMark.weight,{measure:true,min:0,max:350})}${field('Cintura (cm)','waist',dMark.waist,{measure:true,min:0,max:250})}${field('Gordura corporal (%)','bodyFat',dMark.bodyFat,{measure:true,min:0,max:100})}${field('Pressão sistólica','bpSystolic',dMark.bpSystolic,{measure:true,min:30,max:300})}${field('Pressão diastólica','bpDiastolic',dMark.bpDiastolic,{measure:true,min:20,max:220})}${field('Massa muscular (%)','muscle',dMark.muscle,{measure:true,min:0,max:100})}${field('Gordura visceral (índice)','visceral',dMark.visceral,{measure:true,min:0,max:60})}${field('IMC','bmi',dMark.bmi,{measure:true,min:0,max:100})}${field('Metabolismo basal (kcal)','bmr',dMark.bmr,{measure:true,min:0,max:5000})}${field('Idade metabólica (anos)','metabolicAge',dMark.metabolicAge,{measure:true,min:0,max:120})}</div><p class="hint" style="margin-top:12px">A bioimpedância pode variar com a hidratação; compare medições em condições parecidas.</p></section>
<div class="notice">O preenchimento é salvo automaticamente neste navegador. Para não perder registros se trocar ou limpar o celular, faça backup em <strong>Ajustes</strong>.</div>`;}
function exerciseHistory(guideId,until=ui.date){
 const guide=window.RafaFitGuides;const canon=guide?.key(guideId)||guideId;
 const rows=[];
 for(const iso of Object.keys(model.daily).sort()){
   if(iso>=until)continue;
   const logs=model.daily[iso]?.exerciseLogs||{};
   for(const [id,r] of Object.entries(logs)){
     if((guide?.key(id)||id)!==canon||!r)continue;
     const sum=window.RafaFitSets.summary(r);
     if(!sum)continue;
     rows.push({date:iso,sets:sum.sets,reps:sum.reps,load:sum.load});
   }
 }
 return rows.slice(-6).reverse();
}
function exerciseHistoryMarkup(id){
 const rows=exerciseHistory(id);
 if(!rows.length)return '<section class="guide-history"><h3>Seu histórico de cargas</h3><p class="hint">Nenhum registro anterior desse movimento. As cargas serão exibidas aqui após seus próximos treinos.</p></section>';
 return `<section class="guide-history"><h3>Seu histórico de cargas</h3><div class="table-wrapper"><table class="data-table"><thead><tr><th>Data</th><th>Séries</th><th>Reps.</th><th>Carga</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${displayDate(r.date,{day:'2-digit',month:'short'})}</td><td>${esc(r.sets??'—')}</td><td>${esc(r.reps??'—')}</td><td>${r.load===null||r.load===undefined||r.load===''?'—':esc(r.load)+' kg'}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function library(){const g=window.RafaFitGuides?.GUIDES||{};
 const arr=Object.entries(g).sort((a,b)=>a[1].group.localeCompare(b[1].group,'pt-BR')||a[1].title.localeCompare(b[1].title,'pt-BR'));
 return `<section class="card library-card"><details><summary><span><strong>Biblioteca de movimentos</strong><small>${arr.length} demonstrações visuais • offline</small></span><span class="summary-caret">⌄</span></summary><div class="library-items">${arr.map(([key,guide])=>`<button class="library-btn" type="button" data-guide="${esc(key)}"><span class="library-icon">▶</span><span><strong>${esc(guide.title)}</strong><small>${esc(guide.group)}</small></span><span class="library-chevron">›</span></button>`).join('')}</div></details></section>`;
}
function findExerciseForSets(id){
 const p=currentPlan();
 const exercise=[...(p?.exercises||[]),...(model.customExercises[dow(ui.date)]||[])].find(e=>e.id===id);
 return exercise||null;
}
function getWorkoutRows(id){
 const ex=findExerciseForSets(id);
 if(!ex)return null;
 return window.RafaFitSets.rows(ex,day().exerciseLogs?.[id],model.workoutPresets?.[id]);
}
function saveWorkoutRows(id,rows){
 const d=ensureDay();
 if(!d.exerciseLogs)d.exerciseLogs={};
 d.exerciseLogs[id]={...(d.exerciseLogs[id]||{}),series:rows.map(window.RafaFitSets.sanitize)};
 save();
}
function editWorkoutSetField(input){
 const id=input.dataset.setId,idx=Number(input.dataset.setRow),key=input.dataset.setField;
 if(!id||!Number.isInteger(idx)||!['kg','reps'].includes(key))return;
 const rows=getWorkoutRows(id);if(!rows||!rows[idx])return;
 const v=input.value===''?'':Number(input.value.replace(',','.'));
 if(v!==''&&(!Number.isFinite(v)||v<0||v>(key==='kg'?1000:200)||(key==='reps'&&!Number.isInteger(v))))return;
 rows[idx][key]=v;
 saveWorkoutRows(id,rows);
}
function toggleWorkoutSet(input){
 const id=input.dataset.setId,idx=Number(input.dataset.setRow);
 const rows=getWorkoutRows(id);if(!rows||!rows[idx])return;
 const wasDone=rows[idx].done;
 rows[idx].done=Boolean(input.checked);
 saveWorkoutRows(id,rows);
 if(input.checked&&!wasDone&&ui.date===localISO()){
   const ex=findExerciseForSets(id);
   const seconds=Number(model.workoutRest?.[id])||90;
   window.RafaFitRest?.start({id,name:ex?.name||'Exercício',seconds});
 }
 render();
}
function workoutSetAction(button){
 const id=button.dataset.setId,act=button.dataset.setAction;
 const rows=getWorkoutRows(id);
 if(!rows)return;
 if(act==='add'){
   if(rows.length>=12){showToast('Máximo de 12 séries por exercício.');return;}
   const last=rows[rows.length-1];
   rows.push({kg:last?.kg??'',reps:last?.reps??'',done:false});
   saveWorkoutRows(id,rows);render();return;
 }
 if(act==='remove'){
   if(rows.length<=1){showToast('É necessária pelo menos uma série.');return;}
   if(rows[rows.length-1].done&&!confirm('A última série já está concluída. Deseja removê-la mesmo assim?'))return;
   rows.pop();saveWorkoutRows(id,rows);render();return;
 }
 if(act==='preset'){
   if(!model.workoutPresets||typeof model.workoutPresets!=='object')model.workoutPresets={};
   model.workoutPresets[id]=rows.map(a=>({kg:a.kg,reps:a.reps,done:false}));
   save();
   render();
   showToast('Ficha-padrão salva! As próximas sessões começam desmarcadas.');
 }
}
function training(){const p=currentPlan();const records=day().exerciseLogs||{};const all=p?[...p.exercises,...(model.customExercises[dow(ui.date)]||[])]:[...(model.customExercises[dow(ui.date)]||[])];
return `<div class="heading"><div class="micro">Seu treino no Hevy</div><h1>Registro de musculação</h1><p>Prescrição inicial adaptada à Bike, ao FitDance e ao GAP. Registre séries, repetições e carga.</p></div>${datebar()}
<section class="card"><div class="dayheading"><div><h2>${esc(p?.name||'Descanso / treino livre')}</h2><p class="hint" style="margin-top:6px">${p?esc(p.time):'Sem musculação obrigatória'}</p></div><span class="tag">${all.length} exercícios</span></div>${p?`<p class="hint" style="margin-top:10px">Depois: ${esc(p.other.join(' • '))}</p>`:''}</section>
${all.length?`<section class="card">${all.map(ex=>window.RafaFitSets.card(ex,records[ex.id]||{},model.workoutPresets?.[ex.id],esc,exerciseHistory(ex.id)[0],model.workoutRest?.[ex.id]??90)).join('')}</section>`:'<div class="empty">Nenhum exercício previsto para esta data. Você pode adicionar um exercício abaixo.</div>'}
${library()}<section class="card"><h3>Adicionar exercício ao dia da semana</h3><div class="field-group" style="margin-top:12px"><div class="field"><label for="newExerciseName">Exercício</label><input type="text" id="newExerciseName" maxlength="80" placeholder="Ex.: Prancha" /></div><div class="field"><label for="newExerciseTarget">Séries e repetições</label><input type="text" id="newExerciseTarget" maxlength="50" placeholder="Ex.: 2 × 30 s"/></div></div><button class="button" style="margin-top:12px" data-action="add-exercise">+ Adicionar</button><p class="hint" style="margin-top:11px">Exercícios adicionados ficam disponíveis em todas as semanas nesse mesmo dia.</p></section>
<section class="card"><div class="row between"><div><h3>Musculação concluída?</h3><p class="hint">Marque somente após terminar o treino.</p></div><button class="pill ${day().activities?.strength?'selected':''}" data-activity-button="strength">${day().activities?.strength?'✓ Concluída':'Marcar feita'}</button></div></section><div class="notice warning">Ao recomeçar, evite séries até a falha; ajuste as cargas conforme sua técnica e recuperação. Se houver dor incomum, tontura ou sintomas importantes, interrompa a atividade.</div>`;}
function sortedMeasurements(){return Object.keys(model.measurements).filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&model.measurements[k]&&Object.keys(model.measurements[k]).some(p=>num(model.measurements[k][p])!==null)).sort().map(k=>({date:k,...model.measurements[k]}));}
function graph(measureKey,label){const data=sortedMeasurements().filter(m=>num(m[measureKey])!==null).slice(-12);if(data.length<2)return `<div class="empty">Registre ${label.toLowerCase()} em pelo menos duas datas para visualizar a evolução.</div>`;const vs=data.map(m=>num(m[measureKey]));const min=Math.min(...vs),max=Math.max(...vs),range=max-min||1;const points=vs.map((v,i)=>`${30+i*300/(vs.length-1)},${145-((v-min)/range)*95}`);return `<svg class="chart" viewBox="0 0 360 190" role="img" aria-label="Evolução de ${esc(label)}"><line x1="30" y1="160" x2="330" y2="160" stroke="#395058"/><line x1="30" y1="50" x2="330" y2="50" stroke="#31444d" stroke-dasharray="4 4"/><polyline fill="none" stroke="#b4f06b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${points.join(' ')}"/>${points.map((p,i)=>{const [x,y]=p.split(',');return `<circle cx="${x}" cy="${y}" r="4" fill="#b4f06b"/><text x="${x}" y="${Number(y)-13}" fill="#c9dbdd" text-anchor="middle" font-size="10">${vs[i].toLocaleString('pt-BR',{maximumFractionDigits:1})}</text>`;}).join('')}<text x="30" y="181" fill="#9bb0b4" font-size="11">${displayDate(data[0].date,{day:'numeric',month:'short'})}</text><text x="330" y="181" fill="#9bb0b4" text-anchor="end" font-size="11">${displayDate(data[data.length-1].date,{day:'numeric',month:'short'})}</text></svg>`;}
function evolution(){const measurements=sortedMeasurements();const first=measurements[0]||{};const last=measurements[measurements.length-1]||{};const delta=(key,unit)=>num(first[key])===null||num(last[key])===null?'—':`${(num(last[key])-num(first[key])>0?'+':'')}${(num(last[key])-num(first[key])).toLocaleString('pt-BR',{maximumFractionDigits:1})} ${unit}`;
return `<div class="heading"><div class="micro">Composição corporal</div><h1>Evolução e medidas</h1><p>O mais importante é o conjunto: cintura, força, peso e recuperação.</p></div><div class="grid3"><div class="stat"><div class="micro">Peso</div><div class="value">${fmt(last.weight,' kg')}</div><div class="hint">${delta('weight','kg')} desde início</div></div><div class="stat"><div class="micro">Cintura</div><div class="value cyan">${fmt(last.waist,' cm')}</div><div class="hint">${delta('waist','cm')} desde início</div></div><div class="stat"><div class="micro">Gordura</div><div class="value">${fmt(last.bodyFat,'%')}</div><div class="hint">Estimativa da balança</div></div></div>
${section('Peso corporal')}<section class="card">${graph('weight','Peso')}</section>${section('Circunferência abdominal')}<section class="card">${graph('waist','Cintura')}</section>
${section('Histórico de avaliações')}<section class="card"><div class="table-wrapper"><table class="data-table"><thead><tr><th>Data</th><th>Peso</th><th>Cintura</th><th>Gordura</th><th>Pressão</th></tr></thead><tbody>${measurements.slice().reverse().map(m=>`<tr><td>${displayDate(m.date)}</td><td>${fmt(m.weight)}</td><td>${fmt(m.waist)}</td><td>${fmt(m.bodyFat,'%')}</td><td>${m.bpSystolic&&m.bpDiastolic?`${esc(m.bpSystolic)}/${esc(m.bpDiastolic)}`:'—'}</td></tr>`).join('')}</tbody></table></div></section><div class="notice">Para registrar nova avaliação, abra <strong>Hoje</strong>, selecione a data e preencha os campos de medidas no final da tela. Os valores iniciais de 09/11/2026 já estão registrados.</div>`;}
function detailLine(date){const d=day(date),p=currentPlan(date);const flags=['walk','strength','bike','dance','gap','mobility'].filter(id=>d.activities?.[id]).map(id=>ACTIVITIES[id][0]);const meals=Object.entries(d.meals||{}).filter(([,v])=>typeof v==='string'&&v.trim()).map(([id,value])=>{const m=MEALS.find(x=>x[0]===id);return `${m?m[2]:id}: ${value.trim()}`;});const exerciseLogs=Object.entries(d.exerciseLogs||{}).filter(([,v])=>v&&Object.values(v).some(value=>value!==''&&value!==null)).map(([id,val])=>{const defs=[...(p?.exercises||[]),...(model.customExercises[dow(date)]||[])];const e=defs.find(x=>x.id===id);return `${e?.name||id} ${window.RafaFitSets.report(val)}`;});return {date,activities:flags,sugar:d.sugar===true?'Sem açúcar adicionado':d.sugar===false?'Consumiu açúcar adicionado':'Não registrado',waterMl:num(d.waterMl),sleepHours:num(d.sleep),creatineG:num(d.creatine),wheyServings:num(d.whey),eggUnits:num(d.eggs),homemadeYogurtG:num(d.yogurt),proteinG:num(d.protein),energy:num(d.energy),fatigue:num(d.fatigue),meals,exercises:exerciseLogs,notes:d.notes||'',measurements:model.measurements[date]||{}};}
function weekReport(start){const m=metricsForWeek(start);const end=shiftDate(start,6);const measured=m.all.filter(d=>model.measurements[d]);const lines=[`# RafaFit — Relatório semanal`,`**Período:** ${displayDate(start)} a ${displayDate(end)}`,`**Plano:** 30 dias desde 09/11/2026`, ``,`## Resumo`,`- Dias com registros: ${m.logged.length}/7`,`- Atividades realizadas: ${m.completed}/${m.planned} previstas até a data atual${m.all.includes(localISO())?' (sem contar os dias futuros)':''}`,`- Dias sem açúcar adicionado (confirmados): ${m.sugar}; dias com consumo: ${m.sugarBad}; dias sem resposta: ${7-m.sugar-m.sugarBad}`,`- Hidratação média nos ${m.waterDays.length} dias com registro: ${m.avgWater===null?'não informada':m.avgWater+' ml/dia'}`,`- Sono médio nos ${m.sleepDays.length} dias informados: ${m.avgSleep===null?'não informado':m.avgSleep.toFixed(1).replace('.',',')+' h/noite'}`,`- Proteína média nos ${m.proteinDays.length} dias informados: ${m.avgProtein===null?'não informada':Math.round(m.avgProtein)+' g/dia'}`,`- Dias com creatina registrada: ${m.creatineDays}; com whey registrado: ${m.wheyDays}`,``,`## Medidas da semana`];
if(measured.length){for(const date of measured){const x=model.measurements[date];const values=[`peso ${fmt(x.weight,' kg')}`,`cintura ${fmt(x.waist,' cm')}`,`gordura ${fmt(x.bodyFat,'%')}`];if(x.bpSystolic&&x.bpDiastolic)values.push(`pressão ${x.bpSystolic}/${x.bpDiastolic}`);lines.push(`- ${displayDate(date)}: ${values.join(' | ')}`);}}else lines.push('- Não foram registradas medidas nesta semana.');
lines.push('','## Registro diário');
for(const iso of m.all){const o=detailLine(iso);const blank=!model.daily[iso]&&!model.measurements[iso];lines.push(`### ${DAYS[dow(iso)]} (${displayDate(iso)})`);if(blank){lines.push('- Sem registros.','');continue;}lines.push(`- Atividades: ${o.activities.join(', ')||'Nenhuma marcada'}`,`- Açúcar: ${o.sugar}`,`- Água: ${o.waterMl===null?'não informada':o.waterMl+' ml'}`,`- Creatina: ${o.creatineG===null?'não informada':o.creatineG+' g'}; Whey: ${o.wheyServings===null?'não informado':o.wheyServings+' dose(s)'}; Ovos: ${o.eggUnits??'não informado'}; Iogurte caseiro: ${o.homemadeYogurtG===null?'não informado':o.homemadeYogurtG+' g'}`,`- Proteína: ${o.proteinG===null?'não informada':o.proteinG+' g'}; Sono: ${o.sleepHours===null?'não informado':o.sleepHours+' h'}`,`- Energia: ${o.energy??'não informada'}/5; Fadiga: ${o.fatigue??'não informada'}/5`);if(o.meals.length)lines.push(`- Alimentação: ${o.meals.join(' | ')}`);if(o.exercises.length)lines.push(`- Musculação: ${o.exercises.join(' | ')}`);if(o.notes)lines.push(`- Observações: ${o.notes.trim()}`);lines.push('');}
lines.push('## O que acompanhar na próxima semana','- Tendência de circunferência abdominal, força e recuperação, sem buscar perda de gordura localizada.','- Consistência com proteína, água, sono e progressão gradual das cargas.','','_Registros autorrelatados; medidas de bioimpedância são estimativas. Este relatório não substitui atendimento profissional._');return lines.join('\n');}
function weekJSON(start){const m=metricsForWeek(start);return {app:'RafaFit',version:1,reportType:'weekly',period:{start,end:shiftDate(start,6)},goals:model.settings,baseline:model.measurements[BASELINE_DATE]||null,summary:{daysWithData:m.logged.length,completedActivities:m.completed,plannedActivitiesElapsed:m.planned,daysNoAddedSugar:m.sugar,daysWithAddedSugar:m.sugarBad,averageWaterMl:m.avgWater,averageSleepHours:m.avgSleep,averageProteinG:m.avgProtein,creatineDays:m.creatineDays,wheyDays:m.wheyDays},days:m.all.map(detailLine)};}
function reports(){const report=weekReport(ui.week);const m=metricsForWeek(ui.week);return `<div class="heading"><div class="micro">Para compartilhar aqui no ChatGPT</div><h1>Relatório semanal</h1><p>Um resumo automático de seus registros. Revise antes de compartilhar.</p></div><section class="card"><div class="row between"><button class="button tiny" data-week="-7">‹ Semana anterior</button><div style="text-align:center"><strong>${displayDate(ui.week,{day:'2-digit',month:'short'})} — ${displayDate(shiftDate(ui.week,6),{day:'2-digit',month:'short'})}</strong><div class="hint">Segunda a domingo</div></div><button class="button tiny" data-week="7">Próxima ›</button></div></section><div class="grid3"><div class="stat"><div class="micro">Registros</div><div class="value">${m.logged.length}/7</div><div class="hint">Dias registrados</div></div><div class="stat"><div class="micro">Atividades</div><div class="value cyan">${m.completed}/${m.planned}</div><div class="hint">Até hoje</div></div><div class="stat"><div class="micro">Sem açúcar</div><div class="value accent">${m.sugar}</div><div class="hint">Dias confirmados</div></div></div>${section('Gerar e compartilhar')}<section class="card"><div class="buttons"><button class="button primary" data-action="copy-report">Copiar relatório</button><button class="button" data-action="download-md">Baixar .md</button><button class="button" data-action="download-week-json">Baixar .json</button><button class="button" data-action="share-report">Compartilhar</button></div><p class="hint" style="margin-top:13px">Para eu analisar sua evolução aqui: toque em <strong>Copiar relatório</strong> e cole na conversa ou anexe o arquivo .md/.json. O app não envia nada automaticamente.</p></section>${section('Prévia do relatório')}<pre class="report">${esc(report)}</pre>`;}
function settings(){const s=model.settings;return `<div class="heading"><div class="micro">Preferências e segurança</div><h1>Configurações</h1><p>Sem login, sem anúncios e sem envio automático de informações.</p></div><section class="card"><h2>Metas pessoais</h2><div class="field-group" style="margin-top:15px">${field('Meta de água (ml)','waterGoal',s.waterGoal,{min:250,max:10000})}${field('Proteína por dia (g)','proteinGoal',s.proteinGoal,{min:0,max:300})}</div><p class="hint" style="margin-top:12px">As metas são referências editáveis; ajuste de acordo com orientação de nutricionista e com o esforço real.</p></section>${section('Backup e restauração')}<section class="card"><div class="buttons"><button class="button primary" data-action="backup">Baixar backup completo</button><button class="button" data-action="choose-import">Importar backup</button></div><input id="importFile" type="file" accept=".json,application/json" style="display:none"/><p class="hint" style="margin-top:12px">Salve backups fora do celular, por exemplo em uma pasta pessoal. <strong>Importar substitui todos os dados atuais.</strong> Os relatórios semanais não substituem o backup completo.</p></section>${section('Privacidade')}<section class="card"><div class="notice">Seus registros ficam salvos neste dispositivo, no armazenamento do navegador. Não há conta nem servidor de dados. Limpar dados do navegador, desinstalar o app ou trocar de aparelho pode apagar seus registros. Faça backup regularmente.</div><div class="spacer"></div><button class="button danger" data-action="clear">Apagar todos os registros</button></section>${section('Seu projeto')}<section class="card"><div class="row between"><span>Início do desafio</span><strong>09/11/2026</strong></div><div class="row between" style="margin-top:10px"><span>Encerramento inicial</span><strong>08/12/2026</strong></div><div class="row between" style="margin-top:10px"><span>Versão do aplicativo</span><strong>2.3</strong></div></section><p class="hint">Este diário auxilia a organização pessoal, mas não realiza diagnóstico ou prescrição médica. Medidas, suplementos e treinos devem respeitar sua condição clínica.</p>`;}
function render(resetScroll=false){
 const top=window.scrollY||0;
 window.RafaFitGuides?.stop();
 root.innerHTML=`<main class="app-shell">${header()}${ui.tab==='today'?today():ui.tab==='training'?training():ui.tab==='evolution'?evolution():ui.tab==='reports'?reports():settings()}</main>${nav()}${ui.guide?window.RafaFitGuides.modal(ui.guide,exerciseHistoryMarkup(ui.guide)):''}`;
 document.body.classList.toggle('guide-open',Boolean(ui.guide));
 if(ui.guide){window.RafaFitGuides.run(root.querySelector('[data-demo]'));root.querySelector('.guide-modal-panel')?.focus();}
 if(resetScroll)window.scrollTo({top:0,behavior:'instant'});else window.scrollTo(0,top);
}
function patchNumeric(obj,key,value,min,max){if(value===''){delete obj[key];return true;}const v=num(value);if(v===null||v<min||v>max)return false;obj[key]=v;return true;}
function download(name,content,mime){const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);}
async function copyText(text){if(navigator.clipboard&&window.isSecureContext){try{await navigator.clipboard.writeText(text);showToast('Relatório copiado! Cole na conversa.');return;}catch(e){}}const t=document.createElement('textarea');t.value=text;document.body.append(t);t.select();try{if(document.execCommand('copy'))showToast('Copiado! Cole na conversa.');else showToast('Use o botão de baixar arquivo.');}catch(e){showToast('Use o botão de baixar arquivo.');}t.remove();}
function handleAction(action){switch(action){case 'pause-guide':{const paused=window.RafaFitGuides?.toggle();const b=document.querySelector('[data-action="pause-guide"]');if(b)b.textContent=paused?'▶ Continuar':'⏸ Pausar';break;}case 'water-zero':if(confirm('Zerar o registro de água deste dia?')){ensureDay().waterMl=0;save();render();}break;
case 'add-exercise':{const name=document.getElementById('newExerciseName')?.value.trim();const target=document.getElementById('newExerciseTarget')?.value.trim()||'Livre';if(!name){showToast('Digite o nome do exercício.');return;}if(name.length>80){showToast('Nome muito longo.');return;}const index=dow(ui.date);if(!Array.isArray(model.customExercises[index]))model.customExercises[index]=[];const id='custom_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);model.customExercises[index].push({id,name,target,custom:true});save();render();showToast('Exercício adicionado ao plano.');break;}
case 'copy-report':copyText(weekReport(ui.week));break;
case 'download-md':download(`RafaFit_Relatorio_${ui.week}.md`,weekReport(ui.week),'text/markdown;charset=utf-8');break;
case 'download-week-json':download(`RafaFit_Relatorio_${ui.week}.json`,JSON.stringify(weekJSON(ui.week),null,2),'application/json');break;
case 'share-report':{const contents=weekReport(ui.week);const file=new File([contents],`RafaFit_Relatorio_${ui.week}.md`,{type:'text/markdown'});if(navigator.share){navigator.share({files:[file],title:'RafaFit — Relatório semanal',text:'Meu relatório da semana'}).catch(err=>{if(err.name!=='AbortError')copyText(contents);});}else copyText(contents);break;}
case 'backup':download(`RafaFit_Backup_${localISO()}.json`,JSON.stringify(model,null,2),'application/json');showToast('Backup gerado. Guarde em local seguro.');break;
case 'choose-import':document.getElementById('importFile')?.click();break;
case 'clear':if(confirm('ATENÇÃO: apagar todos os registros e medidas? Esta ação não pode ser desfeita sem um backup.')&&confirm('Confirma a exclusão definitiva?')){model=freshState();model.measurements={};save();ui.tab='today';ui.date=localISO();render(true);showToast('Todos os registros locais foram apagados.');}break;}}
root.addEventListener('click',e=>{const close=e.target.closest('[data-close-guide]');if(close&&(close.dataset.closeGuide!=='overlay'||e.target===close)){ui.guide=null;render();return;}const guide=e.target.closest('[data-guide]');if(guide){ui.guide=guide.dataset.guide;ui.tab='training';render();return;}const tab=e.target.closest('[data-tab]');if(tab){ui.tab=tab.dataset.tab;render(true);return;}const shift=e.target.closest('[data-shift]');if(shift){ui.date=shiftDate(ui.date,Number(shift.dataset.shift));render(true);return;}const week=e.target.closest('[data-week]');if(week){ui.week=shiftDate(ui.week,Number(week.dataset.week));render();return;}const water=e.target.closest('[data-water]');if(water){ensureDay().waterMl=clamp((Number(day().waterMl)||0)+Number(water.dataset.water),0,20000);save();render();return;}const sugar=e.target.closest('[data-sugar]');if(sugar){const value=sugar.dataset.sugar==='true';ensureDay().sugar=day().sugar===value?null:value;save();render();return;}const activity=e.target.closest('[data-activity-button]');if(activity){const id=activity.dataset.activityButton;const d=ensureDay();if(!d.activities)d.activities={};d.activities[id]=!d.activities[id];save();render();return;}const remove=e.target.closest('[data-remove-exercise]');if(remove){if(!confirm('Excluir esse exercício personalizado do plano? Os registros antigos continuarão no backup, mas deixarão de aparecer nesta tela.'))return;const index=dow(ui.date);model.customExercises[index]=(model.customExercises[index]||[]).filter(x=>x.id!==remove.dataset.removeExercise);save();render();return;}const setAction=e.target.closest('[data-set-action]');if(setAction){workoutSetAction(setAction);return;}const action=e.target.closest('[data-action]');if(action){handleAction(action.dataset.action);}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ui.guide){ui.guide=null;render();}});
root.addEventListener('change',e=>{const t=e.target;if(t.id==='datePicker'){if(/^\d{4}-\d{2}-\d{2}$/.test(t.value)){ui.date=t.value;render(true);}return;}if(t.dataset.setDone){toggleWorkoutSet(t);return;}if(t.dataset.restSeconds){const n=Number(t.value);if(!Number.isFinite(n)||n<10||n>600){showToast('Informe um intervalo de 10 a 600 segundos.');t.value=model.workoutRest?.[t.dataset.restSeconds]??90;return;}if(!model.workoutRest)model.workoutRest={};model.workoutRest[t.dataset.restSeconds]=Math.round(n);save();t.value=String(Math.round(n));return;}if(t.matches('[data-activity]')){const d=ensureDay();if(!d.activities)d.activities={};d.activities[t.dataset.activity]=t.checked;save();render();return;}if(t.id==='importFile'&&t.files?.[0]){const f=t.files[0];if(f.size>5000000){showToast('Backup muito grande: limite de 5 MB.');return;}if(!confirm('Importar substituirá os registros atuais. Você já fez backup?')){t.value='';return;}f.text().then(raw=>{const v=JSON.parse(raw);if(!v||v.version!==1||typeof v.daily!=='object'||!v.daily||typeof v.measurements!=='object'||!v.measurements||Array.isArray(v.daily)||Array.isArray(v.measurements))throw Error('Formato incompatível');model={...freshState(),...v,settings:{...freshState().settings,...v.settings}};if(!save())throw Error('Não foi possível salvar.');ui.tab='today';render(true);showToast('Backup importado com sucesso.');}).catch(()=>showToast('Arquivo inválido ou impossível de importar.'));return;}});
root.addEventListener('input',e=>{const t=e.target;
if(t.dataset.setField){editWorkoutSetField(t);return;}if(t.dataset.meal){const d=ensureDay();if(!d.meals)d.meals={};d.meals[t.dataset.meal]=t.value.slice(0,2000);save();return;}
if(t.dataset.exercise){const d=ensureDay();if(!d.exerciseLogs)d.exerciseLogs={};if(!d.exerciseLogs[t.dataset.exercise])d.exerciseLogs[t.dataset.exercise]={};const key=t.dataset.exerciseField;const input=t.value;if(key==='sets'||key==='load'){if(input!==''&&(num(input)===null||num(input)<0||num(input)>1000))return;d.exerciseLogs[t.dataset.exercise][key]=input===''?'':num(input);}else d.exerciseLogs[t.dataset.exercise][key]=input.slice(0,60);save();return;}
if(t.dataset.measure){const key=t.dataset.measure;const isEmpty=t.value==='';const check=num(t.value);if(!isEmpty&&(check===null||check<0||check>1000))return;if(!model.measurements[ui.date])model.measurements[ui.date]={};patchNumeric(model.measurements[ui.date],key,t.value,0,({weight:350,waist:250,bodyFat:100,muscle:100,visceral:60,bmi:100,bmr:10000,metabolicAge:120,bpSystolic:300,bpDiastolic:220}[key]||1000));if(!Object.keys(model.measurements[ui.date]).length)delete model.measurements[ui.date];save();return;}
if(t.dataset.field){const key=t.dataset.field;if(['waterGoal','proteinGoal'].includes(key)){if(patchNumeric(model.settings,key,t.value,0,10000))save();return;}const d=ensureDay();if(['notes'].includes(key)){d[key]=t.value.slice(0,3000);save();return;}const maxima={creatine:30,whey:10,protein:500,sleep:24,energy:5,fatigue:5,eggs:20,yogurt:2000};if(patchNumeric(d,key,t.value,0,maxima[key]||1000))save();return;}});
if('serviceWorker' in navigator&&window.isSecureContext){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
render();
// API restrita para testes automatizados de formatação/relatórios, sem conexão externa.
window.RafaFitCore={localISO,shiftDate,monday,weekReport,weekJSON,metricsForWeek,freshState,exerciseHistory};
})();
