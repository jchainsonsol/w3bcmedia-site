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
 {title:'Team Huddle + Safety',mins:5,desc:'Welcome, safety rules and Fireflies cheer.',cues:['No swinging until a coach says go.','When Coach says FREEZE, everybody freezes.','Quick water check before moving.','Fireflies on 3!']},
 {title:'Baseball Warm-Up',mins:5,desc:'Movement, bases and easy throwing.',cues:['Jog the bases once.','High knees + side shuffle.','Home to first at game speed.','Easy partner throws.']},
 {title:'Station Rotation',mins:21,desc:'Three groups rotate through hitting, grounders and throwing/bases.',cues:['Use only players checked in today.','7 minutes per station.','Coaches stay at stations; players rotate.','Keep lines moving.'],round:true,roundMins:7},
 {title:'Water + Quick Reset',mins:2,desc:'Fast drink and reset.',cues:['Everybody drinks.','Shade if available.','Back to the infield quickly.'],water:true},
 {title:'Fireflies Team Defense',mins:7,desc:'Field the ball and get it toward first.',cues:['Coach rolls or hits easy balls.','Rotate first base every 2–3 balls.','Team goal: 10 good plays.','Praise effort loudly.']},
 {title:'Home Run Relay',mins:4,desc:'Fun base-running finish.',cues:['Everyone runs the bases.','Touch every bag.','Cheer for teammates.']},
 {title:'Huddle + Fireflies Cheer',mins:1,desc:'One lesson, one compliment and team cheer.',cues:['Ask: What base do we run to first?','Recognize hustle and listening.','1, 2, 3 — FIREFLIES!']}
];

const heatSegments=[
 {title:'Shade Huddle + Water',mins:5,desc:'Hydrate first, safety rules and Fireflies cheer.',cues:['Everybody takes a drink before starting.','No swinging until a coach says go.','When Coach says FREEZE, everybody freezes.','Keep the pace easy in the heat.'],water:true},
 {title:'Easy Warm-Up',mins:4,desc:'Light throwing and one easy trip around the bases.',cues:['No conditioning sprints.','Walk/jog the bases once.','Short easy throws.','Shade while waiting.']},
 {title:'Station Rotation — Round 1',mins:5,desc:'Hitting, grounders and throwing/bases.',cues:['Short lines and low-intensity reps.','Keep waiting players shaded when possible.','Fourth coach handles water, shade and safety.'],round:true,heatRound:0},
 {title:'Shade + Water',mins:3,desc:'Mandatory cooling break.',cues:['Everybody drinks.','Move to shade.','Check every player before continuing.'],water:true},
 {title:'Station Rotation — Round 2',mins:5,desc:'Rotate groups to the next station.',cues:['Five minutes only.','Keep effort controlled.','Stop early for any player who looks overheated.'],round:true,heatRound:1},
 {title:'Shade + Water',mins:3,desc:'Mandatory cooling break.',cues:['Everybody drinks.','Shade first.','No rushing the break.'],water:true},
 {title:'Station Rotation — Round 3',mins:5,desc:'Final baseball station.',cues:['Five minutes only.','Lots of reps, little standing.','No extra running.'],round:true,heatRound:2},
 {title:'Shade + Water',mins:3,desc:'Mandatory cooling break.',cues:['Everybody drinks.','Cool down before the water-balloon game.'],water:true},
 {title:'Firefly Splash Catch',mins:7,desc:'Reusable water-balloon pop-fly game on the grass.',cues:['Coach gives gentle pop-up tosses.','Eyes up → get underneath → two hands.','Keep balloons on grass, not the dirt/base paths.','No gloves and no throws at faces.','Team goal: 10 clean Splash Catches!'],splash:true},
 {title:'Shade Huddle + Final Water',mins:5,desc:'Cool down, recap and finish together.',cues:['Everybody drinks again.','Ask: What base do we run to first?','Recognize listening, effort and teamwork.','1, 2, 3 — FIREFLIES!'],water:true}
];

const stationDefs=[
 {name:'Hitting',cue:'Tee first • feet set • eyes on ball • swing through • drop bat safely • run through first.'},
 {name:'Ground Balls',cue:'Feet apart • butt down • glove to dirt • two hands • field → stand → throw.'},
 {name:'Throwing + Bases',cue:'Step toward target • short throws • name the bases • touch every bag • run through first.'}
];

