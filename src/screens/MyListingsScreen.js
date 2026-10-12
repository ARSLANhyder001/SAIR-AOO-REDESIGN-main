import React,{useState,useMemo,useCallback} from 'react';
import {View,Text,FlatList,Pressable,RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {Image} from 'expo-image';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import MultiChips from '../components/MultiChips';
import StatusChip from '../components/StatusChip';
import {Empty} from '../components/ui';
import {supabase} from '../lib/supabase';
import {removeImage} from '../lib/images';
import {notify,confirm} from '../lib/dialog';
import {useApp} from '../store';
import {useC,type,cover,sized,priceText} from '../theme';
import {propType,TYPE_LABEL} from '../lib/propertyMeta';
import BottomSheet from '../components/BottomSheet';
import {LISTING_DAYS,daysLeft} from '../lib/plans';
export default function MyListingsScreen({navigation}){
 const C=useC(),{role,user,listings,reload}=useApp(),[f,setF]=useState('all'),[rf,setRf]=useState(false),[relist,setRelist]=useState(null),[days,setDays]=useState('30');
 const mine=useMemo(()=>role==='admin'?listings:listings.filter(l=>l.owner_id&&l.owner_id===user?.id),[role,listings,user]);// agents see only their own listings
 const rows=useMemo(()=>mine.filter(l=>{const ex=l.status==='expired'||(l.status==='published'&&l.expires_at&&daysLeft(l.expires_at)<=0);return f==='all'||(f==='expired'?ex:f==='published'?l.status==='published'&&!ex:l.status===f||l.kind===f)}),[mine,f]);
 const doRelist=async()=>{const {error}=await supabase.from('listings').update({status:'published',listed_days:Number(days),expires_at:new Date(Date.now()+Number(days)*864e5).toISOString(),relisted_count:(relist.relisted_count||0)+1}).eq('id',relist.id);error?notify('Error',error.message):(setRelist(null),reload())};
 const toggle=useCallback(async l=>{const pub=l.status!=='published';const {error}=await supabase.from('listings').update(pub?{status:'published',expires_at:new Date(Date.now()+(l.listed_days||30)*864e5).toISOString()}:{status:'draft'}).eq('id',l.id);error?notify('Error',error.message):reload()},[reload]);
 const del=useCallback(l=>confirm('Delete listing?',l.title,async()=>{const {error}=await supabase.from('listings').delete().eq('id',l.id);if(error)return notify('Error',error.message);(l.images||[]).forEach(u=>removeImage(u).catch(()=>{}));reload()}),[reload]);
 if(role!=='admin'&&role!=='agent')return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}><Empty text="Admins and approved agents only." icon="shield-lock-outline"/></SafeAreaView>;
 const render=({item:l})=>{const u=sized(cover(l),300),t=propType(l);return(
  <GlassCard r={18} padding={12} style={{marginBottom:10}}>
   <View style={{flexDirection:'row',gap:12}}>
    <View style={{width:84,height:84,borderRadius:14,overflow:'hidden',backgroundColor:C.skel}}>{!!u&&<Image source={{uri:u}} style={{flex:1}} contentFit="cover" cachePolicy="memory-disk"/>}</View>
    <View style={{flex:1,gap:3}}><Text numberOfLines={1} style={[type.bodyB,{color:C.tx}]}>{l.title}</Text>
     <Text numberOfLines={1} style={[type.small,{color:C.mute}]}>{[l.kind==='project'?'Project':t?TYPE_LABEL[t]:'Property',l.city,priceText(l,true)].filter(Boolean).join(' · ')}</Text>
     {(()=>{const d=daysLeft(l.expires_at),ex=l.status==='expired'||(l.status==='published'&&d!=null&&d<=0);return <StatusChip label={ex?'Expired · relist to go live':l.status==='published'?`Published${d!=null?` · ${d}d left`:''}`:'Draft'} color={ex?'#EF4444':l.status==='published'?(d!=null&&d<=3?C.gold:C.success):'#8B8B94'}/>})()}</View></View>
   <View style={{flexDirection:'row',gap:8,marginTop:10}}>
    <View style={{flex:1}}><GradientButton ghost icon="pencil-outline" title="Edit" height={48} onPress={()=>navigation.navigate('AddListing',{id:l.id})}/></View>
    {(l.status==='expired'||(l.status==='published'&&l.expires_at&&daysLeft(l.expires_at)<=0))
     ?<View style={{flex:1}}><GradientButton icon="refresh" title="Relist" height={48} onPress={()=>{setDays(String(l.listed_days||30));setRelist(l)}}/></View>
     :<View style={{flex:1}}><GradientButton ghost icon={l.status==='published'?'eye-off-outline':'eye-outline'} title={l.status==='published'?'Hide':'Show'} height={48} onPress={()=>toggle(l)}/></View>}
    <View style={{width:48}}><GradientButton ghost icon="delete-outline" title="" height={48} onPress={()=>del(l)}/></View></View></GlassCard>)};
 return(<SafeAreaView edges={[]} style={{flex:1,backgroundColor:C.bg}}>
  <View style={{padding:16}}><MultiChips options={[['all','All'],['published','Live'],['expired','Expired'],['draft','Draft'],['property','Properties'],['project','Projects']]} value={f} onChange={setF}/></View>
  <FlatList data={rows} keyExtractor={l=>l.id} renderItem={render} contentContainerStyle={{padding:16,paddingTop:0,paddingBottom:110}} initialNumToRender={6} windowSize={7}
   refreshControl={<RefreshControl refreshing={rf} onRefresh={async()=>{setRf(true);await reload();setRf(false)}} tintColor={C.crimson}/>} ListEmptyComponent={<Empty text="No listings here."/>}/>
  {relist&&<BottomSheet title="Relist for how long?" onClose={()=>setRelist(null)}>
   <Text style={[type.small,{color:C.mute,marginBottom:12}]}>A listing stays live for 15 to 30 days. After that it hides automatically until you relist it.</Text>
   <MultiChips options={LISTING_DAYS.map(d=>[String(d),`${d} days`])} value={days} onChange={setDays}/>
   <View style={{marginTop:16}}><GradientButton icon="refresh" title="Relist now" onPress={doRelist}/></View></BottomSheet>}
  <View style={{position:'absolute',right:16,bottom:24,width:180}}><GradientButton icon="plus" title="Add property" onPress={()=>navigation.navigate('AddListing')}/></View></SafeAreaView>)}