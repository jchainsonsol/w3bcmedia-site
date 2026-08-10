const defaultPlayers=['','','','','','','','','',''];

const practices=[
 {date:'2026-08-10',time:'17:30',label:'Monday Practice',field:'Field 8',kind:'practice'},
 {date:'2026-08-15',time:'08:00',label:'Saturday Practice',field:'Field 8',kind:'practice'},
 {date:'2026-08-17',time:'17:30',label:'Monday Practice',field:'Field 8',kind:'practice'},
 {date:'2026-08-22',time:'13:00',label:'Saturday Practice',field:'Field 8',kind:'practice'},
 {date:'2026-08-24',time:'17:30',label:'Monday Practice',field:'Field 8',kind:'practice'},
 {date:'2026-08-29',time:'10:00',label:'Saturday Practice',field:'Field 8',kind:'practice'},
 {date:'2026-08-31',time:'17:30',label:'Monday Practice',field:'Field 8',kind:'practice'},
 {date:'2026-09-05',time:'09:00',label:'Saturday Practice',field:'Field 8',kind:'practice'},
 {date:'2026-09-07',time:'17:30',label:'Monday Practice',field:'Field 8',kind:'practice'}
];

const games=[
 {date:'2026-09-12',time:'12:15',opponent:'Chihuahuas',home:true,field:'Field 8',kind:'game'},
 {date:'2026-09-28',time:'18:00',opponent:'Ghost Peppers',home:false,field:'Field 8',kind:'game'},
 {date:'2026-10-01',time:'18:15',opponent:'Biscuits',home:true,field:'Field 8',kind:'game'},
 {date:'2026-10-03',time:'11:15',opponent:'Pelicans',home:false,field:'Field 8',kind:'game'},
 {date:'2026-10-04',time:'13:00',opponent:'Frozen Iguanas',home:false,field:'Field 8',kind:'game'},
 {date:'2026-10-10',time:'12:30',opponent:'Biscuits',home:false,field:'Field 8',kind:'game'},
 {date:'2026-10-17',time:'13:45',opponent:'Ghost Peppers',home:true,field:'Field 8',kind:'game'},
 {date:'2026-10-18',time:'16:45',opponent:'Trash Pandas',home:false,field:'Field 8',kind:'game'},
 {date:'2026-10-24',time:'12:30',opponent:'Space Cowboys',home:true,field:'Field 8',kind:'game'},
 {date:'2026-10-31',time:'10:00',opponent:'Frozen Iguanas',home:true,field:'Field 8',kind:'game'}
];

const standardSegments=[
 {title:'Team Huddle + Safety',mins:5,desc:'Welcome, safety rules, Fireflies cheer.',cues:['No swinging until a coach says go.','When Coach says FREEZE, everybody freezes.','Quick water check before we move.','Fireflies on 3!']},
 {title:'Baseball Warm-Up',mins:5,desc:'Movement, bases and easy throwing.',cues:['Jog the bases once.','High knees + side shuffle.','Home → first at game speed.','Easy partner throws.']},
 {title:'Station Rotation',mins:21,desc:'Three groups rotate through hitting, grounders and throwing/bases.',cues:['Groups are 4 / 3 / 3.','7 minutes per station.','Coaches stay at stations; players rotate.','Keep lines moving.'],round:true,roundMins:7},
 {title:'Water + Quick Reset',mins:2,desc:'Fast drink and reset.',cues:['Water only.','Shade if available.','Back to the infield quickly.'],water:true},
 {title:'Fireflies Team Defense',mins:7,desc:'Field the ball and get it toward first.',cues:['Coach rolls or hits easy balls.','Rotate first base every 2–3 balls.','Team goal: 10 good plays.','Praise effort loudly.']},
 {title:'Home Run Relay',mins:4,desc:'Fun base-running finish.',cues:['Everyone runs the bases.','Touch every bag.','Cheer for teammates.']},
 {title:'Huddle + Fireflies Cheer',mins:1,desc:'One lesson, one compliment, team cheer.',cues:['Ask: What base do we run to first?','Recognize hustle and listening.','1, 2, 3 — FIREFLIES!']}
];

