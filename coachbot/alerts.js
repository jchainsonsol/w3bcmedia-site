(()=>{
  const byId=id=>document.getElementById(id);
  let enabled=localStorage.getItem('firefliesAlertsEnabled')==='true';
  let warn30=localStorage.getItem('firefliesWarn30')!=='false';

  async function showNotification(title,body,force=false){
    if(!force&&!enabled)return false;
    if(!('Notification' in window)||Notification.permission!=='granted')return false;
    try{
      const options={body,icon:'assets/fireflies-logo.svg',badge:'assets/fireflies-logo.svg',tag:`fireflies-${title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,renotify:true};
      if('serviceWorker' in navigator){
        const reg=await navigator.serviceWorker.ready;
        await reg.showNotification(title,options);
      }else{
        new Notification(title,options);
      }
      return true;
    }catch(e){console.warn('Coach Bot notification failed',e);return false}
  }

  function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true}

  function updateUI(){
    const status=byId('alertStatus'),help=byId('alertHelp'),btn=byId('enableAlerts'),toggle=byId('warn30'),note=byId('watchNote');
    if(!status||!help||!btn||!toggle)return;
    toggle.checked=warn30;
    if(!('Notification' in window)){
      status.textContent='UNSUPPORTED';
      help.textContent='This browser does not expose web notifications here.';
      btn.disabled=true;
    }else if(Notification.permission==='denied'){
      status.textContent='BLOCKED';
      help.textContent='Notifications are blocked. Re-enable Coach Bot notifications in iPhone Settings.';
    }else if(Notification.permission==='granted'&&enabled){
      status.textContent='ON';
      help.textContent='Timer alerts are armed for station changes, water breaks and practice complete.';
    }else if(Notification.permission==='granted'){
      status.textContent='READY';
      help.textContent='Permission is granted. Tap Enable Alerts to arm the practice timer.';
    }else{
      status.textContent='OFF';
      help.textContent='Tap Enable Alerts to allow Coach Bot notifications.';
    }
    btn.textContent=enabled?'DISABLE ALERTS':'ENABLE ALERTS';
    if(note&&!isStandalone())note.textContent='On iPhone: open this site in Safari → Share → Add to Home Screen. Then launch Coach Bot from the Home Screen and enable alerts.';
  }

  async function requestPermission(){
    if(!('Notification' in window))return 'unsupported';
    if(Notification.permission==='granted')return 'granted';
    return Notification.requestPermission();
  }

  async function toggleAlerts(){
    if(enabled){enabled=false;localStorage.setItem('firefliesAlertsEnabled','false');updateUI();return}
    const p=await requestPermission();
    if(p==='granted'){
      enabled=true;localStorage.setItem('firefliesAlertsEnabled','true');updateUI();
      await showNotification('Fireflies Coach Bot','Alerts are armed for practice.',true);
    }else updateUI();
  }

  async function testAlert(){
    const p=await requestPermission();
    if(p!=='granted'){updateUI();return}
    await showNotification('⚾ Fireflies Test Alert','Coach Bot notifications are working. Your Apple Watch may mirror this when the iPhone is locked.',true);
    updateUI();
  }

  function transitionMessage(detail){
    if(detail.water)return ['💧 Fireflies — Water Break','Shade, cool down and hydrate.'];
    return ['⚾ Fireflies — Next Activity',detail.title||'Move to the next activity.'];
  }

  window.addEventListener('coachbot:transition',e=>{
    const d=e.detail||{};
    if(d.kind==='warning'&&warn30){showNotification('⏱ Fireflies — 30 Seconds',`Get ready to finish ${d.title||'this activity'} and rotate.`);return}
    if(d.kind==='rotate'){showNotification(`🔄 Fireflies — ROTATE • ROUND ${Number(d.round||0)+1}`,'Rotate each group to the next station.');return}
    if(d.kind==='activity'){const [title,body]=transitionMessage(d);showNotification(title,body);return}
    if(d.kind==='complete')showNotification('✨ Fireflies Practice Complete','Great work. Hydrate, huddle and head home.');
  });

  window.addEventListener('DOMContentLoaded',()=>{
    updateUI();
    byId('enableAlerts')?.addEventListener('click',toggleAlerts);
    byId('testAlert')?.addEventListener('click',testAlert);
    byId('warn30')?.addEventListener('change',e=>{warn30=e.target.checked;localStorage.setItem('firefliesWarn30',String(warn30))});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')updateUI()});
  });
})();
