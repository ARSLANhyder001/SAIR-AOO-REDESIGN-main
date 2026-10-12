import React,{useState,useCallback} from 'react';
import {View,Text,FlatList,RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import StatusChip from '../components/StatusChip';
import {Empty,Loading} from '../components/ui';
import {supabase} from '../lib/supabase';
import {call,whatsapp,toWa} from '../lib/contact';
import {notify,confirm} from '../lib/dialog';
import {useApp} from '../store';
import {useC,type,fmt} from '../theme';
import {ago,OFFER_STATUS,offerState} from '../lib/stats';
import {daysLeft} from '../lib/plans';
import {success} from '../lib/haptics';
export default function AgentOffersScreen({navigation}){
 const C=useC(),{role,listings}=useApp(),[rows,setRows]=useState(null),[rf,setRf]=useState(false),[busy,setBusy]=useState(null);
 const load=useCallback(async()=>{const {data,error}=await supabase.rpc('agent_list_offers');
  if(error){setRows([]);return notify('Error',/function|schema cache/i.test(error.message)?`${error.message}\n\nRun migration_05_agents.sql in Supabase first.`:error.message)}
  setRows(data||[])},[]);
 useFocusEffect(useCallback(()=>{if(role==='agent')load()},[role,load]));
 const respond=(o,accept)=>confirm(accept?'Accept this offer?':'Reject this offer?',fmt(o.amount),async()=>{
  setBusy(o.id);const {data,error}=await supabase.rpc('agent_respond_offer',{p_offer:o.id,p_accept:accept,p_note:null});setBusy(null);
  if(error)return notify('Error',error.message);
  if(data!=='ok')return notify('Not allowed','This offer is no longer pending.');
  success();load()},accept?'Accept':'Reject');
 if(role!=='agent')return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}><Empty text="Approved agents only." icon="shield-lock-outline"/></SafeAreaView>;
 const render=({item:o})=>{const s=offerState(o),[l,c]=OFFER_STATUS[s]||OFFER_STATUS.pending,lst=listings.find(x=>x.id===o.listing_id),d=daysLeft(o.valid_until);return(
  <GlassCard r={18} padding={14} style={{marginBottom:10}}>
   <View style={{flexDirection:'row',justifyContent:'space-between',gap:8}}><View style={{flex:1}}><Text style={[type.h3,{color:C.red2}]}>{fmt(o.amount)}</Text>
    <Text style={[type.bodyB,{color:C.tx}]}>{o.buyer_name}</Text>
    <Text style={[type.small,{color:C.mute}]}>{o.contact_unlocked?o.buyer_phone+' · ':''}{ago(o.created_at)}</Text></View><StatusChip label={l} color={c}/></View>
   {!!lst&&<Text style={[type.smallB,{color:C.tx,marginTop:8}]} numberOfLines={1}>Property: {lst.title}</Text>}
   <View style={{marginTop:8,padding:10,borderRadius:12,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill,gap:2}}>
    <Text style={[type.smallB,{color:C.tx}]}>Advance {fmt(o.advance_amount)} · within {o.advance_due_days}d of acceptance</Text>
    <Text style={[type.smallB,{color:C.tx}]}>Final {fmt(o.final_amount)} · within {o.final_due_days}d</Text>
    <Text style={[type.caption,{color:C.mute}]}>{s==='pending'?`Valid ${d>0?`${d} more day${d===1?'':'s'}`:'until today'}`:`Valid until ${new Date(o.valid_until).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}`}</Text></View>
   {!!o.note&&<Text style={[type.small,{color:C.mute,marginTop:6}]}>{o.note}</Text>}
   {o.contact_unlocked
    ?<View style={{flexDirection:'row',gap:8,marginTop:12}}>
      <View style={{flex:1}}><GradientButton ghost icon="phone" title="Call" height={48} onPress={()=>call(o.buyer_phone)}/></View>
      <View style={{flex:1}}><GradientButton ghost icon="whatsapp" title="WhatsApp" height={48} onPress={()=>whatsapp(toWa(o.buyer_phone),`Assalam o Alaikum ${o.buyer_name}, regarding your offer on SAIR.`)}/></View></View>
    :<View style={{marginTop:12,gap:8}}>
      <View style={{flexDirection:'row',alignItems:'center',gap:6}}><Icon name="lock" size={14} color={C.gold}/><Text style={[type.caption,{color:C.mute,flex:1}]}>Buyer name and phone unlock with the Pro plan.</Text></View>
      <GradientButton ghost icon="crown-outline" title="Unlock with Pro" height={48} onPress={()=>navigation.navigate('Plans')}/></View>}
   {s==='pending'&&<View style={{flexDirection:'row',gap:8,marginTop:8}}>
    <View style={{flex:1}}><GradientButton icon="check" title="Accept" height={48} loading={busy===o.id} onPress={()=>respond(o,true)}/></View>
    <View style={{flex:1}}><GradientButton ghost icon="close" title="Reject" height={48} disabled={busy===o.id} onPress={()=>respond(o,false)}/></View></View>}
  </GlassCard>)};
 return(<SafeAreaView edges={[]} style={{flex:1,backgroundColor:C.bg}}>
  {rows===null?<View style={{padding:16}}><Loading/></View>
   :<FlatList data={rows} keyExtractor={o=>o.id} renderItem={render} contentContainerStyle={{padding:16,paddingBottom:90}} initialNumToRender={6} windowSize={7}
     refreshControl={<RefreshControl refreshing={rf} onRefresh={async()=>{setRf(true);await load();setRf(false)}} tintColor={C.crimson}/>}
     ListEmptyComponent={<Empty icon="flash-outline" text="No offers on your listings yet."/>}/>}
 </SafeAreaView>)}