const heatSegments=[
 {title:'Shade Huddle + Water',mins:5,desc:'Safety, names, hydration and Fireflies cheer.',cues:['Everybody takes a drink.','No swinging until a coach says go.','When Coach says FREEZE, everybody freezes.','Keep the pace easy today.'],water:true},
 {title:'Easy Warm-Up',mins:6,desc:'Light throwing and one easy trip around the bases.',cues:['No conditioning sprints.','Walk/jog the bases once.','Short easy throws.','Stay in shade when waiting.']},
 {title:'Station Rotation — Round 1',mins:6,desc:'Hitting, grounders and throwing/bases.',cues:['Short lines.','Low-intensity reps.','Coaches keep kids out of direct sun while waiting.'],round:true,heatRound:0},
 {title:'Shade + Water',mins:3,desc:'Mandatory cooling break.',cues:['Everybody drinks.','Move to shade.','Check each player before continuing.'],water:true},
 {title:'Station Rotation — Round 2',mins:6,desc:'Rotate groups to the next station.',cues:['Six minutes only.','Keep effort controlled.','Stop early for any kid who looks overheated.'],round:true,heatRound:1},
 {title:'Shade + Water',mins:3,desc:'Mandatory cooling break.',cues:['Everybody drinks.','Shade first.','No rushing the break.'],water:true},
 {title:'Station Rotation — Round 3',mins:6,desc:'Final station rotation.',cues:['Six minutes only.','Lots of reps, little standing.','No extra running.'],round:true,heatRound:2},
 {title:'Shade + Water',mins:3,desc:'Mandatory cooling break.',cues:['Everybody drinks.','Cool down before the team game.'],water:true},
 {title:'Easy Team Fielding Game',mins:4,desc:'Rolled balls and simple throws toward first.',cues:['No conditioning.','Easy rolled balls.','Celebrate clean fielding and good throws.']},
 {title:'Shade Huddle + Cheer',mins:3,desc:'Cool down, recap and finish together.',cues:['Final water break.','Recognize effort and listening.','1, 2, 3 — FIREFLIES!'],water:true}
];

const stationDefs=[
 {name:'Hitting',coach:0,cue:'Tee first • feet set • eyes on ball • swing through • drop bat safely • run through first.'},
 {name:'Ground Balls',coach:1,cue:'Feet apart • butt down • glove to dirt • two hands • field → stand → throw.'},
 {name:'Throwing + Bases',coach:2,cue:'Step toward target • short throws • name the bases • touch every bag • run through first.'}
];

let heatMode=localStorage.getItem('firefliesHeatMode')==='true';
let segments=heatMode?heatSegments:standardSegments;
let state={idx:0,overall:45*60,segment:segments[0].mins*60,running:false,round:0};
let timer=null;
let roster=JSON.parse(localStorage.getItem('firefliesRoster')||'null')||defaultPlayers.slice();
let coaches=JSON.parse(localStorage.getItem('firefliesCoaches')||'null')||['Head Coach','Coach 2','Coach 3'];
let groupOrder=JSON.parse(localStorage.getItem('firefliesGroups')||'null')||roster.slice();
const $=id=>document.getElementById(id);
const fmt=s=>`${Math.floor(Math.max(0,s)/60)}:${String(Math.max(0,s)%60).padStart(2,'0')}`;
const pad=n=>String(n).padStart(2,'0');

