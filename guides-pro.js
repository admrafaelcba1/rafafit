/* RafaFit 2.1 — ficha visual de exercicios, fotos de movimento com fallback SVG.
   Fotos de referencia: yuhonas/free-exercise-db — Unlicense.
   Nao altera o modelo de dados, nem localStorage. */
(()=>{
'use strict';
const api=window.RafaFitGuides;
if(!api)return;
const original={modal:api.modal,run:api.run,stop:api.stop,toggle:api.toggle};
const SOURCE='https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const PHOTOS={
 m_incline:['Incline_Dumbbell_Press','Peitoral','Ombros e tríceps'],
 m_press:['Machine_Bench_Press','Peitoral','Ombros e tríceps'],
 m_triceps:['Triceps_Pushdown','Tríceps','Antebraços (estabilização)'],
 t_legpress:['Leg_Press','Quadríceps','Glúteos e posteriores'],
 t_legcurl:['Lying_Leg_Curls','Posterior de coxa','—'],
 t_calf:['Calf_Press_On_The_Leg_Press_Machine','Panturrilhas','—'],
 w_pulldown:['Wide-Grip_Lat_Pulldown','Dorsais','Bíceps, costas superiores e ombros'],
 w_row:['Seated_Cable_Rows','Costas médias','Bíceps, dorsais e ombros'],
 w_curl:['Dumbbell_Bicep_Curl','Bíceps','Antebraços'],
 th_smith:['Smith_Machine_Squat','Quadríceps','Glúteos, posteriores e lombar'],
 th_stiff:['Stiff-Legged_Dumbbell_Deadlift','Posterior de coxa','Glúteos e lombar'],
 th_hip:['Barbell_Hip_Thrust','Glúteos','Posteriores de coxa'],
 f_lateral:['Side_Lateral_Raise','Ombros','—'],
 f_face:['Face_Pull','Ombros posteriores','Costas médias']
};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const items=(arr,ordered=false)=>`<${ordered?'ol':'ul'}>${(arr||[]).map(t=>`<li>${esc(t)}</li>`).join('')}</${ordered?'ol':'ul'}>`;
const tab=(id,text,active=false)=>`<button type="button" class="rf-guide-tab" data-guide-tab="${id}" role="tab" aria-selected="${active?'true':'false'}">${text}</button>`;
api.modal=function(id,historyHtml){
 const g=api.byId(id);
 if(!g)return original.modal(id,historyHtml);
 const k=api.key(id),p=PHOTOS[k];
 const media=p?`<div class="rf-media-photos" aria-label="Duas fotos reais mostram o inicio e o fim de ${esc(g.title)}">
   <img class="rf-photo rf-first" src="${SOURCE+p[0]}/0.jpg" alt="Posição inicial de ${esc(g.title)}" loading="eager"/>
   <img class="rf-photo rf-second" src="${SOURCE+p[0]}/1.jpg" alt="Posição final de ${esc(g.title)}" loading="eager"/>
   <span class="rf-media-signal">INÍCIO ↔ FIM</span>
 </div>`:'';
 const hero=`<div class="rf-exercise-media">
   ${api.svg(id)}
   ${media}
   <div class="rf-control-line"><span>${p?'Demonstração fotográfica • posições alternadas':'Ilustração esquemática animada'}</span><button type="button" data-action="pause-guide" class="rf-pause-btn">⏸ Pausar</button></div>
 </div>`;
 return `<div class="guide-backdrop rf-v21-overlay" data-close-guide="overlay">
 <section class="guide-modal-panel rf-v21-panel" role="dialog" aria-modal="true" aria-labelledby="guideTitle" tabindex="-1">
 <header class="rf-guide-top"><button type="button" class="rf-back" data-close-guide="button" aria-label="Fechar">‹</button><div class="rf-top-title" id="guideTitle">${esc(g.title)}</div><button type="button" class="rf-close" data-close-guide="button" aria-label="Fechar">✕</button></header>
 <nav class="rf-guide-tabs" role="tablist" aria-label="Informações do exercício">${tab('summary','Resumo',true)}${tab('history','Histórico')}${tab('instructions','Instruções')}</nav>
 <div class="rf-guide-tabpanel" data-guide-pane="summary" role="tabpanel">
 ${hero}
 <div class="rf-guide-detail"><h2>${esc(g.title)}</h2>
 <div class="rf-muscle"><span>PRIMÁRIO</span><strong>${esc(p?p[1]:g.group)}</strong></div>
 <div class="rf-muscle"><span>SECUNDÁRIO</span><strong>${esc(p?p[2]:'Variável conforme o movimento')}</strong></div>
 <p class="rf-guide-intro">${esc(g.summary)}</p>
 <div class="rf-summary-extra"><h3>Para executar melhor</h3>${items((g.tips||[]).slice(0,2))}</div>
 <p class="rf-media-credit">${p?'Fotografias: <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener noreferrer">Free Exercise DB</a> (Unlicense). Exercício ou máquina podem variar ligeiramente.':'Demonstração esquemática do RafaFit.'} Consulte o instrutor para ajustes e segurança.</p>
 </div></div>
 <div class="rf-guide-tabpanel" data-guide-pane="history" role="tabpanel" hidden>
 <div class="rf-guide-detail"><h2>Evolução de cargas</h2><div class="rf-history-plot" aria-label="Gráfico de cargas anteriores"></div>${historyHtml||'<p class="rf-muted">Ainda não há registros para este exercício.</p>'}
 <p class="rf-muted">As cargas exibidas são as que você registrou no RafaFit, sem valores estimados.</p></div></div>
 <div class="rf-guide-tabpanel" data-guide-pane="instructions" role="tabpanel" hidden>
 <div class="rf-guide-detail"><h2>Como executar</h2>${items(g.steps,true)}<h3>Boas práticas</h3>${items(g.tips)}<h3>Erros para evitar</h3>${items(g.errors)}
 <div class="rf-safety">O movimento demonstrado é apenas uma referência. Se houver dor, tontura ou desconforto, interrompa e peça orientação presencial.</div></div></div>
 <footer class="rf-guide-footer"><button type="button" data-close-guide="button" class="rf-guide-done">Voltar ao treino</button></footer>
 </section></div>`;
};
function mountChart(){
 const panel=document.querySelector('.rf-v21-panel');if(!panel)return;
 const chart=panel.querySelector('.rf-history-plot');if(!chart)return;
 const rows=[...panel.querySelectorAll('.guide-history tbody tr')];
 const values=rows.map(tr=>{const c=tr.querySelectorAll('td');if(c.length<4)return null;const s=c[3].textContent.trim();const v=Number(s.replace(/[^0-9,.]/g,'').replace(',','.'));return s==='—'||!Number.isFinite(v)?null:{label:c[0].textContent.trim(),value:v};}).filter(Boolean).reverse();
 if(values.length<2){chart.innerHTML='<p class="rf-plot-empty">Registre a carga em pelo menos dois treinos para visualizar o gráfico.</p>';return;}
 const min=Math.min(0,...values.map(p=>p.value)),max=Math.max(1,...values.map(p=>p.value));
 const range=Math.max(max-min,1);const X=i=>24+(i/(values.length-1))*290;const Y=v=>104-(v-min)/range*80;
 const pts=values.map((v,i)=>X(i).toFixed(1)+','+Y(v.value).toFixed(1)).join(' ');
 chart.innerHTML=`<svg role="img" aria-label="Evolução de cargas registradas, em kg" viewBox="0 0 340 134">
 <line x1="24" x2="322" y1="104" y2="104" stroke="#d0d9da"/>
 <line x1="24" x2="322" y1="24" y2="24" stroke="#e1e7e8" stroke-dasharray="4 6"/>
 <text x="2" y="27" fill="#60777e" font-size="11">${max}</text>
 <text x="2" y="108" fill="#60777e" font-size="11">${min}</text>
 <polyline fill="none" stroke="#287bbc" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" points="${pts}"/>
 ${values.map((v,i)=>`<circle cx="${X(i)}" cy="${Y(v.value)}" r="4" fill="#287bbc"><title>${esc(v.label)}: ${v.value} kg</title></circle>`).join('')}
 <text x="22" y="129" fill="#60777e" font-size="10">${esc(values[0].label)}</text>
 <text x="319" y="129" text-anchor="end" fill="#60777e" font-size="10">${esc(values[values.length-1].label)}</text>
 </svg>`;
}
api.run=function(svg){
 original.run(svg);
 const panel=document.querySelector('.rf-v21-panel');if(!panel)return;
 panel.querySelectorAll('.rf-photo').forEach(img=>{img.addEventListener('error',()=>{img.classList.add('rf-broken');if([...panel.querySelectorAll('.rf-photo')].every(p=>p.classList.contains('rf-broken')))panel.querySelector('.rf-media-photos')?.classList.add('rf-media-unavailable');});});
 mountChart();
};
api.stop=function(){original.stop();};
api.toggle=function(){const paused=original.toggle();document.querySelector('.rf-v21-panel')?.classList.toggle('rf-paused',paused);return paused;};
document.addEventListener('click',e=>{
 const btn=e.target.closest('[data-guide-tab]');if(!btn)return;
 const panel=btn.closest('.rf-v21-panel');if(!panel)return;
 const val=btn.getAttribute('data-guide-tab');
 panel.querySelectorAll('[data-guide-tab]').forEach(n=>n.setAttribute('aria-selected',n===btn?'true':'false'));
 panel.querySelectorAll('[data-guide-pane]').forEach(n=>{n.hidden=n.getAttribute('data-guide-pane')!==val;});
 panel.scrollTop=0;
});
})();