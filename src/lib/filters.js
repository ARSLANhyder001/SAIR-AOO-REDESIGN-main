import {propType,propCategory,areaMarla} from './propertyMeta';
export const DEFAULT_FILTERS={type:'all',purpose:'all',kind:'all',city:'all',bed:'any',bath:'any',min:'',max:'',amin:'',amax:'',feats:[],sort:'new'};
export const buildIndex=list=>list.map(x=>({x,h:`${x.title} ${x.subtitle||''} ${x.city||''} ${x.address||''} ${x.description||''}`.toLowerCase()}));
const typeOk=(x,t)=>t==='all'||(t==='residential'||t==='commercial'||t==='agricultural'?propCategory(x)===t:propType(x)===t);
export function runFilter(index,f,txt=''){
 const lo=f.min?Number(f.min):0,hi=f.max?Number(f.max):null,alo=f.amin?Number(f.amin):0,ahi=f.amax?Number(f.amax):null;
 const r=index.filter(({x,h})=>{
  if(!typeOk(x,f.type))return false;
  if(f.kind!=='all'&&x.kind!==f.kind)return false;
  if(f.purpose!=='all'&&(x.purpose||'sale')!==f.purpose)return false;
  if(f.city!=='all'&&x.city!==f.city)return false;
  if(f.bed!=='any'&&!(f.bed==='5'?x.bedrooms>=5:x.bedrooms===Number(f.bed)))return false;
  if(f.bath!=='any'&&!(f.bath==='4'?x.bathrooms>=4:x.bathrooms===Number(f.bath)))return false;
  if(Number(x.price||0)<lo||(hi!=null&&(x.price==null||Number(x.price)>hi)))return false;
  if(alo||ahi!=null){const a=areaMarla(x);if(a==null||a<alo||(ahi!=null&&a>ahi))return false}
  if(f.feats.length&&!f.feats.every(k=>(x.features||[]).includes(k)))return false;
  return h.includes(txt)}).map(o=>o.x);
 if(f.sort==='low')r.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));
 if(f.sort==='high')r.sort((a,b)=>(b.price??-1)-(a.price??-1));
 return r}
export const activeCount=f=>[f.kind!=='all',f.city!=='all',f.bed!=='any',f.bath!=='any',!!f.min,!!f.max,!!f.amin,!!f.amax,f.feats.length>0,f.sort!=='new'].filter(Boolean).length;