const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
const fmt=s=>`${Math.floor(Math.max(0,s)/60)}:${String(Math.max(0,s)%60).padStart(2,'0')}`;
const localDateKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const todayKey=localDateKey(new Date());
const attendanceKey=`firefliesAttendance:${todayKey}`;

let roster=JSON.parse(localStorage.getItem('firefliesRoster')||'null')||defaultPlayers.slice();
let coaches=JSON.parse(localStorage.getItem('firefliesCoaches')||'null')||['Head Coach','Assistant 1','Assistant 2','Assistant 3'];
while(coaches.length<4)coaches.push(`Assistant ${coaches.length}`);
coaches=coaches.slice(0,4);
let groupOrder=JSON.parse(localStorage.getItem('firefliesGroups')||'null')||roster.filter(Boolean);
let attendance=JSON.parse(localStorage.getItem(attendanceKey)||'null')||{players:[],coaches:[]};
let savedHeat=localStorage.getItem('firefliesHeatMode');
let heatMode=savedHeat===null?(todayKey==='2026-08-17'):savedHeat==='true';
let segments=heatMode?heatSegments:standardSegments;
let state={idx:0,overall:45*60,segment:segments[0].mins*60,running:false,round:0};
let timer=null;

function toast(msg){const t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1300)}
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
function presentPlayers(){const valid=new Set(roster.filter(Boolean));return attendance.players.filter(p=>valid.has(p))}
function presentCoachIndexes(){return attendance.coaches.filter(i=>Number.isInteger(i)&&i>=0&&i<4)}
function presentCoachNames(){return presentCoachIndexes().map(i=>({index:i,name:coaches[i]||`Coach ${i+1}`}))}
function orderedPresent(){const here=new Set(presentPlayers());const ordered=groupOrder.filter(p=>here.has(p));presentPlayers().forEach(p=>{if(!ordered.includes(p))ordered.push(p)});return ordered}
function groups(){const list=orderedPresent();const out=[[],[],[]];list.forEach((p,i)=>out[i%3].push(p));return out}
function stationFor(groupIdx,round){return (groupIdx+round)%3}
function activeRound(){const s=segments[state.idx];if(heatMode&&Number.isInteger(s.heatRound))return s.heatRound;return state.round}
function segmentStartMinutes(index){return segments.slice(0,index).reduce((sum,s)=>sum+s.mins,0)}
function clockAt(offset){const total=17*60+30+offset;let h=Math.floor(total/60),m=total%60;const ap=h>=12?'PM':'AM';h=h%12||12;return `${h}:${pad(m)} ${ap}`}
function segmentRange(index){const start=segmentStartMinutes(index);return `${clockAt(start)}–${clockAt(start+segments[index].mins)}`}
function saveAttendance(){localStorage.setItem(attendanceKey,JSON.stringify(attendance))}

function renderNextEvent(){const e=nextEvent();if(!e){$('nextEventTitle').textContent='Season complete';$('nextEventMeta').textContent='Great season, Fireflies.';$('nextEventType').textContent='DONE';$('nextEventCountdown').textContent='';return}$('nextEventTitle').textContent=eventTitle(e);$('nextEventMeta').textContent=eventMeta(e);$('nextEventType').textContent=e.kind==='game'?(e.home?'HOME GAME':'AWAY GAME'):'PRACTICE';$('nextEventCountdown').textContent=countdown(eventDate(e))}

function renderMode(){
 $('heatModeBtn').textContent=heatMode?'✓ HEAT MODE':'🔥 HEAT MODE';
 $('heatModeBtn').classList.toggle('active',heatMode);
 $('heatBanner').hidden=!heatMode;
 $('modeTitle').textContent=heatMode?'100° Heat Practice':'Standard Practice';
 $('modeDesc').textContent=heatMode?'45 minutes • 5-minute stations • cooling breaks • Splash Catch':'45 minutes • 7-minute station rounds';
 $('stationSubhead').textContent=heatMode?'Present players only. Groups rotate every 5 minutes with cooling breaks.':'Present players only. Coaches stay put while groups rotate every 7 minutes.';
 $('stationDurationBadge').textContent=heatMode?'3 × 5 MIN':'3 × 7 MIN';
 $('winText').textContent=heatMode?'Keep the Fireflies safe and hydrated, get quality baseball reps, then cool them down with the reusable water-balloon pop-fly game.':'Safe swings. Know where first base is. Lots of touches. Very little standing around. Finish with the kids wanting to come back.';
}

