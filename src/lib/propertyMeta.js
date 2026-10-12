import {AREA} from '../theme';
// Quick-filter pills (exactly the types asked for). id → label.
export const TYPE_PILLS=[['all','All'],['residential','Residential'],['commercial','Commercial'],['plot','Plot'],['flat','Flat'],['house','House'],['farm_house','Farm House'],['agri_land','Agriculture Land'],['office','Office Space']];
export const CATEGORY_OPTS=[['residential','Residential'],['commercial','Commercial'],['agricultural','Agricultural']];
export const TYPE_OPTS=[['house','House'],['flat','Flat'],['plot','Plot'],['farm_house','Farm House'],['agri_land','Agriculture Land'],['office','Office Space']];
export const TYPE_LABEL=Object.fromEntries(TYPE_OPTS),CAT_LABEL=Object.fromEntries(CATEGORY_OPTS);
export const TYPE_ICON={house:'home-outline',flat:'office-building-outline',plot:'texture-box',farm_house:'barn',agri_land:'sprout-outline',office:'domain'};
export const FEATURES=['Parking','Furnished','Corner','Gas','Electricity','Water Supply','Boundary Wall','Security','Lift','Garden','Solar','Servant Quarter'];
export const TYPE_DEFAULT_CAT={house:'residential',flat:'residential',plot:'residential',farm_house:'agricultural',agri_land:'agricultural',office:'commercial'};

// Works before the SQL migration too: guesses from the title/subtitle/description when property_type is empty.
const GUESS=[['farm_house',/farm\s*-?house/i],['agri_land',/agri|acre|farm\s*land|zarai/i],['office',/office/i],['flat',/\bflats?\b|apartment|\bapt\b/i],['plot',/\bplots?\b|\bland\b/i],['house',/house|villa|bungalow|kothi|\bhome\b/i]];
export function propType(x){
 if(!x||x.kind==='project')return null;
 if(x.property_type)return x.property_type;
 const t=`${x.title||''} ${x.subtitle||''} ${x.description||''}`;
 for(const [k,re] of GUESS)if(re.test(t))return k;
 return x.bedrooms>0?'house':null}
export function propCategory(x){
 if(!x||x.kind==='project')return null;
 if(x.category)return x.category;
 const t=propType(x);
 if(t)return TYPE_DEFAULT_CAT[t];
 return /commercial|shop|plaza|showroom|warehouse|building/i.test(`${x.title||''} ${x.subtitle||''}`)?'commercial':null}

export const MARLA={marla:1,kanal:20,sqft:1/272.25,sqyd:9/272.25};
export const areaMarla=x=>x?.area_size?+x.area_size*(MARLA[x.area_unit]||1):null;

// City-centre fallback so the map is useful before exact coordinates are entered (marked "approximate").
const CITY={hyderabad:[25.396,68.3578],karachi:[24.8607,67.0011],lahore:[31.5204,74.3587],islamabad:[33.6844,73.0479],rawalpindi:[33.5651,73.0169],jamshoro:[25.43,68.28],sukkur:[27.7052,68.8574],larkana:[27.557,68.2141],multan:[30.1575,71.5249],faisalabad:[31.4504,73.135],peshawar:[34.0151,71.5249],quetta:[30.1798,66.975],nawabshah:[26.2483,68.4096],mirpurkhas:[25.5276,69.0125],tando:[25.4283,68.5367],kotri:[25.3657,68.3085]};
const hash=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)};
export function coordsOf(x){
 if(x?.lat!=null&&x?.lng!=null&&!isNaN(+x.lat)&&!isNaN(+x.lng))return {lat:+x.lat,lng:+x.lng,approx:false};
 const c=CITY[String(x?.city||'').toLowerCase().trim().split(/[\s,]/)[0]];if(!c)return null;
 const h=hash(String(x.id||x.title||''));
 return {lat:c[0]+((h%1000)/1000-0.5)*0.05,lng:c[1]+(((h>>10)%1000)/1000-0.5)*0.05,approx:true}}
// Accepts "24.8607, 67.0011" (copied from Google Maps) → {lat,lng}
export const parseCoords=s=>{const m=String(s||'').match(/(-?\d{1,3}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)/);if(!m)return null;const lat=+m[1],lng=+m[2];return Math.abs(lat)<=90&&Math.abs(lng)<=180?{lat,lng}:null};
export const compactPrice=x=>{const n=Number(x?.price);if(!n)return '•';return n>=1e7?`${+(n/1e7).toFixed(2)}Cr`:n>=1e5?`${+(n/1e5).toFixed(1)}L`:`${Math.round(n/1e3)}k`};
export const areaText=x=>x?.area_size?`${+x.area_size} ${AREA[x.area_unit]||''}`.trim():null;
