import React,{useEffect,useState,memo} from 'react';
import {Text,View} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import GlassCard from './GlassCard';
import {useC,type} from '../theme';
// Count-up: tiny rAF ticker (3 cards only) – no extra dependency, easeOutCubic, respects `from`.
function useCountUp(to,from=0,ms=1400,delay=300){
 const [v,setV]=useState(to==null?null:from);
 useEffect(()=>{if(to==null)return;let raf,t0;const id=setTimeout(()=>{const step=t=>{t0=t0??t;const p=Math.min(1,(t-t0)/ms);setV(Math.round(from+(to-from)*(1-Math.pow(1-p,3))));if(p<1)raf=requestAnimationFrame(step)};raf=requestAnimationFrame(step)},delay);
  return()=>{clearTimeout(id);raf&&cancelAnimationFrame(raf)}},[to,from,ms,delay]);
 return v}
// value = number to count to (omit for a label-only stat), prefix/suffix wrap it, e.g. suffix "+".
function StatCard({value,from=0,prefix='',suffix='',icon,label,delay}){
 const C=useC(),n=useCountUp(value,from,1400,delay);
 return(<GlassCard r={16} style={{flex:1}} padding={14}>
  <View accessible accessibilityLabel={`${prefix}${value??''}${suffix} ${label}`}>
   {value!=null?<Text style={[type.h2,{color:C.tx}]}>{prefix}{n}{suffix}</Text>:<Icon name={icon||'shield-check'} size={28} color={C.gold}/>}
   <Text numberOfLines={2} style={[type.caption,{color:C.mute,marginTop:4}]}>{label}</Text></View></GlassCard>)}
export default memo(StatCard);