function renderCheckinSummary(){
 const pc=presentPlayers().length,cc=presentCoachIndexes().length;
 $('presentPlayerCount').textContent=pc;$('presentCoachCount').textContent=cc;$('teamPresentPlayers').textContent=pc;$('teamPresentCoaches').textContent=`${cc} / 4`;
 const gs=groups();$('teamGroupSizes').textContent=pc?gs.map(g=>g.length).join(' / '):'—';$('groupCountLabel').textContent=pc?`${pc} present players`:'no players selected';
 $('checkinHint').textContent=pc&&cc?`${pc} players checked in • groups update automatically`:'Set attendance before practice.';
 const w=$('coachWarning');
 if(cc>=4){w.hidden=false;w.textContent=`4 coaches present: ${presentCoachNames()[3]?.name||'Coach 4'} is the water/shade floater and safety coach.`}
 else if(cc===3){w.hidden=false;w.textContent='3 coaches present: all three baseball stations are staffed. Keep water breaks mandatory.'}
 else if(cc===2){w.hidden=false;w.textContent='Only 2 coaches selected. Combine players into two supervised stations or add another coach before starting.'}
 else if(cc===1){w.hidden=false;w.textContent='Only 1 coach selected. Run one supervised activity at a time — do not run unattended stations.'}
 else{w.hidden=false;w.textContent='Select the head coach and assistants who are here today.'}
}

function renderNow(){
 const s=segments[state.idx];$('overall').textContent=fmt(state.overall);$('segmentTime').textContent=fmt(state.segment);$('segmentLabel').textContent=`Activity ${state.idx+1} of ${segments.length}`;$('segmentTitle').textContent=s.title;$('segmentRange').textContent=segmentRange(state.idx);$('cueList').innerHTML=s.cues.map(x=>`<li>${x}</li>`).join('');$('statusText').textContent=state.running?'RUNNING':'READY';$('startBtn').textContent=state.running?'PAUSE':(state.overall===45*60?'START':'RESUME');$('progressBar').style.width=`${Math.min(100,Math.max(0,(45*60-state.overall)/(45*60)*100))}%`;const showRound=!!s.round;$('roundBadge').hidden=!showRound;$('roundBadge').textContent=`ROUND ${activeRound()+1}`;const ni=Math.min(state.idx+1,segments.length-1),n=segments[ni];$('upNextRange').textContent=segmentRange(ni);$('upNextTitle').textContent=n.title;$('upNextDesc').textContent=n.desc;$('upNextTime').textContent=state.idx===segments.length-1?'DONE':`${n.mins} min`;
}
function renderTimeline(){$('timeline').innerHTML=segments.map((s,i)=>`<div class="step ${i===state.idx?'current':''}"><div class="time">${segmentRange(i)}</div><div><strong>${s.title}</strong><small>${s.desc}</small></div><div class="mins">${s.mins} MIN</div></div>`).join('')}