function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1300)}
function eventDate(e){return new Date(`${e.date}T${e.time}:00`)}
function allEvents(){return [...practices,...games].sort((a,b)=>eventDate(a)-eventDate(b))}
function nextEvent(){const now=new Date();return allEvents().find(e=>eventDate(e)>=now)||null}
function time12(t){let [h,m]=t.split(':').map(Number);const ap=h>=12?'PM':'AM';h=h%12||12;return `${h}:${pad(m)} ${ap}`}
function dateShort(d){return new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric'}).format(new Date(`${d}T12:00:00`))}
function dateLong(d){return new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric'}).format(new Date(`${d}T12:00:00`))}
function countdown(dt){const diff=dt-new Date();if(diff<=0)return 'NOW';const hours=Math.floor(diff/36e5);if(hours<24)return `${hours}h ${Math.floor((diff%36e5)/6e4)}m`;const days=Math.floor(hours/24);return days===1?'1 DAY':`${days} DAYS`}
function gameTitle(g){return g.home?`vs. ${g.opponent}`:`@ ${g.opponent}`}
function eventTitle(e){return e.kind==='game'?gameTitle(e):e.label}
function eventMeta(e){return `${dateLong(e.date)} • ${time12(e.time)} • ${e.field}`}
function groups(){const clean=groupOrder.filter(Boolean);return [clean.slice(0,4),clean.slice(4,7),clean.slice(7,10)]}
function stationFor(groupIdx,round){return (groupIdx+round)%3}
function activeRound(){const s=segments[state.idx];if(heatMode&&Number.isInteger(s.heatRound))return s.heatRound;return state.round}

function segmentStartMinutes(index){return segments.slice(0,index).reduce((sum,s)=>sum+s.mins,0)}
function clockAt(offset){const start=17*60+30+offset;let h=Math.floor(start/60),m=start%60;const ap=h>=12?'PM':'AM';h=h%12||12;return `${h}:${pad(m)} ${ap}`}
function segmentRange(index){const start=segmentStartMinutes(index);return `${clockAt(start)}–${clockAt(start+segments[index].mins)}`}

function renderNextEvent(){const e=nextEvent();if(!e){$('nextEventTitle').textContent='Season complete';$('nextEventMeta').textContent='Great season, Fireflies.';$('nextEventType').textContent='DONE';$('nextEventCountdown').textContent='';return}$('nextEventTitle').textContent=eventTitle(e);$('nextEventMeta').textContent=eventMeta(e);$('nextEventType').textContent=e.kind==='game'?(e.home?'HOME GAME':'AWAY GAME'):'PRACTICE';$('nextEventCountdown').textContent=countdown(eventDate(e))}

function renderMode(){
 $('heatModeBtn').textContent=heatMode?'✓ HEAT MODE':'🔥 HEAT MODE';
 $('heatModeBtn').classList.toggle('active',heatMode);
 $('heatBanner').hidden=!heatMode;
 $('modeTitle').textContent=heatMode?'Extreme-Heat Practice':'Standard Practice';
 $('modeDesc').textContent=heatMode?'45 minutes • 6-minute stations • mandatory cooling breaks':'45 minutes • 7-minute station rounds';
 $('stationSubhead').textContent=heatMode?'Coaches stay put. Groups rotate every 6 minutes with cooling breaks.':'Coaches stay put. Groups rotate every 7 minutes.';
 $('stationDurationBadge').textContent=heatMode?'3 × 6 MIN':'3 × 7 MIN';
 $('winText').textContent=heatMode?'Safe, hydrated, low-intensity reps. No conditioning. Keep kids in shade when waiting and end early if needed.':'Safe swings. Know where first base is. Lots of touches. Very little standing around. Finish with the kids wanting to come back.';
}

function renderNow(){
 const s=segments[state.idx];
 $('overall').textContent=fmt(state.overall);$('segmentTime').textContent=fmt(state.segment);
 $('segmentLabel').textContent=`Activity ${state.idx+1} of ${segments.length}`;$('segmentTitle').textContent=s.title;$('segmentRange').textContent=segmentRange(state.idx);
 $('cueList').innerHTML=s.cues.map(x=>`<li>${x}</li>`).join('');$('statusText').textContent=state.running?'RUNNING':'READY';
 $('startBtn').textContent=state.running?'PAUSE':(state.overall===45*60?'START':'RESUME');
 $('progressBar').style.width=`${Math.min(100,Math.max(0,(45*60-state.overall)/(45*60)*100))}%`;
 const showRound=!!s.round;$('roundBadge').hidden=!showRound;$('roundBadge').textContent=`ROUND ${activeRound()+1}`;
 const n=segments[Math.min(state.idx+1,segments.length-1)];$('upNextRange').textContent=segmentRange(Math.min(state.idx+1,segments.length-1));$('upNextTitle').textContent=n.title;$('upNextDesc').textContent=n.desc;$('upNextTime').textContent=state.idx===segments.length-1?'DONE':`${n.mins} min`;
}

function renderTimeline(){$('timeline').innerHTML=segments.map((s,i)=>`<div class="step ${i===state.idx?'current':''}"><div class="time">${segmentRange(i)}</div><div><strong>${s.title}</strong><small>${s.desc}</small></div><div class="mins">${s.mins} MIN</div></div>`).join('')}
function renderRoster(){const r=$('rosterInputs');r.innerHTML='';for(let i=0;i<10;i++){const inp=document.createElement('input');inp.value=roster[i]||'';inp.placeholder=`Player ${i+1}`;inp.dataset.i=i;r.appendChild(inp)}coaches.forEach((c,i)=>$(`coach${i}`).value=c);renderGroups()}
function renderGroups(){const gs=groups();$('groupPreview').innerHTML=gs.map((g,i)=>`<div class="station"><div class="shead"><div><div class="num">GROUP ${String.fromCharCode(65+i)}</div><h3>${g.length||0} players</h3></div></div><div class="players">${g.length?g.map(p=>`<span class="chip">${p}</span>`).join(''):'<span class="empty">Add roster names</span>'}</div></div>`).join('')}
function renderStations(){const gs=groups(),round=activeRound();$('stationGrid').innerHTML=gs.map((g,gi)=>{const si=stationFor(gi,round),sd=stationDefs[si];return `<div class="station"><div class="shead"><div><div class="num">GROUP ${String.fromCharCode(65+gi)}</div><h3>${sd.name}</h3></div><div class="coach">${coaches[sd.coach]||`Coach ${sd.coach+1}`}</div></div><div class="players">${g.length?g.map(p=>`<span class="chip">${p}</span>`).join(''):'<span class="empty">Roster not loaded</span>'}</div></div>`}).join('');$('stationCues').innerHTML=stationDefs.map((s,i)=>`<div class="stationcue"><strong>${s.name} — ${coaches[s.coach]||`Coach ${i+1}`}</strong>${s.cue}</div>`).join('');document.querySelectorAll('.roundswitch button').forEach((b,i)=>b.classList.toggle('active',i===round))}

function scheduleRow(e){const type=e.kind==='game'?(e.home?'HOME':'AWAY'):'PRACTICE';const title=eventTitle(e);return `<div class="schedule-row"><div class="schedule-date"><b>${dateShort(e.date)}</b><span>${time12(e.time)}</span></div><div class="schedule-main"><strong>${title}</strong><small>${e.field}</small></div><span class="schedule-tag ${e.kind}">${type}</span></div>`}
function renderSchedule(){const e=nextEvent();$('scheduleNext').innerHTML=e?`<div class="schedule-feature"><div class="kicker">NEXT UP</div><h3>${eventTitle(e)}</h3><p>${eventMeta(e)}</p><strong>${countdown(eventDate(e))}</strong></div>`:'<div class="schedule-feature"><h3>Season complete</h3></div>';$('practiceSchedule').innerHTML=practices.map(scheduleRow).join('');$('gameSchedule').innerHTML=games.map(scheduleRow).join('')}

function dispatchTransition(kind,detail={}){window.dispatchEvent(new CustomEvent('coachbot:transition',{detail:{kind,...detail}}))}
function renderAll(){renderNextEvent();renderMode();renderNow();renderTimeline();renderStations();renderSchedule()}

function next(auto=false){const previous=segments[state.idx];if(state.idx<segments.length-1){state.idx++;state.segment=segments[state.idx].mins*60;state.round=0;dispatchTransition('activity',{title:segments[state.idx].title,water:!!segments[state.idx].water,auto})}else{state.running=false;if(timer)clearInterval(timer);timer=null;dispatchTransition('complete',{title:'Practice Complete'})}renderAll()}
function prev(){if(state.idx>0){state.idx--;state.segment=segments[state.idx].mins*60;state.round=0}renderAll()}
function tick(){if(!state.running)return;if(state.overall>0)state.overall--;if(state.segment>0)state.segment--;const s=segments[state.idx];if(!heatMode&&s.round){const elapsed=s.mins*60-state.segment;const newRound=Math.min(2,Math.floor(elapsed/(s.roundMins*60)));if(newRound!==state.round){state.round=newRound;dispatchTransition('rotate',{round:newRound,title:`Round ${newRound+1}`})}}if(state.segment===30)dispatchTransition('warning',{title:s.title});if(state.segment<=0&&state.overall>0)next(true);if(state.overall<=0){state.running=false;if(timer)clearInterval(timer);timer=null;dispatchTransition('complete',{title:'Practice Complete'})}renderAll()}

$('startBtn').addEventListener('click',()=>{state.running=!state.running;if(state.running&&!timer)timer=setInterval(tick,1000);renderAll()});
$('nextBtn').addEventListener('click',()=>next(false));$('prevBtn').addEventListener('click',prev);
$('plusBtn').addEventListener('click',()=>{state.segment+=60;state.overall=Math.min(45*60,state.overall+60);renderAll()});
$('minusBtn').addEventListener('click',()=>{state.segment=Math.max(0,state.segment-60);state.overall=Math.max(0,state.overall-60);renderAll()});
$('resetBtn').addEventListener('click',()=>{if(timer)clearInterval(timer);timer=null;segments=heatMode?heatSegments:standardSegments;state={idx:0,overall:45*60,segment:segments[0].mins*60,running:false,round:0};renderAll();toast('Practice reset')});
$('heatModeBtn').addEventListener('click',()=>{heatMode=!heatMode;localStorage.setItem('firefliesHeatMode',String(heatMode));segments=heatMode?heatSegments:standardSegments;if(timer)clearInterval(timer);timer=null;state={idx:0,overall:45*60,segment:segments[0].mins*60,running:false,round:0};renderAll();toast(heatMode?'Heat Mode on':'Standard mode on')});

document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$(`view-${btn.dataset.view}`).classList.add('active')}));
document.querySelectorAll('.roundswitch button').forEach(btn=>btn.addEventListener('click',()=>{state.round=Number(btn.dataset.round);renderStations()}));

