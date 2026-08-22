(()=>{
  const roster=['Ariel','Benjamin','Emerson','Hudson','Thomas','Magnolia','Dylan','Everett','Oaklee','Matthew'];
  const coaches=['Justin','Matt','Vincent','Josh'];
  const seedVersion='fireflies-team-seed-2026-08-22-v2';

  if(localStorage.getItem('firefliesTeamSeedVersion')!==seedVersion){
    localStorage.setItem('firefliesRoster',JSON.stringify(roster));
    localStorage.setItem('firefliesCoaches',JSON.stringify(coaches));
    localStorage.setItem('firefliesGroups',JSON.stringify(roster));
    localStorage.setItem('firefliesTeamSeedVersion',seedVersion);
  }

  // Today's practice is a normal-weather 5v5 scrimmage.
  localStorage.setItem('firefliesHeatMode','false');

  // Compatibility for the existing roster editor.
  if(!document.getElementById('bulkRoster')){
    const t=document.createElement('textarea');
    t.id='bulkRoster';
    t.hidden=true;
    document.body.appendChild(t);
  }
  if(!document.getElementById('importRoster')){
    const b=document.createElement('button');
    b.id='importRoster';
    b.type='button';
    b.hidden=true;
    document.body.appendChild(b);
  }
})();
