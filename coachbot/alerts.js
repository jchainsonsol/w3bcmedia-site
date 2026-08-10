(()=>{
  const byId=id=>document.getElementById(id);
  let enabled=localStorage.getItem('firefliesAlertsEnabled')==='true';
  let warn30=localStorage.getItem('firefliesWarn30')!=='false';
  let lastTitle='';
  let warnedTitle='';
  let lastRound='';

  async function notify(title,body){
    if(!enabled||!('Notification' in window)||Notification.permission!=='granted')return;
    try{
      if('serviceWorker' in navigator){
        const reg=await navigator.serviceWorker.ready;
        await reg.showNotification(title,{body,icon:'assets/fireflies-logo.svg',badge:'assets/fireflies-logo.svg',tag:'fireflies-coachbot-'+Date.now()});
      }else{
        new Notification(title,{body,icon:'assets/fireflies-logo.svg'});
      }
    }catch(e){console.warn('Coach Bot notification failed',e)}
  }

  function updateUI(){
    const status=byId('alertStatus'),help=byId('alertHelp'),btn=byId('enableAlerts'),toggle=byId('warn30');
    if(!status||!help||!btn||!toggle)return;
    toggle.checked=warn30;
    if(!('Notification' in window)){
      status.textContent='UNSUPPORTED';
      help.textContent='This browser does not support web notifications.';
    }else if(Notification.permission==='denied'){
      status.textContent='BLOCKED';
      help.textContent='Notifications are blocked. Allow them in iPhone settings for Coach Bot.';
    }else if(Notification.permission==='granted'&&enabled){
      status.textContent='ON';
      help.textContent='Alerts are enabled. When your iPhone is locked, your paired Apple Watch may mirror them.';
    }else if(Notification.permission==='granted'){
      status.textContent='READY';
      help.textContent='Permission is granted. Tap Enable Alerts to turn station alerts on.';
    }else{
      status.textContent='OFF';
      help.textContent='Get a notification at station changes, water breaks and the end of practice.';
    }
    btn.textContent=enabled?'DISABLE ALERTS':'ENABLE ALERTS';
  }

  async function toggleAlerts(){
    if(!('Notification' in window)){updateUI();return;}
    if(enabled){
      enabled=false;
      localStorage.setItem('firefliesAlertsEnabled','false');
      updateUI();
      return;
    }
    let p=Notification.permission;
    if(p!=='granted')p=await Notification.requestPermission();
    if(p==='granted'){
      enabled=true;
      localStorage.setItem('firefliesAlertsEnabled','true');
      updateUI();
      notify('Fireflies Coach Bot','Alerts are ready.');
    }else updateUI();
  }

  function bodyForTitle(title){
    if(/water/i.test(title))return '💧 Water break — cool down and hydrate.';
    if(/station rotation/i.test(title))return '⚾ Station rotation starts — 7 minutes per station.';
    if(/defense/i.test(title))return '🧤 Team defense starts.';
    if(/relay/i.test(title))return '🏃 Home run relay starts.';
    if(/huddle/i.test(title))return '✨ Huddle time — finish together.';
    return title;
  }

  function observeTimer(){
    const titleEl=byId('segmentTitle'),timeEl=byId('segmentTime'),roundEl=byId('roundBadge');
    if(!titleEl||!timeEl)return;
    const check=()=>{
      const title=titleEl.textContent.trim();
      const time=timeEl.textContent.trim();
      const round=roundEl?roundEl.textContent.trim():'';
      if(lastTitle&&title!==lastTitle){
        notify('Fireflies — Next Up',bodyForTitle(title));
        warnedTitle='';
      }
      if(warn30&&time==='0:30'&&warnedTitle!==title){
        warnedTitle=title;
        notify('Fireflies — 30 Seconds',`Next change coming soon from ${title}.`);
      }
      if(round&&roundEl.style.display!=='none'&&lastRound&&round!==lastRound){
        notify(`Fireflies — ROTATE • ${round}`,'🔄 Rotate groups to the next station.');
      }
      lastTitle=title;
      if(round)lastRound=round;
    };
    check();
    new MutationObserver(check).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['style']});
  }

  window.addEventListener('DOMContentLoaded',()=>{
    updateUI();
    byId('enableAlerts')?.addEventListener('click',toggleAlerts);
    byId('testAlert')?.addEventListener('click',()=>notify('Fireflies Test Alert','If your iPhone is locked, this may mirror to your Apple Watch.'));
    byId('warn30')?.addEventListener('change',e=>{warn30=e.target.checked;localStorage.setItem('firefliesWarn30',String(warn30));});
    observeTimer();
  });
})();
