/* RafaFit 2.0 — guias ilustrativos originais, sem mídia externa. */
(()=>{
'use strict';
const J=(head,shoulder,elbow,hand,hip,knee,foot,extra={})=>({head,shoulder,elbow,hand,hip,knee,foot,...extra});
const line=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
const BENCH='<path d="M70 148L112 148M88 148L84 194M105 148L111 194"/>';
const DEVICES={
 incline:'<path d="M76 189L114 151L155 100M114 151L166 151M114 151L107 196M166 151L174 196"/>',
 press:'<path d="M80 191L80 121L128 121L128 161M128 161L180 161M180 161L190 193M248 49L248 184M248 118L214 118"/>',
 pulley:'<path d="M151 45L151 23L221 23L221 186M160 44L160 80M145 45L175 45"/>',
 legpress:'<path d="M55 89L123 167L173 167M116 167L109 195M240 51L262 132M231 51L253 132M248 132L267 195"/>',
 legcurl:'<path d="M55 151L236 151M83 151L74 195M198 151L209 195M248 95L248 153"/>',
 calf:'<path d="M55 89L123 167L173 167M116 167L109 195M241 51L263 135M235 51L257 135"/>',
 pulldown:'<path d="M160 35L160 12M100 34L220 34M160 35L160 55M119 171L200 171M128 171L122 195M194 171L199 195"/>',
 row:'<path d="M70 173L140 173M106 173L97 196M227 123L250 123L250 185M250 123L265 123"/>',
 curl:'<path d="M72 191L248 191"/>',
 smith:'<path d="M83 37L83 195M235 37L235 195M83 39L235 39M83 189L235 189"/>',
 stiff:'<path d="M73 194L257 194"/>',
 hip:'<path d="M51 136L121 136M65 136L62 194M106 136L108 194M225 194L265 194"/>',
 lateral:'<path d="M68 195L250 195"/>',
 face:'<path d="M251 65L251 194M251 96L232 96"/>',
 tilt:'<path d="M97 168L198 168M113 168L108 194M180 168L186 194"/>',
 rock:'<path d="M50 193L259 193"/>',
 hamstring:'<path d="M51 157L229 157M72 157L69 195M199 157L205 195"/>'
};
const SCENES={
 incline:{device:'incline',weight:true,poses:[J([173,78],[154,107],[132,121],[137,101],[116,150],[180,168],[210,189]),J([173,78],[154,107],[168,90],[190,68],[116,150],[180,168],[210,189])]},
 press:{device:'press',poses:[J([136,76],[134,101],[157,119],[181,122],[135,158],[184,169],[213,190]),J([136,76],[134,101],[183,111],[226,118],[135,158],[184,169],[213,190])]},
 triceps:{device:'pulley',bar:true,poses:[J([159,75],[157,99],[144,127],[147,122],[158,148],[144,176],[140,195],{shoulder2:[171,99],elbow2:[178,127],hand2:[176,122],knee2:[177,176],foot2:[183,195]}),J([159,75],[157,99],[144,127],[146,166],[158,148],[144,176],[140,195],{shoulder2:[171,99],elbow2:[178,127],hand2:[178,166],knee2:[177,176],foot2:[183,195]})]},
 legpress:{device:'legpress',poses:[J([72,98],[89,116],[106,133],[123,148],[120,155],[173,121],[221,96]),J([72,98],[89,116],[106,133],[123,148],[120,155],[193,113],[240,78])]},
 legcurl:{device:'legcurl',poses:[J([83,128],[111,128],[120,145],[132,154],[170,128],[218,128],[261,130]),J([83,128],[111,128],[120,145],[132,154],[170,128],[218,128],[234,78])]},
 calf:{device:'calf',poses:[J([72,98],[89,116],[108,131],[121,148],[120,155],[191,112],[228,88]),J([72,98],[89,116],[108,131],[121,148],[120,155],[191,112],[247,74])]},
 pulldown:{device:'pulldown',bar:true,poses:[J([159,91],[142,115],[120,88],[105,51],[159,155],[145,169],[140,194],{shoulder2:[177,115],elbow2:[200,88],hand2:[215,51],knee2:[175,169],foot2:[182,194]}),J([159,91],[142,115],[119,124],[119,103],[159,155],[145,169],[140,194],{shoulder2:[177,115],elbow2:[199,124],hand2:[199,103],knee2:[175,169],foot2:[182,194]})]},
 row:{device:'row',poses:[J([135,83],[135,105],[180,109],[226,116],[130,166],[184,174],[227,183]),J([135,83],[135,105],[117,126],[146,139],[130,166],[184,174],[227,183])]},
 curl:{device:'curl',weight:true,poses:[J([159,78],[144,107],[132,144],[134,176],[159,146],[147,176],[142,195],{shoulder2:[177,107],elbow2:[189,144],hand2:[189,176],knee2:[177,176],foot2:[182,195]}),J([159,78],[144,107],[132,144],[145,117],[159,146],[147,176],[142,195],{shoulder2:[177,107],elbow2:[189,144],hand2:[178,117],knee2:[177,176],foot2:[182,195]})]},
 smith:{device:'smith',poses:[J([145,69],[144,94],[123,109],[103,108],[147,139],[177,166],[195,194]),J([124,95],[126,118],[117,135],[99,129],[130,165],[181,162],[195,194])]},
 stiff:{device:'stiff',weight:true,poses:[J([146,69],[146,95],[150,119],[151,154],[146,143],[154,172],[159,195]),J([225,101],[197,118],[210,142],[218,172],[146,143],[154,172],[159,195])]},
 hip:{device:'hip',poses:[J([87,120],[111,129],[135,148],[148,151],[157,164],[205,147],[222,194]),J([87,120],[111,129],[136,120],[146,117],[165,129],[205,147],[222,194])]},
 lateral:{device:'lateral',weight:true,poses:[J([159,73],[143,99],[128,140],[122,173],[159,144],[148,174],[144,194],{shoulder2:[177,99],elbow2:[193,140],hand2:[200,173],knee2:[177,174],foot2:[182,194]}),J([159,73],[143,99],[100,102],[69,101],[159,144],[148,174],[144,194],{shoulder2:[177,99],elbow2:[221,102],hand2:[251,101],knee2:[177,174],foot2:[182,194]})]},
 face:{device:'face',poses:[J([143,78],[144,103],[183,123],[230,101],[145,150],[148,175],[145,193]),J([143,78],[144,103],[172,99],[147,87],[145,150],[148,175],[145,193])]},
 tilt:{device:'tilt',poses:[J([137,84],[146,108],[160,131],[171,152],[145,154],[193,172],[208,193]),J([137,84],[139,107],[154,131],[165,150],[147,158],[193,172],[208,193])]},
 rock:{device:'rock',poses:[J([104,96],[119,111],[110,141],[104,178],[186,114],[194,173],[220,192]),J([99,112],[114,130],[104,154],[100,178],[150,145],[183,173],[213,192])]},
 hamstring:{device:'hamstring',poses:[J([78,140],[109,141],[127,148],[139,153],[148,146],[178,116],[208,81],{knee2:[187,150],foot2:[227,151]}),J([78,140],[109,141],[127,148],[139,153],[148,146],[155,92],[161,43],{knee2:[187,150],foot2:[227,151]})]}
};
const GUIDES={
 m_incline:{title:'Supino inclinado com halteres',group:'Peito',scene:'incline',summary:'Empurrar os halteres para cima na linha do peito superior.',steps:['Ajuste o banco com inclinação moderada (em geral, 15° a 30°) e apoie os pés.','Comece com os halteres próximos à parte superior do peito, punhos alinhados.','Empurre para cima sem bater os halteres e desça com controle.'],tips:['Mantenha as escápulas estáveis e os ombros longe das orelhas.','Use amplitude confortável e sem dor.'],errors:['Abrir demais os cotovelos.','Quicar os halteres ou perder o controle na descida.']},
 m_press:{title:'Supino reto na máquina',group:'Peito',scene:'press',summary:'Empurrar as alças da máquina para frente com tronco apoiado.',steps:['Ajuste o banco para deixar as alças aproximadamente na altura do meio do peito.','Mantenha costas e pés apoiados; empurre as alças para frente.','Volte devagar sem deixar os ombros girarem para a frente.'],tips:['Ajuste a amplitude ao equipamento e ao seu ombro.'],errors:['Tirar as costas do encosto.','Elevar os ombros e travar os cotovelos com força.']},
 m_triceps:{title:'Tríceps na polia',group:'Tríceps',scene:'triceps',summary:'Estender os cotovelos mantendo os braços próximos ao corpo.',steps:['Coloque a polia alta e segure a barra/corda sem curvar os punhos.','Com cotovelos perto das costelas, estenda os braços para baixo.','Retorne lentamente até uma flexão confortável dos cotovelos.'],tips:['Evite balançar o tronco; deixe a força vir dos cotovelos.'],errors:['Levar o ombro à frente para empurrar.','Acelerar o retorno e perder o controle.']},
 t_legpress:{title:'Leg press',group:'Pernas',scene:'legpress',summary:'Estender quadril e joelho contra a plataforma, sem travá-los.',steps:['Ajuste banco e posicionamento dos pés à largura confortável.','Desça a plataforma até onde consegue manter a lombar apoiada.','Empurre pela planta dos pés, estendendo sem travar os joelhos.'],tips:['Joelhos acompanham a direção dos pés; amplitude depende da sua mobilidade.'],errors:['Descolar a lombar/elevar o quadril do banco.','Colapsar os joelhos para dentro ou usar carga que encurte o movimento.']},
 t_legcurl:{title:'Mesa flexora',group:'Posterior de coxa',scene:'legcurl',summary:'Flexionar os joelhos em direção aos glúteos, sem levantar o quadril.',steps:['Ajuste o apoio sobre a parte inferior das pernas conforme a máquina.','Mantenha quadril apoiado e flexione os joelhos de forma controlada.','Estenda lentamente sem deixar a carga despencar.'],tips:['Reduza a amplitude se houver desconforto atrás do joelho.'],errors:['Elevar o quadril da almofada.','Usar embalo para subir a carga.']},
 t_calf:{title:'Panturrilha no leg press',group:'Panturrilhas',scene:'calf',summary:'Mover o tornozelo com os joelhos estáveis.',steps:['Posicione a parte da frente dos pés na plataforma com apoio firme.','Com os joelhos alinhados, eleve os calcanhares pelo movimento dos tornozelos.','Desça lentamente até alongamento confortável, sem perder o apoio.'],tips:['Não destrave a máquina de maneira insegura; confira a posição com o instrutor.'],errors:['Empurrar dobrando e estendendo os joelhos.','Deixar os pés escorregarem da plataforma.']},
 w_pulldown:{title:'Puxada alta na polia',group:'Costas',scene:'pulldown',summary:'Puxar a barra em direção à parte superior do peito.',steps:['Sente-se com as coxas firmes nos apoios e segure a barra.','Puxe os cotovelos para baixo, conduzindo a barra na direção do alto do peito.','Deixe a barra subir de forma controlada, sem perder a postura.'],tips:['Mantenha peito aberto e tronco relativamente estável.'],errors:['Puxar atrás da nuca.','Jogar o tronco para trás para mover mais carga.']},
 w_row:{title:'Remada sentada no cabo',group:'Costas',scene:'row',summary:'Trazer o puxador ao tronco com as escápulas controladas.',steps:['Sente-se com pés apoiados e coluna neutra.','Puxe o cabo em direção ao abdômen, levando os cotovelos para trás.','Estenda os braços lentamente sem arredondar muito a lombar.'],tips:['Mantenha o tronco estável e inicie com carga controlável.'],errors:['Balançar o corpo para ganhar impulso.','Encolher os ombros em direção às orelhas.']},
 w_curl:{title:'Rosca bíceps com halteres',group:'Bíceps',scene:'curl',summary:'Flexionar os cotovelos sem balançar o tronco.',steps:['Fique em pé com joelhos destravados e halteres ao lado do corpo.','Flexione os cotovelos com punhos firmes, aproximando os halteres dos ombros.','Desça devagar sem jogar o tronco.'],tips:['Pode alternar braços para mais controle.'],errors:['Fazer impulso com a lombar.','Deixar os cotovelos irem muito para frente.']},
 th_smith:{title:'Agachamento na máquina Smith',group:'Pernas',scene:'smith',summary:'Flexionar quadril e joelhos com estabilidade e amplitude confortável.',steps:['Ajuste a barra e as travas de segurança; posicione pés com estabilidade.','Desça flexionando quadril e joelhos, com tronco firme e coluna neutra.','Empurre o chão e suba de modo controlado.'],tips:['Peça ao instrutor para conferir sua posição dos pés na máquina.'],errors:['Tirar os calcanhares do chão.','Usar profundidade que force a lombar ou cause dor.']},
 th_stiff:{title:'Stiff com halteres',group:'Posterior de coxa',scene:'stiff',summary:'Dobrar o quadril para trás, mantendo coluna neutra e joelhos levemente flexionados.',steps:['Fique em pé com halteres próximos às pernas e joelhos destravados.','Leve o quadril para trás enquanto o tronco inclina e os pesos descem próximos às pernas.','Pare quando perder a postura ou atingir alongamento confortável; retorne pelos quadris.'],tips:['Movimento é no quadril, não um arredondamento da coluna.'],errors:['Forçar os joelhos completamente estendidos.','Descer além do limite de controle para alcançar o chão.']},
 th_hip:{title:'Hip thrust na máquina',group:'Glúteos',scene:'hip',summary:'Elevar o quadril até alinhar tronco e coxas, sem hiperestender a lombar.',steps:['Ajuste o apoio nas costas e a almofada sobre o quadril.','Pressione os pés no chão e eleve o quadril contraindo os glúteos.','Desça devagar até a posição inicial confortável.'],tips:['No topo, mantenha costelas controladas e evite arquear a lombar.'],errors:['Empurrar o quadril alto à custa da lombar.','Pés muito afastados, causando desconforto nos joelhos.']},
 f_lateral:{title:'Elevação lateral',group:'Ombros',scene:'lateral',summary:'Elevar os braços lateralmente até perto da linha dos ombros.',steps:['Segure pesos leves, com cotovelos suavemente flexionados.','Eleve os braços para os lados até uma altura confortável.','Desça de maneira lenta, sem bater os halteres no corpo.'],tips:['Deixe o pescoço relaxado e use cargas leves.'],errors:['Encolher ombros e balançar o tronco.','Elevar acima do limite confortável.']},
 f_face:{title:'Face pull na polia',group:'Ombros / costas',scene:'face',summary:'Puxar a corda em direção ao rosto, abrindo os cotovelos.',steps:['Ajuste a polia na altura do rosto ou ligeiramente acima.','Puxe a corda em direção ao rosto, afastando as mãos uma da outra.','Retorne devagar sem perder a postura.'],tips:['Priorize movimento controlado e pouco peso.'],errors:['Arquear a lombar para gerar força.','Puxar a corda para o peito em vez de próximo ao rosto.']},
 mob_tilt:{title:'Mobilização pélvica sentada',group:'Mobilidade',scene:'tilt',summary:'Alternar suavemente inclinação da pelve para reconhecer o movimento do quadril.',steps:['Sente-se na ponta de uma cadeira firme, pés apoiados.','Alterne uma inclinação pequena da pelve para frente e para trás.','Respire normalmente, sem forçar a lombar.'],tips:['Movimento lento e pequeno; busca-se percepção corporal, não dor.'],errors:['Fazer o movimento todo com os ombros.']},
 mob_rock:{title:'Rock-back em quatro apoios',group:'Mobilidade',scene:'rock',summary:'Levar o quadril suavemente em direção aos calcanhares.',steps:['Apoie mãos abaixo dos ombros e joelhos sob os quadris.','Desloque o quadril para trás até onde conseguir sem dor.','Retorne à posição inicial lentamente.'],tips:['Se necessário, coloque uma toalha dobrada sob os joelhos.'],errors:['Forçar a lombar ou os joelhos em amplitude dolorosa.']},
 mob_hamstring:{title:'Alongamento posterior com faixa',group:'Mobilidade',scene:'hamstring',summary:'Elevar uma perna com a faixa, sem forçar a extensão completa do joelho.',steps:['Deite de costas, com uma perna apoiada e uma faixa na planta do outro pé.','Eleve a perna segurando a faixa até tensão leve ou moderada atrás da coxa.','Mantenha respiração confortável e retorne lentamente.'],tips:['Pode dobrar discretamente o joelho; não é necessário alcançar 90°.'],errors:['Puxar até dor intensa ou formigamento.','Elevar o quadril ou curvar o pescoço.']}
};
const ALIAS={f_press:'m_press',f_row:'w_row'};
function key(id){return ALIAS[id]||id;}
function byId(id){return GUIDES[key(id)]||null;}
const BONE_PAIRS=[['shoulder','hip'],['shoulder','elbow'],['elbow','hand'],['hip','knee'],['knee','foot'],['shoulder2','elbow2'],['elbow2','hand2'],['hip','knee2'],['knee2','foot2']];
function svg(keyId){const g=byId(keyId);if(!g)return '';
 const scene=SCENES[g.scene];
 return `<svg class="demo-scene" data-demo="${key(keyId)}" viewBox="0 0 320 212" role="img" aria-label="Ilustração animada esquemática do movimento ${g.title}" xmlns="http://www.w3.org/2000/svg">
 <defs><linearGradient id="rfbg" x1="0" x2="1"><stop offset="0" stop-color="#101f2b"/><stop offset="1" stop-color="#162e34"/></linearGradient></defs>
 <rect x="1" y="1" width="318" height="210" rx="18" fill="url(#rfbg)" stroke="#29434a"/>
 <path d="M25 195H294" stroke="#36515b" stroke-width="2"/>
 <g class="device" fill="none" stroke="#6b8790" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${DEVICES[scene.device]}</g>
 <g class="demo-skeleton">${BONE_PAIRS.map(pair=>`<line data-bone="${pair[0]}:${pair[1]}" x1="0" y1="0" x2="0" y2="0" stroke="#a6f06e" stroke-width="8" stroke-linecap="round"/>`).join('')}<circle data-head cx="0" cy="0" r="12" fill="#d0e7cb" stroke="#567b74" stroke-width="3"/>${['shoulder','elbow','hand','hip','knee','foot','shoulder2','elbow2','hand2','knee2','foot2'].map(p=>`<circle data-dot="${p}" cx="0" cy="0" r="5" fill="#d0e7cb" stroke="#2b483e" stroke-width="1.5"/>`).join('')}</g>
 ${scene.bar?'<line data-bar x1="0" y1="0" x2="0" y2="0" stroke="#b8c7c6" stroke-width="7" stroke-linecap="round"/>':''}
 ${scene.weight?'<g data-weight="hand"><path d="M-11 0H11M-9-7V7M9-7V7" stroke="#e4f3f4" stroke-width="5" stroke-linecap="round"/></g><g data-weight="hand2"><path d="M-11 0H11M-9-7V7M9-7V7" stroke="#e4f3f4" stroke-width="5" stroke-linecap="round"/></g>':''}
 <text x="19" y="24" fill="#a2b9bd" font-size="11" font-family="system-ui">MOVIMENTO ILUSTRATIVO</text>
 </svg>`;}
function modal(id,historyHtml){const g=byId(id);if(!g)return `<div class="guide-modal-panel"><p>Este exercício ainda não possui guia visual.</p></div>`;
 const list=(items)=>`<ol>${items.map(s=>`<li>${escapeText(s)}</li>`).join('')}</ol>`;
 return `<div class="guide-backdrop" data-close-guide="overlay"><section class="guide-modal-panel" role="dialog" aria-modal="true" aria-labelledby="guideTitle" tabindex="-1"><div class="guide-modal-head"><div><div class="micro">GUIA DE MOVIMENTO • ${escapeText(g.group.toUpperCase())}</div><h2 id="guideTitle">${escapeText(g.title)}</h2></div><button type="button" class="guide-close" data-close-guide="button" aria-label="Fechar demonstração">✕</button></div>
 <div class="demo-wrap">${svg(id)}<div class="demo-caption"><span>↔ Animação contínua · esquema, não vídeo</span><button class="button tiny minimal" data-action="pause-guide" type="button">⏸ Pausar</button></div></div>
 <p class="guide-summary">${escapeText(g.summary)}</p>
 <h3>Como fazer</h3>${list(g.steps)}<h3>Dicas de execução</h3><ul>${g.tips.map(t=>`<li>${escapeText(t)}</li>`).join('')}</ul><h3>Erros a evitar</h3><ul>${g.errors.map(t=>`<li>${escapeText(t)}</li>`).join('')}</ul>
 ${historyHtml||''}<div class="notice warning">A animação é esquemática. Antes de usar máquinas ou aumentar carga, confira ajustes, postura e amplitude com o instrutor presencial. Interrompa se sentir dor ou tontura.</div>
 <button class="button primary guide-bottom" type="button" data-close-guide="button">Entendi • Voltar ao treino</button>
 </section></div>`;}
function escapeText(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
let raf=0,activeSvg=null,elapsed=0,lastTick=0,paused=false,pose=0;
function stop(){if(raf)cancelAnimationFrame(raf);raf=0;activeSvg=null;elapsed=0;lastTick=0;paused=false;}
function interp(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}
function draw(svgEl,scene,t){const first=scene.poses[0],second=scene.poses[1];const coords={};for(const k of Object.keys(first)){if(Array.isArray(first[k])&&second[k])coords[k]=interp(first[k],second[k],t);}
 const torsoShoulder=coords.shoulder2?[(coords.shoulder[0]+coords.shoulder2[0])/2,(coords.shoulder[1]+coords.shoulder2[1])/2]:coords.shoulder;
 for(const el of svgEl.querySelectorAll('[data-bone]')){const [a,b]=el.getAttribute('data-bone').split(':');const p=a==='shoulder'&&b==='hip'?torsoShoulder:coords[a];const q=coords[b];if(p&&q){el.style.display='';el.setAttribute('x1',p[0]);el.setAttribute('y1',p[1]);el.setAttribute('x2',q[0]);el.setAttribute('y2',q[1]);}else el.style.display='none';}
 for(const el of svgEl.querySelectorAll('[data-dot]')){const p=coords[el.getAttribute('data-dot')];if(p){el.style.display='';el.setAttribute('cx',p[0]);el.setAttribute('cy',p[1]);}else el.style.display='none';}
 const head=svgEl.querySelector('[data-head]');head.setAttribute('cx',coords.head[0]);head.setAttribute('cy',coords.head[1]);
 for(const el of svgEl.querySelectorAll('[data-weight]')){const p=coords[el.getAttribute('data-weight')];if(p){el.style.display='';el.setAttribute('transform',`translate(${p[0]} ${p[1]})`);}else el.style.display='none';}
 const bar=svgEl.querySelector('[data-bar]');if(bar){if(coords.hand&&coords.hand2){for(const [at,val] of [['x1',coords.hand[0]],['y1',coords.hand[1]],['x2',coords.hand2[0]],['y2',coords.hand2[1]]])bar.setAttribute(at,val);}else bar.style.display='none';}
}
function run(svgEl){stop();if(!svgEl)return;activeSvg=svgEl;const scene=SCENES[byId(svgEl.getAttribute('data-demo')).scene];draw(svgEl,scene,0);
 const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduced)return;
 function tick(ts){if(!activeSvg||!activeSvg.isConnected||activeSvg!==svgEl)return;if(!lastTick)lastTick=ts;if(!paused)elapsed+=Math.min(ts-lastTick,100);lastTick=ts;pose=(1-Math.cos(2*Math.PI*elapsed/3200))/2;draw(svgEl,scene,pose);raf=requestAnimationFrame(tick);}raf=requestAnimationFrame(tick);
}
function toggle(){paused=!paused;return paused;}
window.RafaFitGuides={GUIDES,ALIAS,key,byId,svg,modal,run,stop,toggle};
})();
