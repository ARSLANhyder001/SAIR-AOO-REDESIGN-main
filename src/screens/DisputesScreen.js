import React,{useState,useCallback} from 'react';
import {View,Text,FlatList,RefreshControl,TextInput} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import MultiChips from '../components/MultiChips';
import StatusChip from '../components/StatusChip';
import {Empty} from '../components/ui';
import {supabase} from '../lib/supabase';
import {call,whatsapp,toWa} from '../lib/contact';
import {notify} from '../lib/dialog';
import {useApp} from '../store';
import {useC,type,fmt} from '../theme';
import {ago} from '../lib/stats';
const ST={open:['Open','#EF4444'],in_review:['In review','#F5B544'],resolved:['Resolved','#22C55E']};
export default function DisputesScreen(){
 const C=useC(),{role,listings}=useApp(),[rows,setRows]=useState(null),[offers,setOffers]=useState({}),[f,setF]=useState('open'),[rf,setRf]=useState(false),[note,setNote]=useState({});
 const load=useCallback(async()=>{const {data}=await supabase.from('disputes').select('*').order('created_at',{ascending:false});const ids=[...new Set((data||[]).map(d=>d.offer_id))];
  if(ids.length){const {data:o}=await supabase.from('offers').select('*').in('id',ids);setOffers(Object.fromEntries((o||[]).map(x=>[x.id,x])))}setRows(data||[])},[]);
 useFocusEffect(useCallback(()=>{if(role==='admin')load()},[role,load]));
 const upd=async(d,status)=>{const {error}=await supabase.from('disputes').update({status,admin_note:note[d.id]??d.admin_note,resolved_at:status==='resolved'?new Date().toISOString():null}).eq('id',d.id);if(error)return notify('Error',error.message);
  if(status==='resolved')await supabase.from('offers').update({status:'accepted'}).eq('id',d.offer_id).eq('status','disputed');load()};
 if(role!=='admin')return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}><Empty text="Admins only." icon="shield-lock-outline"/></SafeAreaView>;
 const list=(rows||[]).filter(d=>f==='all'||d.status===f);
 const render=({item:d})=>{const o=offers[d.offer_id],[l,c]=ST[d.status]||ST.open,lst=listings.find(x=>x.id===o?.listing_id);return(
  <GlassCard r={18} padding={14} style={{marginBottom:10}}>
   <View style={{flexDirection:'row',justifyContent:'space-between',gap:8}}><View style={{flex:1}}><Text style={[type.bodyB,{color:C.tx}]}>{d.reason}</Text><Text style={[type.caption,{color:C.mute}]}>{ago(d.created_at)}</Text></View><StatusChip label={l} color={c}/></View>
   {!!d.details&&<Text style={[type.small,{color:C.mute,marginTop:6}]}>{d.details}</Text>}
   {o&&<View style={{marginTop:8,gap:2}}><Text style={[type.smallB,{color:C.tx}]}>{o.name} · {o.phone}</Text><Text style={[type.small,{color:C.mute}]}>Offer {fmt(o.amount)} on {lst?.title||'listing'}</Text>
    <Text style={[type.caption,{color:C.mute}]}>Advance {fmt(o.advance_amount)} ({o.advance_due_days}d) · Final {fmt(o.final_amount)} ({o.final_due_days}d)</Text></View>}
   <TextInput accessibilityLabel="Admin note" value={note[d.id]??d.admin_note??''} onChangeText={t=>setNote(p=>({...p,[d.id]:t}))} placeholder="Admin note" placeholderTextColor={C.mute} style={[type.small,{color:C.tx,marginTop:10,minHeight:48,borderRadius:14,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill,paddingHorizontal:12}]}/>
   <View style={{flexDirection:'row',gap:8,marginTop:10}}>
    {o&&<View style={{flex:1}}><GradientButton ghost icon="phone" title="Call" height={48} onPress={()=>call(o.phone)}/></View>}
    {o&&<View style={{flex:1}}><GradientButton ghost icon="whatsapp" title="WhatsApp" height={48} onPress={()=>whatsapp(toWa(o.phone),'Assalam o Alaikum, this is SAIR regarding your dispute.')}/></View>}</View>
   <View style={{flexDirection:'row',gap:8,marginTop:8}}>
    <View style={{flex:1}}><GradientButton ghost title="In review" height={48} onPress={()=>upd(d,'in_review')}/></View><View style={{flex:1}}><GradientButton title="Resolve" height={48} onPress={()=>upd(d,'resolved')}/></View></View></GlassCard>)};
 return(<SafeAreaView edges={[]} style={{flex:1,backgroundColor:C.bg}}>
  <View style={{padding:16}}><MultiChips options={[['open','Open'],['in_review','In review'],['resolved','Resolved'],['all','All']]} value={f} onChange={setF}/></View>
  <FlatList data={list} keyExtractor={d=>d.id} renderItem={render} contentContainerStyle={{padding:16,paddingTop:0,paddingBottom:40}}
   refreshControl={<RefreshControl refreshing={rf} onRefresh={async()=>{setRf(true);await load();setRf(false)}} tintColor={C.crimson}/>} ListEmptyComponent={<Empty icon="gavel" text="No disputes here."/>}/></SafeAreaView>)}
