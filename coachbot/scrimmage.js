(()=>{
  const roster=JSON.parse(localStorage.getItem('firefliesRoster')||'[]');
  const coaches=JSON.parse(localStorage.getItem('firefliesCoaches')||'[]');
  const saved=JSON.parse(localStorage.getItem('firefliesScrimmage')||'null');
  const state=saved||{yellow:[],black:[],yellowScore:0,blackScore:0,inning:1,half:'TOP',seconds:45*60,running:false};
  let timer=null;
  const $=id=>document.getElementById(id);
  const fmt=s=>`${Math.floor(Math.max(0,s)/60)}:${String(Math.max(0,s)%60).padStart(2,'0')}`;
  const save=()=>localStorage.setItem('firefliesScrimmage',JSON.stringify({...state,running:false}));
  const unassigned=()=>roster.filter(p=>!state.yellow.includes(p)&&!state.black.includes(p));

  function notify(title){window.dispatchEvent(new CustomEvent('coachbot:transition',{detail:{kind:'activity',title}}))}

  function addPlayer(name,side){
    state.yellow=state.yellow.filter(p=>p!==name);state.black=state.black.filter(p=>p!==name);
    if(side==='yellow'&&state.yellow.length<5)state.yellow.push(name);
    if(side==='black'&&state.black.length<5)state.black.push(name);
    save();render();
  }
  function removePlayer(name){state.yellow=state.yellow.filter(p=>p!==name);state.black=state.black.filter(p=>p!==name);save();render()}
  function randomize(){
    const list=roster.slice();for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}
    state.yellow=list.slice(0,5);state.black=list.slice(5,10);save();render();
  }
  function resetTeams(){state.yellow=[];state.black=[];save();render()}
  function nextHalf(){
    if(state.half==='TOP'){state.half='BOTTOM'}else{state.half='TOP';state.inning++}
    save();render();notify(`${state.half==='TOP'?'Top':'Bottom'} of inning ${state.inning}`);
  }
  function score(side,delta){const k=side==='yellow'?'yellowScore':'blackScore';state[k]=Math.max(0,state[k]+delta);save();render()}
  function toggleTimer(){state.running=!state.running;if(state.running&&!timer)timer=setInterval(tick,1000);render()}
  function tick(){if(!state.running)return;if(state.seconds>0)state.seconds--;if(state.seconds===300)notify('5 minutes left in the scrimmage');if(state.seconds<=0){state.running=false;clearInterval(timer);timer=null;notify('Scrimmage complete')}render()}
  function resetGame(){if(timer)clearInterval(timer);timer=null;state.yellowScore=0;state.blackScore=0;state.inning=1;state.half='TOP';state.seconds=45*60;state.running=false;save();render()}

  function sideSlots(side){const arr=state[side];return Array.from({length:5},(_,i)=>{const p=arr[i];return `<button class="side-slot ${p?'filled':'empty'}" ${p?`data-remove="${p}"`:''}>${p?`<span>${i+1}. ${p}</span><b>×</b>`:`<span>${i+1}. Open</span>`}</button>`}).join('')}
  function playerPool(){return roster.map(p=>{const side=state.yellow.includes(p)?'yellow':state.black.includes(p)?'black':'';return `<div class="draft-btn ${side}"><span>${p}</span><div><button class="draft-pick" data-player="${p}" data-side="yellow" ${side==='yellow'||state.yellow.length>=5?'disabled':''}>Y</button><button class="draft-pick" data-player="${p}" data-side="black" ${side==='black'||state.black.length>=5?'disabled':''}>B</button></div><b>${side?side.toUpperCase():'PICK SIDE'}</b></div>`}).join('')}

  function render(){
    const view=$('view-scrim');if(!view)return;
    const ready=state.yellow.length===5&&state.black.length===5;
    view.innerHTML=`
      <section class="scrim-hero">
        <div class="scrim-hero-head"><div><div class="kicker">TODAY'S PRACTICE</div><h2>5 v 5 Scrimmage</h2><p>Field 8 • full-practice game mode • no heat warning</p></div><span class="badge">SCRIMMAGE</span></div>
        <div class="scrim-clock">${fmt(state.seconds)}</div>
        <div class="scrim-score-mini"><div class="mini-team"><b>${state.yellowScore}</b><span>FIREFLIES YELLOW</span></div><div class="versus">${state.half} ${state.inning}</div><div class="mini-team"><b>${state.blackScore}</b><span>FIREFLIES BLACK</span></div></div>
        <div class="scrim-controls"><button class="btn primary" id="scrimStart">${state.running?'PAUSE':'START SCRIMMAGE'}</button><button class="btn" id="scrimNextHalf">END HALF</button><button class="btn warn" id="scrimResetGame">RESET GAME</button></div>
      </section>

      <div class="team-ready ${ready?'':'warn'}">${ready?'✓ Teams are set — 5 players on each side.':'Pick 5 players for Yellow and 5 for Black before starting.'}</div>

      <section class="scrim-board">
        <div class="side-card yellow"><div class="side-head"><div class="kicker">TEAM YELLOW</div><h3>${state.yellow.length}/5</h3><small>Batting order shown below</small></div><div class="side-list">${sideSlots('yellow')}</div></div>
        <div class="side-card black"><div class="side-head"><div class="kicker">TEAM BLACK</div><h3>${state.black.length}/5</h3><small>Batting order shown below</small></div><div class="side-list">${sideSlots('black')}</div></div>
      </section>

      <section class="section"><div class="sectitle"><h3>Pick Teams</h3><span>${unassigned().length} unassigned</span></div><div class="panel"><div class="player-pool">${playerPool()}</div><div class="draft-actions"><button class="btn primary" id="randomTeams">RANDOM 5 v 5</button><button class="btn" id="clearTeams">CLEAR TEAMS</button></div></div></section>

      <section class="section"><div class="sectitle"><h3>Scoreboard</h3><span>${state.half==='TOP'?'Yellow batting':'Black batting'}</span></div><div class="scoreboard"><div class="score-grid"><div class="score-team"><span>YELLOW</span><strong>${state.yellowScore}</strong><div class="score-buttons"><button data-score="yellow" data-delta="-1">−</button><button data-score="yellow" data-delta="1">+ RUN</button></div></div><div class="game-state"><div class="inning">${state.half} ${state.inning}</div><div class="batting">${state.half==='TOP'?'YELLOW':'BLACK'} BATTING</div></div><div class="score-team"><span>BLACK</span><strong>${state.blackScore}</strong><div class="score-buttons"><button data-score="black" data-delta="-1">−</button><button data-score="black" data-delta="1">+ RUN</button></div></div></div><div class="game-actions"><button class="btn" id="nextHalfBottom">END HALF-INNING</button><button class="btn" id="swapTeams">SWAP SIDES</button><button class="btn warn" id="resetScore">RESET SCORE</button></div></div></section>

      <section class="section"><div class="sectitle"><h3>Coach Setup</h3><span>4 coaches</span></div><div class="coach-sides"><div class="coach-side"><strong>${coaches[0]||'Justin'} — Game Lead</strong><span>Run the tee/pitch, manage batting order and keep the scrimmage moving.</span></div><div class="coach-side"><strong>${coaches[1]||'Matt'} — Yellow Side</strong><span>Help Team Yellow with batting order, bases and field positions.</span></div><div class="coach-side"><strong>${coaches[2]||'Vincent'} — Black Side</strong><span>Help Team Black with batting order, bases and field positions.</span></div><div class="coach-side"><strong>${coaches[3]||'Josh'} — Field Helper</strong><span>Help with base coverage, balls back to the tee and quick defensive resets.</span></div></div></section>

      <section class="section"><div class="sectitle"><h3>Simple Scrimmage Rules</h3><span>5U friendly</span></div><div class="scrim-plan"><div class="plan-card"><strong>Keep everyone involved</strong><span>Five hit while five field. Flip sides often so nobody sits. Use the app's END HALF button when the batting side finishes its turn.</span></div><div class="plan-card"><strong>Teach game flow</strong><span>Where to throw, where to run, touching bases, listening for coaches, and getting ready for the next batter.</span></div><div class="plan-card"><strong>Don't over-coach every play</strong><span>Let the scrimmage move. Correct one simple thing, reset, and play the next ball.</span></div></div></section>`;

    view.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>removePlayer(b.dataset.remove)));
    view.querySelectorAll('.draft-pick').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();addPlayer(b.dataset.player,b.dataset.side)}));
    view.querySelectorAll('[data-score]').forEach(b=>b.addEventListener('click',()=>score(b.dataset.score,Number(b.dataset.delta))));
    $('randomTeams')?.addEventListener('click',randomize);$('clearTeams')?.addEventListener('click',resetTeams);
    $('scrimStart')?.addEventListener('click',()=>{if(!ready){if(window.navigator.vibrate)navigator.vibrate(80);return}toggleTimer()});
    $('scrimNextHalf')?.addEventListener('click',nextHalf);$('nextHalfBottom')?.addEventListener('click',nextHalf);
    $('scrimResetGame')?.addEventListener('click',resetGame);$('resetScore')?.addEventListener('click',()=>{state.yellowScore=0;state.blackScore=0;save();render()});
    $('swapTeams')?.addEventListener('click',()=>{[state.yellow,state.black]=[state.black,state.yellow];save();render()});
  }

  function activateToday(){
    const today=new Date();const key=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    if(key==='2026-08-22'){
      document.querySelector('.modebar')?.setAttribute('hidden','');
      const heat=$('heatBanner');if(heat)heat.hidden=true;
      if($('practiceTitle'))$('practiceTitle').textContent='5 v 5 Scrimmage Practice';
      if($('practiceMeta'))$('practiceMeta').textContent='1:00 PM • Field 8 • 10 players • 4 coaches';
      setTimeout(()=>document.querySelector('[data-view="scrim"]')?.click(),40);
    }
  }

  render();activateToday();
  window.addEventListener('beforeunload',save);
})();
