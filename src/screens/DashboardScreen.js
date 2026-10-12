import React,{useState,useCallback,useMemo} from 'react';
import {View,Text,Pressable,ScrollView,RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import Animated,{FadeInDown} from 'react-native-reanimated';
import GlassCard from '../components/GlassCard';
import SectionHeader from '../components/SectionHeader';
import StatusChip from '../components/StatusChip';
import {Sparkline,BarChart} from '../components/Charts';
import {Skeleton} from '../components/Skeleton';
import {Empty} from '../components/ui';
import {supabase} from '../lib/supabase';
import {useApp} from '../store';
import {useC,type} from '../theme';
import {monthly,trend,ago,OFFER_STATUS,offerState} from '../lib/stats';
import {fmt} from '../theme';
import {daysLeft} from '../lib/plans';
import {tap} from '../lib/haptics';

const Trend=({v})=>{const C=useC(),up=v>=0;return <View style={{flexDirection:'row',alignItems:'center',backgroundColor:(up?C.success:'#EF4444')+'22',borderRadius:999,paddingHorizontal:7,paddingVertical:2}}><Icon name={up?'trending-up':'trending-down'} size={13} color={up?C.success:'#EF4444'}/><Text style={[type.captionB,{color:up?C.success:'#EF4444',marginLeft:3}]}>{up?'+':''}{v}%</Text></View>};
const Stat=({label,value,series,icon,i})=>{const C=useC();return(
 <Animated.View entering={FadeInDown.delay(i*70).duration(450)} style={{width:'48.5%'}}>
  <GlassCard r={18} padding={14}><View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}><View style={{width:34,height:34,borderRadius:17,backgroundColor:C.tint,alignItems:'center',justifyContent:'center'}}><Icon name={icon} size={18} color={C.crimson}/></View><Trend v={trend(series)}/></View>
   <Text style={[type.h2,{color:C.tx,marginTop:10}]}>{value}</Text><Text style={[type.caption,{color:C.mute}]}>{label}</Text>
   <View style={{marginTop:6}}><Sparkline data={series}/></View></GlassCard></Animated.View>)};

