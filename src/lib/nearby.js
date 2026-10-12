// Real nearby places from OpenStreetMap (Overpass API) – free, no key. Cached per location for the session.
export const NEARBY_GROUPS=[
 ['education','Schools','school-outline'],['health','Healthcare','hospital-box-outline'],['shopping','Shopping','storefront-outline'],
 ['worship','Mosques','mosque'],['parks','Parks','tree-outline'],['transport','Transport','bus-stop']];
const R=2000,cache=new Map();
const q=(lat,lng)=>`[out:json][timeout:15];(
nwr(around:${R},${lat},${lng})[amenity~"^(school|college|university|kindergarten)$"];
nwr(around:${R},${lat},${lng})[amenity~"^(hospital|clinic|doctors|pharmacy)$"];
nwr(around:${R},${lat},${lng})[shop~"^(supermarket|mall|convenience|department_store)$"];
nwr(around:${R},${lat},${lng})[amenity=marketplace];
nwr(around:${R},${lat},${lng})[amenity=place_of_worship];
nwr(around:${R},${lat},${lng})[leisure~"^(park|playground|garden)$"];
nwr(around:${R},${lat},${lng})[highway=bus_stop];nwr(around:${R},${lat},${lng})[amenity=fuel];nwr(around:${R},${lat},${lng})[railway=station];
);out center 120;`;
const dist=(a,b,c,d)=>{const t=Math.PI/180,x=(c-a)*t,y=(d-b)*t,s=Math.sin(x/2)**2+Math.cos(a*t)*Math.cos(c*t)*Math.sin(y/2)**2;return 12742000*Math.asin(Math.sqrt(s))};
const groupOf=t=>{const a=t.amenity,s=t.shop;
 if(/^(school|college|university|kindergarten)$/.test(a))return 'education';
 if(/^(hospital|clinic|doctors|pharmacy)$/.test(a))return 'health';
 if(s||a==='marketplace')return 'shopping';
 if(a==='place_of_worship')return (t.religion&&t.religion!=='muslim')?null:'worship';
 if(t.leisure)return 'parks';
 if(t.highway==='bus_stop'||a==='fuel'||t.railway==='station')return 'transport';return null};
export const fmtDist=m=>m<1000?`${Math.round(m/10)*10} m`:`${(m/1000).toFixed(1)} km`;
export async function fetchNearby(lat,lng){
 const key=`${lat.toFixed(3)},${lng.toFixed(3)}`;if(cache.has(key))return cache.get(key);
 const ac=new AbortController(),to=setTimeout(()=>ac.abort(),14000);
 try{
  const res=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:'data='+encodeURIComponent(q(lat,lng)),headers:{'Content-Type':'application/x-www-form-urlencoded'},signal:ac.signal});
  if(!res.ok)throw new Error('http '+res.status);
  const j=await res.json(),out={};NEARBY_GROUPS.forEach(([k])=>out[k]=[]);const seen=new Set();
  for(const e of j.elements||[]){const t=e.tags||{},g=groupOf(t),la=e.lat??e.center?.lat,lo=e.lon??e.center?.lon;if(!g||la==null)continue;
   const name=t.name||t['name:en']||(g==='transport'?(t.amenity==='fuel'?'Fuel station':'Bus stop'):g==='parks'?'Park':g==='worship'?'Mosque':null);if(!name)continue;
   const id=g+name+la.toFixed(4);if(seen.has(id))continue;seen.add(id);out[g].push({name,d:dist(lat,lng,la,lo)})}
  Object.values(out).forEach(a=>a.sort((x,y)=>x.d-y.d));cache.set(key,out);return out}
 finally{clearTimeout(to)}}