function renderRosterInputs(){
 const r=$('rosterInputs');r.innerHTML='';for(let i=0;i<10;i++){const inp=document.createElement('input');inp.value=roster[i]||'';inp.placeholder=`Player ${i+1}`;inp.dataset.i=i;r.appendChild(inp)}
 for(let i=0;i<4;i++)$(`coach${i}`).value=coaches[i]||'';
}
function togglePlayer(name){const set=new Set(attendance.players);set.has(name)?set.delete(name):set.add(name);attendance.players=[...set];saveAttendance();renderTeam()}
function toggleCoach(i){const set=new Set(attendance.coaches);set.has(i)?set.delete(i):set.add(i);attendance.coaches=[...set].sort((a,b)=>a-b);saveAttendance();renderTeam()}
function renderCheckins(){
 const names=roster.filter(Boolean);const p=$('playerCheckin');p.innerHTML='';
 if(!names.length){p.innerHTML='<div class="check-empty">Roster not loaded yet. Use Roster Setup below, then save.</div>'}
 else names.forEach(name=>{const b=document.createElement('button');b.type='button';b.className='check-btn'+(attendance.players.includes(name)?' active':'');b.innerHTML=`<span>${name}</span><b>${attendance.players.includes(name)?'HERE':'OUT'}</b>`;b.addEventListener('click',()=>togglePlayer(name));p.appendChild(b)});
 const c=$('coachCheckin');c.innerHTML='';coaches.forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.className='check-btn'+(attendance.coaches.includes(i)?' active':'');b.innerHTML=`<span>${i===0?'HEAD • ':''}${name}</span><b>${attendance.coaches.includes(i)?'HERE':'OUT'}</b>`;b.addEventListener('click',()=>toggleCoach(i));c.appendChild(b)});
}
function renderGroups(){const gs=groups();$('groupPreview').innerHTML=gs.map((g,i)=>`<div class="station"><div class="shead"><div><div class="num">GROUP ${String.fromCharCode(65+i)}</div><h3>${g.length} players</h3></div></div><div class="players">${g.length?g.map(p=>`<span class="chip">${p}</span>`).join(''):'<span class="empty">No players</span>'}</div></div>`).join('')}
function renderStations(){
 const gs=groups(),round=activeRound(),presentCoaches=presentCoachNames();
 $('stationGrid').innerHTML=gs.map((g,gi)=>{const si=stationFor(gi,round),sd=stationDefs[si],coach=presentCoaches[si]?.name||'NO COACH SELECTED';return `<div class="station ${presentCoaches[si]?'':'unstaffed'}"><div class="shead"><div><div class="num">GROUP ${String.fromCharCode(65+gi)}</div><h3>${sd.name}</h3></div><div class="coach">${coach}</div></div><div class="players">${g.length?g.map(p=>`<span class="chip">${p}</span>`).join(''):'<span class="empty">No players checked in</span>'}</div></div>`}).join('');
 const floater=presentCoaches[3]?.name;$('floaterLabel').textContent=floater?`${floater} = water/shade floater`:(presentCoaches.length>=3?'No dedicated floater':'Need 3 coaches for 3 stations');
 $('stationCues').innerHTML=stationDefs.map((s,i)=>`<div class="stationcue"><strong>${s.name} — ${presentCoaches[i]?.name||'UNSTAFFED'}</strong>${s.cue}</div>`).join('')+(floater?`<div class="stationcue floater"><strong>Water / Shade / Safety — ${floater}</strong>Keep water ready, move waiting kids toward shade, watch for heat stress and help any station that backs up.</div>`:'');
 document.querySelectorAll('.roundswitch button').forEach((b,i)=>b.classList.toggle('active',i===round));
}
function renderTeam(){renderCheckinSummary();renderCheckins();renderGroups();renderStations()}

function scheduleRow(e){const type=e.kind==='game'?(e.home?'HOME':'AWAY'):'PRACTICE';return `<div class="schedule-row"><div class="schedule-date"><b>${dateShort(e.date)}</b><span>${time12(e.time)}</span></div><div class="schedule-main"><strong>${eventTitle(e)}</strong><small>${e.field}</small></div><span class="schedule-tag ${e.kind}">${type}</span></div>`}
function renderSchedule(){const e=nextEvent();$('scheduleNext').innerHTML=e?`<div class="schedule-feature"><div class="kicker">NEXT UP</div><h3>${eventTitle(e)}</h3><p>${eventMeta(e)}</p><strong>${countdown(eventDate(e))}</strong></div>`:'<div class="schedule-feature"><h3>Season complete</h3></div>';$('practiceSchedule').innerHTML=practices.map(scheduleRow).join('');$('gameSchedule').innerHTML=games.map(scheduleRow).join('')}
function renderAll(){renderNextEvent();renderMode();renderNow();renderTimeline();renderSchedule();renderTeam()}

function next(){if(state.idx<segments.length-1){state.idx++;state.segment=segments[state.idx].mins*60;state.round=0}else{state.running=false;if(timer)clearInterval(timer);timer=null;window.dispatchEvent(new CustomEvent('coachbot:transition',{detail:{kind:'complete'}}))}renderAll()}
function prev(){if(state.idx>0){state.idx--;state.segment=segments[state.idx].mins*60;state.round=0}renderAll()}
function tick(){if(!state.running)return;if(state.overall>0)state.overall--;if(state.segment>0)state.segment--;const s=segments[state.idx];if(s.round&&s.roundMins){const elapsed=s.mins*60-state.segment;state.round=Math.min(2,Math.floor(elapsed/(s.roundMins*60)))}if(state.segment<=0&&state.overall>0)next();if(state.overall<=0){state.running=false;if(timer)clearInterval(timer);timer=null;window.dispatchEvent(new CustomEvent('coachbot:transition',{detail:{kind:'complete'}}))}renderAll()}
function resetPractice(){if(timer)clearInterval(timer);timer=null;segments=heatMode?heatSegments:standardSegments;state={idx:0,overall:45*60,segment:segments[0].mins*60,running:false,round:0};renderAll();toast('Practice reset')}

