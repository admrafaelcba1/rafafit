(function installRafaFitRestTimer(){
  'use strict';
  let active=null, ticker=null, audio=null, banner=null;
  let soundEnabled=true;
  try{soundEnabled=localStorage.getItem('rafafit.restSound')!=='off';}catch(_){}
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function format(seconds){
    const s=clamp(Math.ceil(Number(seconds)||0),0,3600);
    return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  }
  function unlockAudio(){
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio)return false;
      if(!audio)audio=new Audio();
      if(audio.state==='suspended')audio.resume().catch(()=>{});
      return true;
    }catch(_){return false;}
  }
  function playSound(force=false){
    if(!soundEnabled&&!force)return;
    if(!unlockAudio())return;
    try{
      const time=audio.currentTime+0.02;
      for(let i=0;i<3;i++){
        const osc=audio.createOscillator();
        const vol=audio.createGain();
        const begin=time+i*0.23;
        osc.type='sine';osc.frequency.setValueAtTime(i===2?1046:880,begin);
        vol.gain.setValueAtTime(0.0001,begin);
        vol.gain.linearRampToValueAtTime(0.22,begin+0.015);
        vol.gain.exponentialRampToValueAtTime(0.0001,begin+0.18);
        osc.connect(vol);vol.connect(audio.destination);
        osc.start(begin);osc.stop(begin+0.19);
      }
      if(typeof navigator.vibrate==='function')navigator.vibrate([120,90,120,90,220]);
    }catch(_){}
  }
  function ensureBanner(){
    if(banner?.isConnected)return banner;
    banner=document.createElement('aside');
    banner.id='rf-rest-banner';
    banner.className='rf-rest-banner';
    banner.setAttribute('aria-label','Temporizador de descanso');
    document.body.appendChild(banner);
    return banner;
  }
  function currentRemaining(){
    if(!active)return 0;
    if(active.phase==='running')return Math.max(0,Math.ceil((active.deadline-Date.now())/1000));
    return Math.max(0,active.remaining);
  }
  function stopTick(){if(ticker!==null){clearInterval(ticker);ticker=null;}}
  function paint(){
    if(!active){if(banner)banner.remove();banner=null;return;}
    const el=ensureBanner(),left=currentRemaining(),finished=active.phase==='finished';
    const elapsed=active.phase==='finished'?1:clamp((active.duration-left)/active.duration,0,1);
    const escape=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    el.classList.toggle('rf-rest-finished',finished);
    el.innerHTML=
      '<div class="rf-rest-title"><span>'+(finished?'✓ Descanso concluído':active.phase==='paused'?'⏸ Descanso pausado':'⏱ Descanso')+'</span>'+
      '<strong class="rf-rest-clock">'+(finished?'00:00':format(left))+'</strong></div>'+
      '<div class="rf-rest-exercise">'+escape(active.name)+'</div>'+
      '<div class="rf-rest-track"><div style="width:'+Math.round(elapsed*100)+'%"></div></div>'+
      (finished?'<div class="rf-rest-message" role="status">Hora da próxima série!</div>':'')+
      '<div class="rf-rest-actions">'+
      (finished
        ?'<button type="button" data-rest-control="repeat">↻ Repetir</button><button type="button" data-rest-control="dismiss">Fechar</button>'
        :'<button type="button" data-rest-control="minus">−15s</button><button type="button" data-rest-control="pause">'+(active.phase==='paused'?'▶ Continuar':'⏸ Pausar')+'</button><button type="button" data-rest-control="plus">+15s</button><button type="button" data-rest-control="dismiss">Pular</button>')+
      '<button class="rf-rest-sound" type="button" data-rest-control="sound" aria-label="'+(soundEnabled?'Desativar':'Ativar')+' aviso sonoro">'+(soundEnabled?'🔊':'🔇')+'</button></div>';
  }
  function tick(){
    if(!active||active.phase!=='running')return;
    if(Date.now()>=active.deadline){
      active.phase='finished';
      active.remaining=0;
      stopTick();
      paint();
      // No iPhone, a reprodução poderá ser suspensa com a tela bloqueada.
      playSound();
      return;
    }
    paint();
  }
  function start({id,name,seconds}){
    const total=clamp(Math.round(Number(seconds)||90),10,600);
    unlockAudio(); // arm in the same user gesture that checked the set
    active={id:String(id||''),name:String(name||'Exercício'),duration:total,remaining:total,deadline:Date.now()+total*1000,phase:'running'};
    stopTick();paint();
    ticker=setInterval(tick,500);
    return active;
  }
  function stop(){active=null;stopTick();paint();}
  function pause(){
    if(!active||active.phase==='finished')return;
    if(active.phase==='running'){active.remaining=currentRemaining();active.phase='paused';stopTick();}
    else{unlockAudio();active.deadline=Date.now()+active.remaining*1000;active.phase='running';ticker=setInterval(tick,500);}
    paint();
  }
  function adjust(delta){
    if(!active||active.phase==='finished')return;
    if(active.phase==='running'){
      const seconds=clamp(currentRemaining()+delta,5,600);
      active.deadline=Date.now()+seconds*1000;
    }else active.remaining=clamp(active.remaining+delta,5,600);
    paint();
  }
  function soundTest(){
    unlockAudio();
    playSound(true);
  }
  document.addEventListener('click',event=>{
    const btn=event.target.closest('[data-rest-control],[data-rest-test]');
    if(!btn)return;
    if(btn.hasAttribute('data-rest-test')){soundTest();return;}
    const action=btn.dataset.restControl;
    if(action==='dismiss'){stop();return;}
    if(action==='pause'){pause();return;}
    if(action==='plus'){adjust(15);return;}
    if(action==='minus'){adjust(-15);return;}
    if(action==='repeat'&&active){start({id:active.id,name:active.name,seconds:active.duration});return;}
    if(action==='sound'){
      soundEnabled=!soundEnabled;
      try{localStorage.setItem('rafafit.restSound',soundEnabled?'on':'off');}catch(_){}
      if(soundEnabled)soundTest();
      paint();
    }
  });
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)tick();
  });
  window.addEventListener('focus',tick);
  window.RafaFitRest={start,stop,pause,adjust,format,tick,currentRemaining,soundTest,getStatus:()=>active?{...active,remaining:currentRemaining(),soundEnabled}:null};
})();