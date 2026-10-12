// Last-n-months buckets from created_at → {counts:[…], labels:['May',…]}
const M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export function monthly(rows,n=6,key='created_at'){
 const now=new Date(),buckets=[];
 for(let i=n-1;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);buckets.push({y:d.getFullYear(),m:d.getMonth(),c:0})}
 (rows||[]).forEach(r=>{const d=new Date(r[key]);const b=buckets.find(k=>k.y===d.getFullYear()&&k.m===d.getMonth());if(b)b.c++});
 return {counts:buckets.map(b=>b.c),labels:buckets.map(b=>M[b.m]),total:buckets.reduce((a,b)=>a+b.c,0)}}
export const trend=c=>{const a=c[c.length-1]||0,b=c[c.length-2]||0;return b?Math.round((a-b)/b*100):a>0?100:0};
export const ago=t=>{const s=(Date.now()-new Date(t).getTime())/1000;if(s<60)return 'just now';if(s<3600)return `${Math.floor(s/60)}m ago`;if(s<86400)return `${Math.floor(s/3600)}h ago`;if(s<604800)return `${Math.floor(s/86400)}d ago`;return new Date(t).toLocaleDateString('en-GB',{day:'numeric',month:'short'})};
export const isOffer=i=>i.type==='offer'||/^OFFER:/.test(i.message||'');
export const offerAmount=i=>{const m=String(i.message||'').match(/OFFER:\s*PKR\s*([\d,]+)/i);return m?m[1]:null};
export const OFFER_STATUS={pending:['Pending','#F5B544'],new:['Pending','#F5B544'],accepted:['Accepted','#22C55E'],rejected:['Rejected','#EF4444'],expired:['Expired','#8B8B94'],withdrawn:['Withdrawn','#8B8B94'],disputed:['Disputed','#EF4444'],completed:['Completed','#22C55E']};
// An offer past its validity date shows as Expired even before the DB job runs.
export const offerState=o=>o.status==='pending'&&o.valid_until&&new Date(o.valid_until)<new Date()?'expired':o.status;