$('startBtn').addEventListener('click',()=>{if(!presentPlayers().length){toast('Select players first');document.querySelector('[data-view="team"]').click();return}if(presentCoachIndexes().length<1){toast('Select coaches first');document.querySelector('[data-view="team"]').click();return}state.running=!state.running;if(state.running&&!timer)timer=setInterval(tick,1000);renderAll()});
$('nextBtn').addEventListener('click',next);$('prevBtn').addEventListener('click',prev);$('plusBtn').addEventListener('click',()=>{state.segment+=60;state.overall=Math.min(45*60,state.overall+60);renderAll()});$('minusBtn').addEventListener('click',()=>{state.segment=Math.max(0,state.segment-60);state.overall=Math.max(0,state.overall-60);renderAll()});$('resetBtn').addEventListener('click',resetPractice);
$('heatModeBtn').addEventListener('click',()=>{heatMode=!heatMode;localStorage.setItem('firefliesHeatMode',String(heatMode));resetPractice();toast(heatMode?'Heat Mode ON':'Standard Mode ON')});
$('openTeamBtn').addEventListener('click',()=>document.querySelector('[data-view="team"]').click());

document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$(`view-${btn.dataset.view}`).classList.add('active')}));
document.querySelectorAll('.roundswitch button').forEach(btn=>btn.addEventListener('click',()=>{state.round=Number(btn.dataset.round);renderStations()}));

$('allPlayers').addEventListener('click',()=>{attendance.players=roster.filter(Boolean);saveAttendance();renderTeam();toast('All players checked in')});
$('clearPlayers').addEventListener('click',()=>{attendance.players=[];saveAttendance();renderTeam()});
$('allCoaches').addEventListener('click',()=>{attendance.coaches=[0,1,2,3];saveAttendance();renderTeam();toast('All coaches checked in')});
$('clearCoaches').addEventListener('click',()=>{attendance.coaches=[];saveAttendance();renderTeam()});

$('importRoster').addEventListener('click',()=>{const names=$('bulkRoster').value.split(/\n|,/).map(x=>x.trim()).filter(Boolean).slice(0,10);if(!names.length){toast('Paste names first');return}roster=names;while(roster.length<10)roster.push('');groupOrder=names.slice();attendance.players=[];localStorage.setItem('firefliesRoster',JSON.stringify(roster));localStorage.setItem('firefliesGroups',JSON.stringify(groupOrder));saveAttendance();renderRosterInputs();renderTeam();toast(`${names.length} players imported`)});
$('saveRoster').addEventListener('click',()=>{roster=[...document.querySelectorAll('#rosterInputs input')].map(x=>x.value.trim()).slice(0,10);while(roster.length<10)roster.push('');coaches=[0,1,2,3].map((_,i)=>$(`coach${i}`).value.trim()||(i===0?'Head Coach':`Assistant ${i}`));const valid=new Set(roster.filter(Boolean));attendance.players=attendance.players.filter(p=>valid.has(p));groupOrder=groupOrder.filter(p=>valid.has(p));roster.filter(Boolean).forEach(p=>{if(!groupOrder.includes(p))groupOrder.push(p)});localStorage.setItem('firefliesRoster',JSON.stringify(roster));localStorage.setItem('firefliesCoaches',JSON.stringify(coaches));localStorage.setItem('firefliesGroups',JSON.stringify(groupOrder));saveAttendance();renderRosterInputs();renderTeam();toast('Team saved')});
$('shuffleRoster').addEventListener('click',()=>{groupOrder=orderedPresent();for(let i=groupOrder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[groupOrder[i],groupOrder[j]]=[groupOrder[j],groupOrder[i]]}localStorage.setItem('firefliesGroups',JSON.stringify(groupOrder));renderTeam();toast('Present players shuffled')});

$('teamDateLabel').textContent=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(new Date());
renderRosterInputs();renderAll();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
