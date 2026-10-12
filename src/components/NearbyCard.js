import React,{useEffect,useState,useCallback} from 'react';
import {View,Text,Pressable,ActivityIndicator} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import GlassCard from './GlassCard';
import {useC,type} from '../theme';
import {coordsOf} from '../lib/propertyMeta';
import {NEARBY_GROUPS,fetchNearby,fmtDist} from '../lib/nearby';
// "What's nearby" – real places within 2 km from OpenStreetMap (schools, hospitals, shops, mosques, parks, transport).
export default function NearbyCard({item}){
 const C=useC(),c=coordsOf(item),[st,setSt]=useState({loading:true}),[tab,setTab]=useState('education');
 const load=useCallback(()=>{if(!c)return;setSt({loading:true});fetchNearby(c.lat,c.lng).then(d=>setSt({d})).catch(()=>setSt({error:true}))},[c?.lat,c?.lng]);// eslint-disable-line
 useEffect(load,[load]);
 if(!c)return null;
 const list=(st.d?.[tab]||[]).slice(0,5);
 return(<GlassCard r={20} padding={16}>
  <Text accessibilityRole="header" style={[type.h3,{color:C.tx}]}>What's nearby</Text>
  <Text style={[type.caption,{color:C.mute,marginTop:2}]}>Within 2 km{c.approx?' of the city area (exact spot not set yet)':''}</Text>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:12}}>
   {NEARBY_GROUPS.map(([k,l,ic])=>{const a=tab===k,n=st.d?.[k]?.length;return(
    <Pressable key={k} onPress={()=>setTab(k)} accessibilityRole="button" accessibilityState={{selected:a}} style={{minHeight:44,flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:12,borderRadius:999,borderWidth:1,borderColor:a?C.crimson:C.glassBorder,backgroundColor:a?C.tint:C.glassFill}}>
     <Icon name={ic} size={18} color={a?C.red2:C.mute}/><Text style={[type.captionB,{color:a?C.red2:C.tx}]}>{l}{n!=null?` · ${n}`:''}</Text></Pressable>)})}</View>
  <View style={{marginTop:12,minHeight:60}}>
   {st.loading?<ActivityIndicator color={C.crimson} style={{marginTop:16}}/>
    :st.error?<Pressable onPress={load} accessibilityRole="button" style={{minHeight:48,justifyContent:'center'}}><Text style={[type.small,{color:C.mute}]}>Could not load nearby places. <Text style={{color:C.red2}}>Tap to retry</Text></Text></Pressable>
    :list.length?list.map((p,i)=><View key={i} style={{flexDirection:'row',justifyContent:'space-between',gap:10,paddingVertical:9,borderTopWidth:i?1:0,borderTopColor:C.line}}><Text numberOfLines={1} style={[type.small,{color:C.tx,flex:1}]}>{p.name}</Text><Text style={[type.smallB,{color:C.mute}]}>{fmtDist(p.d)}</Text></View>)
    :<Text style={[type.small,{color:C.mute,paddingTop:8}]}>Nothing mapped here yet.</Text>}</View>
  <Text style={[type.caption,{color:C.mute,marginTop:8}]}>Map data © OpenStreetMap contributors</Text></GlassCard>)}