$('importRoster').addEventListener('click',()=>{const names=$('bulkRoster').value.split(/\n+/).map(x=>x.trim()).filter(Boolean).slice(0,10);roster=names.concat(Array(Math.max(0,10-names.length)).fill(''));groupOrder=names.slice();renderRoster();toast(`${names.length} names imported`)});
$('saveRoster').addEventListener('click',()=>{roster=[...document.querySelectorAll('#rosterInputs input')].map(x=>x.value.trim());coaches=[0,1,2].map(i=>$(`coach${i}`).value.trim()||`Coach ${i+1}`);groupOrder=roster.filter(Boolean);localStorage.setItem('firefliesRoster',JSON.stringify(roster));localStorage.setItem('firefliesCoaches',JSON.stringify(coaches));localStorage.setItem('firefliesGroups',JSON.stringify(groupOrder));renderGroups();renderStations();toast('Roster saved')});
$('shuffleRoster').addEventListener('click',()=>{groupOrder=roster.filter(Boolean).slice();for(let i=groupOrder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[groupOrder[i],groupOrder[j]]=[groupOrder[j],groupOrder[i]]}localStorage.setItem('firefliesGroups',JSON.stringify(groupOrder));renderGroups();renderStations();toast('Groups shuffled')});

renderRoster();renderAll();
setInterval(renderNextEvent,60000);
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
