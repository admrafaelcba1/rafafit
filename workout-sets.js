(function installRafaFitSets(){
  'use strict';
  function integer(v, min, max, fallback){
    const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.round(n))):fallback;
  }
  function basic(ex){
    const target=String(ex && ex.target || '');
    const count=integer((target.match(/^\s*(\d+)/)||[])[1],1,12,2);
    const m=target.match(/[×x]\s*(\d+)/i);
    const reps=m?integer(m[1],1,100,10):10;
    return Array.from({length:count},()=>({kg:'',reps,done:false}));
  }
  function sanitize(o){
    const r=o&&typeof o==='object'?o:{};
    function val(v,max){
      if(v===null||v===undefined||v==='')return '';
      const n=Number(String(v).replace(',','.'));
      return Number.isFinite(n)&&n>=0&&n<=max?n:'';
    }
    return {kg:val(r.kg,1000),reps:val(r.reps,200),done:r.done===true};
  }
  function rows(ex,record,preset){
    if(Array.isArray(record&&record.series)&&record.series.length)return record.series.slice(0,12).map(sanitize);
    if(record&&((record.sets!==undefined&&record.sets!=='')||(record.reps!==undefined&&record.reps!=='')||(record.load!==undefined&&record.load!==''))){
      const oldCount=integer(record.sets,1,12,basic(ex).length);
      const oldReps=String(record.reps||'').split('/').map(v=>Number(v.trim().replace(',','.'))).filter(v=>Number.isFinite(v)&&v>0);
      const initReps=basic(ex)[0].reps;
      return Array.from({length:oldCount},(_,i)=>sanitize({kg:record.load??'',reps:oldReps[i]||oldReps[0]||initReps,done:false}));
    }
    if(Array.isArray(preset)&&preset.length)return preset.slice(0,12).map(x=>({...sanitize(x),done:false}));
    return basic(ex);
  }
  function summary(record){
    if(!record)return null;
    if(Array.isArray(record.series)){
      const done=record.series.map(sanitize).filter(s=>s.done);
      if(!done.length)return null;
      return {sets:done.length,reps:done.map(s=>s.reps===''?'?':s.reps).join('/'),load:done.filter(s=>s.kg!=='').map(s=>s.kg).reduce((m,n)=>Math.max(m,n),0),completed:done.length,planned:record.series.length};
    }
    if(record.sets===undefined&&record.reps===undefined&&record.load===undefined)return null;
    return {sets:record.sets,reps:record.reps,load:record.load,completed:null,planned:null};
  }
  function report(record){
    if(!record)return '';
    if(!Array.isArray(record.series))return '('+(record.sets||'?')+' séries, reps '+(record.reps||'?')+', '+(record.load||'?')+' kg)';
    const all=record.series.map(sanitize),done=all.filter(s=>s.done).length;
    return '('+done+'/'+all.length+' séries concluídas: '+all.map((s,i)=>(i+1)+': '+(s.kg===''?'sem carga':s.kg+' kg')+' × '+(s.reps===''?'?':s.reps)+' rep'+(s.done?' ✓':' pendente')).join('; ')+')';
  }
  function card(ex,record,preset,esc,history,restSeconds){
    const id=esc(ex.id),list=rows(ex,record,preset),complete=list.filter(s=>s.done).length;
    const hasGuide=!!window.RafaFitGuides?.byId(ex.id);
    let demo='';
    if(hasGuide){
      demo='<div class="guide-actions"><button class="guide-button" type="button" data-guide="'+id+'"><span class="play-icon">▶</span> Demonstração e técnica <span aria-hidden="true">›</span></button>';
      if(history&&history.load!==undefined&&history.load!==null&&history.load!==''){
        demo+='<span class="hint">Última carga registrada: '+esc(history.load)+' kg • '+esc(history.reps||'—')+' reps</span>';
      }
      demo+='</div>';
    }
    const listRows=list.map((s,i)=>'<tr class="'+(s.done?'rf-finished':'')+'"><td class="rf-series-num">'+(i+1)+'</td><td><input aria-label="Carga da série '+(i+1)+' de '+esc(ex.name)+' em quilogramas" type="number" min="0" max="1000" step="0.5" inputmode="decimal" data-set-id="'+id+'" data-set-row="'+i+'" data-set-field="kg" value="'+esc(s.kg)+'" placeholder="kg"/></td><td><input aria-label="Repetições da série '+(i+1)+' de '+esc(ex.name)+'" type="number" min="0" max="200" step="1" inputmode="numeric" data-set-id="'+id+'" data-set-row="'+i+'" data-set-field="reps" value="'+esc(s.reps)+'" placeholder="reps"/></td><td class="rf-check-cell"><input class="rf-set-checkbox" type="checkbox" aria-label="Concluir série '+(i+1)+' de '+esc(ex.name)+'" data-set-id="'+id+'" data-set-row="'+i+'" data-set-done="1" '+(s.done?'checked':'')+'/></td></tr>').join('');
    return '<div class="session-item rf-set-card" data-exercise-card="'+id+'"><div class="row between"><div><div class="session-title">'+esc(ex.name)+'</div><div class="session-target">Referência: '+esc(ex.target||'Livre')+'</div></div>'+(ex.custom?'<button class="button tiny danger" data-remove-exercise="'+id+'">Excluir</button>':'')+'</div>'+
    demo+'<div class="rf-rest-setting"><label>⏱ Descanso <input aria-label="Segundos de descanso após série de '+esc(ex.name)+'" type="number" min="10" max="600" step="5" inputmode="numeric" data-rest-seconds="'+id+'" value="'+esc(Number(restSeconds)||90)+'"/> segundos</label><button type="button" data-rest-test="1" aria-label="Testar aviso sonoro">🔊 Testar som</button></div><div class="rf-set-progress"><span data-set-progress-label="'+id+'">'+complete+' de '+list.length+' séries concluídas</span><span class="rf-badgesmall">'+(Array.isArray(preset)&&preset.length?'Padrão salvo':'Ficha editável')+'</span></div>'+
    '<div class="rf-set-table-wrap"><table class="rf-set-table"><thead><tr><th>SÉRIE</th><th>KG</th><th>REP</th><th>FEITO</th></tr></thead><tbody>'+listRows+'</tbody></table></div>'+
    '<div class="rf-set-actions"><button type="button" data-set-action="add" data-set-id="'+id+'">+ Série</button><button type="button" data-set-action="remove" data-set-id="'+id+'" '+(list.length<=1?'disabled':'')+'>− Série</button><button type="button" class="rf-save-preset" data-set-action="preset" data-set-id="'+id+'">☆ Salvar padrão</button></div>'+
    '<p class="rf-set-help">Ajuste KG e REP conforme o treino. Marque ✓ ao concluir: o descanso inicia automaticamente, com aviso sonoro ao final (mantenha o app aberto). “Salvar padrão” repete KG e REP nas próximas sessões.</p></div>';
  }
  window.RafaFitSets={rows,basic,sanitize,summary,report,card};
})();