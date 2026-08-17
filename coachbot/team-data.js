(()=>{
  const seedVersion='fireflies-team-seed-2026-08-17-v1';
  if(localStorage.getItem('firefliesTeamSeedVersion')===seedVersion)return;

  const roster=['Ariel','Benjamin','Emerson','Hudson','Thomas','Magnolia','Dylan','Everett','Oaklee','Matthew'];
  const coaches=['Justin','Matt','Vincent','Josh'];

  localStorage.setItem('firefliesRoster',JSON.stringify(roster));
  localStorage.setItem('firefliesCoaches',JSON.stringify(coaches));
  localStorage.setItem('firefliesGroups',JSON.stringify(roster));
  localStorage.setItem('firefliesTeamSeedVersion',seedVersion);
})();