export default function DashboardScreen({navigation}){
 const C=useC(),{role,listings,reload}=useApp(),[inq,setInq]=useState(null),[offersRaw,setOffersRaw]=useState([]),[disputes,setDisputes]=useState([]),[rf,setRf]=useState(false);
 const load=useCallback(async()=>{const [i,o,d]=await Promise.all([supabase.from('inquiries').select('*').order('created_at',{ascending:false}).limit(300),supabase.from('offers').select('*').order('created_at',{ascending:false}).limit(300),supabase.from('disputes').select('id,status').eq('status','open')]);setInq(i.data||[]);setOffersRaw(o.data||[]);setDisputes(d.data||[])},[]);
 useFocusEffect(useCallback(()=>{if(role==='admin')load()},[role,load]));
 const d=useMemo(()=>{if(!inq)return null;const offers=offersRaw,msgs=inq,expiring=listings.filter(l=>l.status==='published'&&l.expires_at&&daysLeft(l.expires_at)<=3);
  const L=monthly(listings),O=monthly(offers),M=monthly(msgs),P=monthly(listings.filter(l=>l.status==='published'));
  return {offers,msgs,L,O,M,P,pending:offers.filter(o=>offerState(o)==='pending').length,expiring,openDisputes:disputes.length,newMsgs:msgs.filter(m=>m.status==='new').length,
   feed:[...offers.slice(0,6).map(o=>({t:o.created_at,icon:'flash',text:`Offer ${fmt(o.amount)} from ${o.name}`})),...inq.slice(0,5).map(i=>({t:i.created_at,icon:'message-text-outline',text:`${i.type||'Message'} from ${i.name}`})),
    ...listings.slice(0,5).map(l=>({t:l.created_at,icon:'home-plus-outline',text:`Listing added: ${l.title}`}))].sort((a,b)=>new Date(b.t)-new Date(a.t)).slice(0,7)}},[inq,offersRaw,disputes,listings]);
 if(role!=='admin')return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}><Empty text="Admins only." icon="shield-lock-outline"/></SafeAreaView>;
 const refresh=async()=>{setRf(true);await Promise.all([reload(),load()]);setRf(false)};
 const go=(n,p)=>()=>{tap();navigation.navigate(n,p)};
 const ACTIONS=[['plus-circle-outline','Add property','AddListing'],['view-list-outline','My listings','MyListings'],['flash','Offers','Inbox',{tab:'offers'}],['message-text-outline','Messages','Inbox',{tab:'messages'}],['gavel','Disputes','Disputes'],['crown-outline','Subscribers','Subscribers'],['bell-outline','Notifications','Notifications']];
 return(<SafeAreaView edges={[]} style={{flex:1,backgroundColor:C.bg}}>
  <ScrollView contentContainerStyle={{padding:16,paddingBottom:40}} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={rf} onRefresh={refresh} tintColor={C.crimson}/>}>
   {!d?<View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>{[0,1,2,3].map(i=><Skeleton key={i} style={{width:'48.5%',height:150}} r={18}/>)}</View>
   :<View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
    <Stat i={0} icon="home-city-outline" label="Total listings" value={listings.length} series={d.L.counts}/>
    <Stat i={1} icon="flash" label="Active offers (pending)" value={d.pending} series={d.O.counts}/>
    <Stat i={2} icon="message-text-outline" label="New messages" value={d.newMsgs} series={d.M.counts}/>
    <Stat i={3} icon="eye-check-outline" label="Published" value={listings.filter(l=>l.status==='published').length} series={d.P.counts}/></View>}

   {d&&(d.openDisputes>0||d.expiring.length>0)&&<View style={{marginTop:16,gap:8}}>
    {d.openDisputes>0&&<Pressable onPress={go('Disputes')} accessibilityRole="button"><GlassCard r={16} padding={12}><View style={{flexDirection:'row',alignItems:'center',gap:10}}><Icon name="gavel" size={22} color="#EF4444"/><Text style={[type.smallB,{color:C.tx,flex:1}]}>{d.openDisputes} open dispute{d.openDisputes>1?'s':''} need review</Text><Icon name="chevron-right" size={20} color={C.mute}/></View></GlassCard></Pressable>}
    {d.expiring.length>0&&<Pressable onPress={go('MyListings')} accessibilityRole="button"><GlassCard r={16} padding={12}><View style={{flexDirection:'row',alignItems:'center',gap:10}}><Icon name="timer-sand" size={22} color={C.gold}/><Text style={[type.smallB,{color:C.tx,flex:1}]}>{d.expiring.length} listing{d.expiring.length>1?'s':''} expire within 3 days</Text><Icon name="chevron-right" size={20} color={C.mute}/></View></GlassCard></Pressable>}</View>}
   <View style={{marginTop:24}}><Text style={[type.h3,{color:C.tx,marginBottom:12}]}>Quick actions</Text>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>{ACTIONS.map(([ic,l,n,p])=>(
     <Pressable key={l} accessibilityRole="button" accessibilityLabel={l} onPress={go(n,p)} style={{width:'31.5%'}}>
      <GlassCard r={18} style={{minHeight:92,alignItems:'center',justifyContent:'center',padding:10}}><Icon name={ic} size={26} color={C.crimson}/><Text numberOfLines={1} style={[type.captionB,{color:C.tx,marginTop:6}]}>{l}</Text></GlassCard></Pressable>))}</View></View>

   {d&&<><View style={{marginTop:24}}><Text style={[type.h3,{color:C.tx,marginBottom:12}]}>Monthly performance</Text>
    <GlassCard r={20} padding={16}>
     <View style={{flexDirection:'row',gap:14,marginBottom:8}}>{[['Offers',C.crimson],['Messages',C.gold],['Listings','#8B8B94']].map(([n,c])=><View key={n} style={{flexDirection:'row',alignItems:'center',gap:5}}><View style={{width:10,height:10,borderRadius:5,backgroundColor:c}}/><Text style={[type.caption,{color:C.mute}]}>{n}</Text></View>)}</View>
     <BarChart labels={d.O.labels} series={[{name:'Offers',color:C.crimson,data:d.O.counts},{name:'Messages',color:C.gold,data:d.M.counts},{name:'Listings',color:'#8B8B94',data:d.L.counts}]}/></GlassCard></View>

   <View style={{marginTop:24}}><SectionHeader title="Latest offers" action="See all" onAction={go('Inbox',{tab:'offers'})}/>
    {d.offers.length?d.offers.slice(0,4).map(o=>{const [l,c]=OFFER_STATUS[offerState(o)]||OFFER_STATUS.pending;return(
     <Pressable key={o.id} onPress={go('Inbox',{tab:'offers'})} accessibilityRole="button" style={{marginBottom:8}}><GlassCard r={16} padding={14}>
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8}}><View style={{flex:1}}><Text style={[type.bodyB,{color:C.tx}]} numberOfLines={1}>{fmt(o.amount)}</Text>
       <Text style={[type.small,{color:C.mute}]} numberOfLines={1}>{o.name} · {listings.find(x=>x.id===o.listing_id)?.title||'listing'}</Text></View><StatusChip label={l} color={c}/></View></GlassCard></Pressable>)})
     :<Text style={[type.small,{color:C.mute}]}>No offers yet. They appear here the moment a buyer taps "Place Your Offer First".</Text>}</View>

   <View style={{marginTop:24}}><Text style={[type.h3,{color:C.tx,marginBottom:12}]}>Recent activity</Text>
    <GlassCard r={20} padding={16}>{d.feed.length?d.feed.map((f,i)=>(
     <View key={i} style={{flexDirection:'row',gap:12}}>
      <View style={{alignItems:'center'}}><View style={{width:30,height:30,borderRadius:15,backgroundColor:C.tint,alignItems:'center',justifyContent:'center'}}><Icon name={f.icon} size={16} color={C.crimson}/></View>{i<d.feed.length-1&&<View style={{width:2,flex:1,backgroundColor:C.line,minHeight:16}}/>}</View>
      <View style={{flex:1,paddingBottom:14}}><Text style={[type.small,{color:C.tx}]}>{f.text}</Text><Text style={[type.caption,{color:C.mute}]}>{ago(f.t)}</Text></View></View>)):<Text style={[type.small,{color:C.mute}]}>Nothing yet.</Text>}</GlassCard></View></>}
  </ScrollView></SafeAreaView>)}