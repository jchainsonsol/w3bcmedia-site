(()=>{
  const styleLink=document.createElement('link');styleLink.rel='stylesheet';styleLink.href='team-checkin.css';document.head.appendChild(styleLink);
  const byId=id=>document.getElementById(id);
  let enabled=localStorage.getItem('firefliesAlertsEnabled')==='true';
  let warn30=localStorage.getItem('firefliesWarn30')!=='false';
  let lastTitle='';
  let lastRound='';
  let warnedFor='';

  async function showNotification(title,body,force=false){
    if(!force&&!enabled)return false;
    if(!('Notification' in window)||Notification.permission!=='granted')return false;
    try{
      const options={body,icon:'assets/fireflies-logo.svg',badge:'assets/fireflies-logo.svg',tag:`fireflies-${Date.now()}`};
      if('serviceWorker' in navigator){const reg=await navigator.serviceWorker.ready;await reg.showNotification(title,options)}else new Notification(title,options);
      return true;
    }catch(e){console.warn('Coach Bot notification failed',e);return false}
  }

  function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true}
  function updateUI(){
    const status=byId('alertStatus'),help=byId('alertHelp'),btn=byId('enableAlerts'),toggle=byId('warn30'),note=byId('watchNote');
    if(!status||!help||!btn||!toggle)return;
    toggle.checked=warn30;
    if(!('Notification' in window)){status.textContent='UNSUPPORTED';help.textContent='This browser does not expose web notifications here.';btn.disabled=true}
    else if(Notification.permission==='denied'){status.textContent='BLOCKED';help.textContent='Notifications are blocked. Re-enable Coach Bot notifications in iPhone Settings.'}
    else if(Notification.permission==='granted'&&enabled){status.textContent='ON';help.textContent='Timer alerts are armed for rotations, water breaks and practice complete.'}
    else if(Notification.permission==='granted'){status.textContent='READY';help.textContent='Permission is granted. Tap Enable Alerts to arm the timer.'}
    else{status.textContent='OFF';help.textContent='Tap Enable Alerts to allow Coach Bot notifications.'}
    btn.textContent=enabled?'DISABLE ALERTS':'ENABLE ALERTS';
    if(note&&!isStandalone())note.textContent='On iPhone: Safari → Share → Add to Home Screen. Open Coach Bot from the Home Screen, then enable alerts.';
  }

  async function requestPermission(){if(!('Notification' in window))return 'unsupported';if(Notification.permission==='granted')return 'granted';return Notification.requestPermission()}
  async function toggleAlerts(){if(enabled){enabled=false;localStorage.setItem('firefliesAlertsEnabled','false');updateUI();return}const p=await requestPermission();if(p==='granted'){enabled=true;localStorage.setItem('firefliesAlertsEnabled','true');updateUI();await showNotification('Fireflies Coach Bot','Alerts are armed for practice.',true)}else updateUI()}
  async function testAlert(){const p=await requestPermission();if(p!=='granted'){updateUI();return}await showNotification('⚾ Fireflies Test Alert','Coach Bot alerts are working. Your Apple Watch may mirror this when your iPhone is locked.',true);updateUI()}

  function messageFor(title){
    if(/shade|water/i.test(title))return ['💧 Fireflies — WATER BREAK','Get everybody to shade, cool down and hydrate.'];
    if(/splash/i.test(title))return ['💦 Fireflies — SPLASH CATCH','Reusable water-balloon pop-fly game. Eyes up, get under it, two hands!'];
    if(/station rotation/i.test(title))return ['🔄 Fireflies — ROTATE','Move each group to the next baseball station.'];
    if(/huddle/i.test(title))return ['✨ Fireflies — HUDDLE',title];
    return ['⚾ Fireflies — NEXT',title];
  }

  function observeTimer(){
    const titleEl=byId('segmentTitle'),timeEl=byId('segmentTime'),roundEl=byId('roundBadge');if(!titleEl||!timeEl)return;
    const check=()=>{
      const title=titleEl.textContent.trim(),time=timeEl.textContent.trim(),round=roundEl&&!roundEl.hidden?roundEl.textContent.trim():'';
      if(lastTitle&&title!==lastTitle){const [h,b]=messageFor(title);showNotification(h,b);warnedFor=''}
      if(warn30&&time==='0:30'&&warnedFor!==title){warnedFor=title;showNotification('⏱ Fireflies — 30 Seconds',`Finish ${title} and get ready for the next move.`)}
      if(round&&lastRound&&round!==lastRound){showNotification(`🔄 Fireflies — ${round}`,'Rotate each group to the next station.')}
      lastTitle=title;if(round)lastRound=round;
    };
    check();new MutationObserver(check).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden']});
  }

  window.addEventListener('coachbot:transition',e=>{if((e.detail||{}).kind==='complete')showNotification('✨ Fireflies Practice Complete','Great work. Final water, huddle and head home.')});
  window.addEventListener('DOMContentLoaded',()=>{updateUI();byId('enableAlerts')?.addEventListener('click',toggleAlerts);byId('testAlert')?.addEventListener('click',testAlert);byId('warn30')?.addEventListener('change',e=>{warn30=e.target.checked;localStorage.setItem('firefliesWarn30',String(warn30))});observeTimer();document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')updateUI()})});
})();
