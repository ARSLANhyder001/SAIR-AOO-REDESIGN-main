import React,{createContext,useContext,useEffect,useMemo,useState,useCallback} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {IMAGE_TRANSFORMS} from '../config';

/* ───────── Tokens ───────── */
export const spacing={xs:4,sm:8,md:12,lg:16,xl:24,xxl:32};
export const radius={card:16,hero:24,pill:999};
export const fontSize={h1:32,h2:24,h3:20,body:16,small:14,caption:12};
// Plus Jakarta Sans (loaded in App.js). Falls back to system font until loaded.
export const font={bold:'PlusJakartaSans_700Bold',semi:'PlusJakartaSans_600SemiBold',reg:'PlusJakartaSans_400Regular'};
export const type={
 h1:{fontFamily:font.bold,fontSize:32,lineHeight:40},
 h2:{fontFamily:font.bold,fontSize:24,lineHeight:32},
 h3:{fontFamily:font.semi,fontSize:20,lineHeight:28},
 body:{fontFamily:font.reg,fontSize:16,lineHeight:24},
 bodyB:{fontFamily:font.semi,fontSize:16,lineHeight:24},
 small:{fontFamily:font.reg,fontSize:14,lineHeight:20},
 smallB:{fontFamily:font.semi,fontSize:14,lineHeight:20},
 caption:{fontFamily:font.reg,fontSize:12,lineHeight:16},
 captionB:{fontFamily:font.semi,fontSize:12,lineHeight:16}};

const BRAND={crimson:'#E11D2E',deep:'#8B0E1A',black:'#0A0A0B',charcoal:'#141416',gold:'#F5B544',success:'#22C55E'};

/* ───────── Palettes ─────────
   New names (glassFill, glassBorder, …) + legacy names (bg, card, line, red, red2, tx, mute, soft, skel, tint …)
   so Login / Detail / List / Admin screens keep working untouched until we restyle them. */
const DARK={dark:true,...BRAND,
 bg:'#0A0A0B',card:'#141416',text:'#FFFFFF',muted:'#A1A1AA',
 glassFill:'rgba(255,255,255,0.08)',glassBorder:'rgba(255,255,255,0.18)',
 line:'rgba(255,255,255,0.14)',red:'#E11D2E',red2:'#FF4D5C',tx:'#FFFFFF',mute:'#A1A1AA',soft:'rgba(255,255,255,0.07)',skel:'#1E1E22',tint:'rgba(225,29,46,0.16)',mint:'#FF4D5C',
 tabBg:'rgba(20,20,22,0.92)',hero:['#0A0A0B','#3A0A10','#8B0E1A'],glass:['rgba(255,255,255,0.12)','rgba(20,20,22,0.9)'],tileG:['rgba(255,255,255,0.10)','rgba(20,20,22,0.9)'],
 btnG:['#F03A4A','#B3121F'],mark:['#FFFFFF','#A1A1AA'],scrim:'rgba(0,0,0,0.6)',blurTint:'dark',
 shadow:{shadowColor:'#000',shadowOpacity:0.35,shadowRadius:14,shadowOffset:{width:0,height:6},elevation:6},
 glow:{shadowColor:'#E11D2E',shadowOpacity:0.55,shadowRadius:16,shadowOffset:{width:0,height:4},elevation:10}};

const LIGHT={dark:false,...BRAND,
 bg:'#F7F7F8',card:'#FFFFFF',text:'#0A0A0B',muted:'#5B5B63',
 glassFill:'rgba(255,255,255,0.65)',glassBorder:'rgba(10,10,11,0.08)',
 line:'rgba(10,10,11,0.10)',red:'#E11D2E',red2:'#C8101F',tx:'#0A0A0B',mute:'#5B5B63',soft:'#F0F0F2',skel:'#E8E8EC',tint:'rgba(225,29,46,0.10)',mint:'#C8101F',
 tabBg:'rgba(255,255,255,0.92)',hero:['#F7F7F8','#FDE8EA','#F7C9CE'],glass:['rgba(255,255,255,0.9)','rgba(255,255,255,0.7)'],tileG:['#FFFFFF','#FBEFF0'],
 btnG:['#F03A4A','#C8101F'],mark:['#0A0A0B','#5B5B63'],scrim:'rgba(10,10,11,0.6)',blurTint:'light',
 shadow:{shadowColor:'#0A0A0B',shadowOpacity:0.10,shadowRadius:14,shadowOffset:{width:0,height:6},elevation:3},
 glow:{shadowColor:'#E11D2E',shadowOpacity:0.35,shadowRadius:14,shadowOffset:{width:0,height:5},elevation:6}};

export const C=LIGHT; // legacy import; prefer useC()

/* ───────── ThemeProvider (system + manual toggle, persisted) ───────── */
const Ctx=createContext({C:DARK,dark:true,mode:'system',setMode:()=>{},toggle:()=>{}});
export function ThemeProvider({children}){
 const sys=useColorScheme(),[mode,setM]=useState('system');
 useEffect(()=>{AsyncStorage.getItem('theme:v2').then(v=>{if(v==='light'||v==='dark'||v==='system')setM(v)}).catch(()=>{})},[]);
 const setMode=useCallback(m=>{setM(m);AsyncStorage.setItem('theme:v2',m).catch(()=>{})},[]);
 const dark=mode==='system'?sys!=='light':mode==='dark';
 const toggle=useCallback(()=>setMode(dark?'light':'dark'),[dark,setMode]);
 const value=useMemo(()=>({C:dark?DARK:LIGHT,dark,mode,setMode,toggle}),[dark,mode,setMode,toggle]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>}
export const useTheme=()=>useContext(Ctx);
export const useC=()=>useContext(Ctx).C;

/* ───────── Helpers (unchanged behaviour) ───────── */
export const fmt=p=>p?`PKR ${Number(p).toLocaleString('en-PK')}`:'';
// Pakistani style: 2.5 Crore / 85 Lakh (cards), full number on the detail page.
export const fmtShort=p=>{const n=Number(p);if(!n)return '';
 if(n>=1e7)return `PKR ${+(n/1e7).toFixed(2)} Crore`;if(n>=1e5)return `PKR ${+(n/1e5).toFixed(2)} Lakh`;return fmt(n)};
export const AREA={marla:'Marla',kanal:'Kanal',sqft:'sq ft',sqyd:'sq yd'};
export const priceText=(x,short)=>{const n=Number(x?.price);if(!n)return '';const p=short?fmtShort(n):fmt(n);return x.purpose==='rent'?`${p}/mo`:p};
export const facts=x=>[x?.bedrooms!=null&&`${x.bedrooms} bed`,x?.bathrooms!=null&&`${x.bathrooms} bath`,x?.area_size&&`${+x.area_size} ${AREA[x.area_unit]||''}`.trim()].filter(Boolean);
export const cover=x=>x?.images?.[0]||x?.image_url||null;
export const isNew=x=>!!x?.created_at&&Date.now()-new Date(x.created_at).getTime()<7*864e5;
export const sized=(u,w)=>IMAGE_TRANSFORMS&&u?.includes('/storage/v1/object/public/')
 ?`${u.replace('/object/public/','/render/image/public/')}?width=${w}&quality=70`:u;
// Agent is shown by ID only. Derived from the listing id (no data-model change): "SAIR-A4F2".
export const agentId=x=>`SAIR-${String(x?.id||'').replace(/[^a-zA-Z0-9]/g,'').slice(-4).toUpperCase()||'0000'}`;
