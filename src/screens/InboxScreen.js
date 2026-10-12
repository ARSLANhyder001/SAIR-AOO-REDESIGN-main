import React,{useState,useCallback,useMemo,useEffect} from 'react';
import {View,Text,FlatList,RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import MultiChips from '../components/MultiChips';
import StatusChip from '../components/StatusChip';
import {Skeleton} from '../components/Skeleton';
import {Empty} from '../components/ui';
import {supabase} from '../lib/supabase';
import {call,whatsapp,toWa} from '../lib/contact';
import {notify,confirm} from '../lib/dialog';
import {useApp} from '../store';
import {useC,type,fmt} from '../theme';
import {ago,OFFER_STATUS,offerState} from '../lib/stats';
import {daysLeft} from '../lib/plans';
import {success} from '../lib/haptics';
const MSG_STATUS={new:['New','#F5B544'],contacted:['Contacted','#22C55E'],closed:['Closed','#8B8B94']};
const OFFER_FILTERS=[['all','All'],['pending','Pending'],['accepted','Accepted'],['rejected','Rejected'],['expired','Expired'],['disputed','Disputed']];

export default function InboxScreen({route}){
 const C=useC(),{role,listings}=useApp(),[tab,setTab]=useState(route.params?.tab||'offers'),[st,setSt]=useState('all'),[offers,setOffers]=useState(null),[msgs,setMsgs]=useState([]),[rf,setRf]=useState(false);
 useEffect(()=>{if(route.params?.tab){setTab(route.params.tab);setSt('all')}},[route.params?.tab]);
 const load=useCallback(async()=>{
  const [o,m]=await Promise.all([supabase.from('offers').select('*').order('created_at',{ascending:false}).limit(200),supabase.from('inquiries').select('*').order('created_at',{ascending:false}).limit(200)]);
  setOffers(o.data||[]);setMsgs(m.data||[])},[]);
 useFocusEffect(useCallback(()=>{if(role==='admin')load()},[role,load]));
 const isOffers=tab==='offers',base=isOffers?offers||[]:msgs;
 const list=useMemo(()=>base.filter(i=>st==='all'||(isOffers?offerState(i):i.status)===st),[base,st,isOffers]);
 const setStatus=async(table,i,status,extra={})=>{const {error}=await supabase.from(table).update({status,...extra}).eq('id',i.id);if(error)return notify('Error',error.message);success();load()};
 const del=(table,i)=>confirm('Delete?',i.name,async()=>{const {error}=await supabase.from(table).delete().eq('id',i.id);error?notify('Error',error.message):load()});
 if(role!=='admin')return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}><Empty text="Admins only." icon="shield-lock-outline"/></SafeAreaView>;
 const renderOffer=o=>{const s=offerState(o),[l,c]=OFFER_STATUS[s]||OFFER_STATUS.pending,lst=listings.find(x=>x.id===o.listing_id),d=daysLeft(o.valid_until);return(
  <GlassCard r={18} padding={14} style={{marginBottom:10}}>
   <View style={{flexDirection:'row',justifyContent:'space-between',gap:8}}><View style={{flex:1}}><Text style={[type.h3,{color:C.red2}]}>{fmt(o.amount)}</Text>
    <Text style={[type.bodyB,{color:C.tx}]}>{o.name} <Text style={[type.caption,{color:C.mute}]}>({o.buyer_role})</Text></Text>
    <Text style={[type.small,{color:C.mute}]}>{o.phone} · {ago(o.created_at)}</Text></View><StatusChip label={l} color={c}/></View>
   {!!lst&&<Text style={[type.smallB,{color:C.tx,marginTop:8}]} numberOfLines={1}>Property: {lst.title}</Text>}
   <View style={{marginTop:8,padding:10,borderRadius:12,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill,gap:2}}>
    <Text style={[type.smallB,{color:C.tx}]}>Advance {fmt(o.advance_amount)} · within {o.advance_due_days}d of acceptance</Text>
    <Text style={[type.smallB,{color:C.tx}]}>Final {fmt(o.final_amount)} · within {o.final_due_days}d</Text>
    <Text style={[type.caption,{color:C.mute}]}>{s==='pending'?`Valid ${d>0?`${d} more day${d===1?'':'s'}`:'until today'}`:`Valid until ${new Date(o.valid_until).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}`} · terms {o.terms_version} accepted</Text></View>
   {!!o.note&&<Text style={[type.small,{color:C.mute,marginTop:6}]}>{o.note}</Text>}
   <View style={{flexDirection:'row',gap:8,marginTop:12}}>
    <View style={{flex:1}}><GradientButton ghost icon="phone" title="Call" height={48} onPress={()=>call(o.phone)}/></View>
    <View style={{flex:1}}><GradientButton ghost icon="whatsapp" title="WhatsApp" height={48} onPress={()=>whatsapp(toWa(o.phone),`Assalam o Alaikum ${o.name}, this is SAIR regarding your offer.`)}/></View></View>
   <View style={{flexDirection:'row',gap:8,marginTop:8}}>
    <View style={{flex:1}}><GradientButton icon="check" title="Accept" height={48} disabled={s!=='pending'} onPress={()=>setStatus('offers',o,'accepted',{accepted_at:new Date().toISOString()})}/></View>
    <View style={{flex:1}}><GradientButton ghost icon="close" title="Reject" height={48} disabled={s!=='pending'} onPress={()=>setStatus('offers',o,'rejected')}/></View>
    {s==='accepted'&&<View style={{flex:1}}><GradientButton ghost icon="flag-checkered" title="Closed" height={48} onPress={()=>setStatus('offers',o,'completed')}/></View>}
    <View style={{width:48}}><GradientButton ghost icon="delete-outline" title="" height={48} onPress={()=>del('offers',o)}/></View></View></GlassCard>)};
 const renderMsg=i=>{const [l,c]=MSG_STATUS[i.status]||MSG_STATUS.new;return(
  <GlassCard r={18} padding={14} style={{marginBottom:10}}>
   <View style={{flexDirection:'row',justifyContent:'space-between',gap:8}}><View style={{flex:1}}><Text style={[type.bodyB,{color:C.tx}]}>{i.name}</Text><Text style={[type.small,{color:C.mute}]}>{i.phone}{i.area?` · ${i.area}`:''} · {ago(i.created_at)} · {i.type}</Text></View><StatusChip label={l} color={c}/></View>
   {!!i.message&&<Text style={[type.small,{color:C.mute,marginTop:6}]}>{i.message}</Text>}
   <View style={{flexDirection:'row',gap:8,marginTop:12}}><View style={{flex:1}}><GradientButton ghost icon="phone" title="Call" height={48} onPress={()=>call(i.phone)}/></View><View style={{flex:1}}><GradientButton ghost icon="whatsapp" title="WhatsApp" height={48} onPress={()=>whatsapp(toWa(i.phone),`Assalam o Alaikum ${i.name}, this is SAIR.`)}/></View></View>
   <View style={{flexDirection:'row',gap:8,marginTop:8}}><View style={{flex:1}}><GradientButton ghost title="Contacted" height={48} onPress={()=>setStatus('inquiries',i,'contacted')}/></View><View style={{flex:1}}><GradientButton ghost title="Closed" height={48} onPress={()=>setStatus('inquiries',i,'closed')}/></View>
    <View style={{width:48}}><GradientButton ghost icon="delete-outline" title="" height={48} onPress={()=>del('inquiries',i)}/></View></View></GlassCard>)};
 return(<SafeAreaView edges={[]} style={{flex:1,backgroundColor:C.bg}}>
  <View style={{padding:16,gap:12}}><MultiChips options={[['offers','Offers'],['messages','Messages']]} value={tab} onChange={v=>{setTab(v);setSt('all')}}/>
   <MultiChips options={isOffers?OFFER_FILTERS:[['all','All'],['new','New'],['contacted','Contacted'],['closed','Closed']]} value={st} onChange={setSt}/></View>
  <FlatList data={offers?list:[]} keyExtractor={i=>String(i.id)} renderItem={({item})=>isOffers?renderOffer(item):renderMsg(item)} contentContainerStyle={{padding:16,paddingTop:0,paddingBottom:40}} initialNumToRender={5} windowSize={7}
   refreshControl={<RefreshControl refreshing={rf} onRefresh={async()=>{setRf(true);await load();setRf(false)}} tintColor={C.crimson}/>}
   ListEmptyComponent={!offers?<><Skeleton style={{height:180,marginBottom:10}} r={18}/><Skeleton style={{height:180}} r={18}/></>:<Empty icon={isOffers?'flash-outline':'message-outline'} text={isOffers?'No offers here yet.':'No messages here.'}/>}/></SafeAreaView>)}
