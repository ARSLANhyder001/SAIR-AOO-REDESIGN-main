import React,{useState,useCallback,useMemo} from 'react';
import {View,Text,FlatList,RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import MultiChips from '../components/MultiChips';
import StatusChip from '../components/StatusChip';
import BottomSheet from '../components/BottomSheet';
import {Field,Empty,Loading} from '../components/ui';
import {supabase} from '../lib/supabase';
import {call} from '../lib/contact';
import {notify,confirm} from '../lib/dialog';
import {useApp} from '../store';
import {useC,type,fmt} from '../theme';
import {ago} from '../lib/stats';
import {success} from '../lib/haptics';
const SELLER=[['owner','Property owner'],['agent','Agent'],['builder','Builder']],SL=Object.fromEntries(SELLER);
const ST={due:['Due','#F5B544'],paid:['Paid','#22C55E'],waived:['Waived','#8B8B94']};
export default function CommissionsScreen(){
 const C=useC(),{role}=useApp(),[rows,setRows]=useState(null),[rf,setRf]=useState(false),[f,setF]=useState('all'),[edit,setEdit]=useState(null),[busy,setBusy]=useState(false);
 const [st,setSt]=useState('owner'),[sn,setSn]=useState(''),[sp,setSp]=useState(''),[rate,setRate]=useState('1');
 const load=useCallback(async()=>{const {data,error}=await supabase.rpc('admin_commission_list');
  if(error){setRows([]);return notify('Error',/function|schema cache/i.test(error.message)?`${error.message}\n\nRun migration_07_commissions.sql in Supabase first.`:error.message)}
  setRows(data||[])},[]);
 useFocusEffect(useCallback(()=>{if(role==='admin')load()},[role,load]));
 const totals=useMemo(()=>{const t={due:0,paid:0};(rows||[]).forEach(r=>{if(r.status==='due')t.due+=Number(r.commission_amount);if(r.status==='paid')t.paid+=Number(r.commission_amount)});return t},[rows]);
 const shown=useMemo(()=>(rows||[]).filter(r=>f==='all'||(f==='none'?!r.status:r.status===f)),[rows,f]);
 const open=r=>{setEdit(r);setSt(r.seller_type||'owner');setSn(r.seller_name||'');setSp(r.seller_phone||'');setRate(r.rate!=null?String(+r.rate):'1')};
 const preview=edit?Math.round(Number(edit.deal_amount)*(Number(rate)||0)/100):0;
 const save=async()=>{
  const n=Number(rate);if(rate.trim()===''||isNaN(n)||n<0||n>100)return notify('Check rate','Commission % must be between 0 and 100.');
  setBusy(true);const {data,error}=await supabase.rpc('admin_set_commission',{p_offer:edit.offer_id,p_seller_type:st,p_seller_name:sn.trim()||null,p_seller_phone:sp.trim()||null,p_rate:n});setBusy(false);
  if(error)return notify('Error',error.message);
  if(data==='already_paid')return notify('Already paid','A paid commission cannot be edited.');
  if(data!=='ok')return notify('Not saved','Commission is only for accepted offers on SAIR listings.');
  success();setEdit(null);load()};
 const mark=(r,s)=>confirm(s==='paid'?'Mark commission as paid?':'Waive this commission?',`${fmt(r.commission_amount)} · ${r.listing_title}`,async()=>{
  const {data,error}=await supabase.rpc('admin_mark_commission',{p_offer:r.offer_id,p_status:s});
  if(error)return notify('Error',error.message);if(data!=='ok')return notify('Not changed','Please try again.');success();load()},s==='paid'?'Mark paid':'Waive');
 if(role!=='admin')return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}><Empty text="Admins only." icon="shield-lock-outline"/></SafeAreaView>;
 const render=({item:r})=>{const [l,c]=r.status?ST[r.status]:['Not set','#8B8B94'];return(
  <GlassCard r={18} padding={14} style={{marginBottom:10}}>
   <View style={{flexDirection:'row',justifyContent:'space-between',gap:8}}><View style={{flex:1}}>
    <Text numberOfLines={1} style={[type.bodyB,{color:C.tx}]}>{r.listing_title}</Text>
    <Text style={[type.h3,{color:C.red2,marginTop:2}]}>{fmt(r.deal_amount)}</Text>
    <Text style={[type.small,{color:C.mute}]}>Buyer: {r.buyer_name} · accepted {ago(r.accepted_at)}</Text></View><StatusChip label={l} color={c}/></View>
   {r.status?<View style={{marginTop:8,padding:10,borderRadius:12,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill,gap:2}}>
     <Text style={[type.smallB,{color:C.tx}]}>Commission {fmt(r.commission_amount)} · {+r.rate}%</Text>
     <Text style={[type.caption,{color:C.mute}]}>Seller: {SL[r.seller_type]}{r.seller_name?` · ${r.seller_name}`:''}{r.seller_phone?` · ${r.seller_phone}`:''}</Text></View>
    :<Text style={[type.small,{color:C.mute,marginTop:8}]}>No commission set yet for this deal.</Text>}
   <View style={{flexDirection:'row',gap:8,marginTop:12}}>
    {r.status!=='paid'&&<View style={{flex:1}}><GradientButton ghost icon="percent-outline" title={r.status?'Edit':'Set commission'} height={48} onPress={()=>open(r)}/></View>}
    {r.status==='due'&&<View style={{flex:1}}><GradientButton icon="check" title="Mark paid" height={48} onPress={()=>mark(r,'paid')}/></View>}
    {!!r.seller_phone&&<View style={{width:48}}><GradientButton ghost icon="phone" title="" height={48} onPress={()=>call(r.seller_phone)}/></View>}</View>
   {r.status==='due'&&<View style={{marginTop:8}}><GradientButton ghost icon="cancel" title="Waive" height={44} onPress={()=>mark(r,'waived')}/></View>}
  </GlassCard>)};
 return(<SafeAreaView edges={[]} style={{flex:1,backgroundColor:C.bg}}>
  {rows===null?<View style={{padding:16}}><Loading/></View>:<>
   <View style={{flexDirection:'row',gap:10,paddingHorizontal:16,paddingTop:16}}>
    <GlassCard r={16} padding={12} style={{flex:1}}><Text style={[type.caption,{color:C.mute}]}>Commission due</Text><Text style={[type.h3,{color:C.gold}]}>{fmt(totals.due)}</Text></GlassCard>
    <GlassCard r={16} padding={12} style={{flex:1}}><Text style={[type.caption,{color:C.mute}]}>Commission received</Text><Text style={[type.h3,{color:C.success}]}>{fmt(totals.paid)}</Text></GlassCard></View>
   <View style={{padding:16,paddingBottom:4}}><MultiChips options={[['all','All'],['none','Not set'],['due','Due'],['paid','Paid'],['waived','Waived']]} value={f} onChange={setF}/></View>
   <FlatList data={shown} keyExtractor={r=>r.offer_id} renderItem={render} contentContainerStyle={{padding:16,paddingBottom:90}} initialNumToRender={6} windowSize={7}
    refreshControl={<RefreshControl refreshing={rf} onRefresh={async()=>{setRf(true);await load();setRf(false)}} tintColor={C.crimson}/>}
    ListEmptyComponent={<Empty icon="cash-multiple" text="No accepted offers on SAIR listings yet."/>}/></>}
  {edit&&<BottomSheet title="Set commission" onClose={()=>setEdit(null)}>
   <Text style={[type.small,{color:C.mute,marginBottom:10}]} numberOfLines={2}>{edit.listing_title} · deal {fmt(edit.deal_amount)}</Text>
   <Text style={[type.captionB,{color:C.mute,marginBottom:8}]}>SELLER IS</Text>
   <MultiChips options={SELLER} value={st} onChange={setSt}/>
   <View style={{height:10}}/>
   <Field placeholder="Seller name" value={sn} onChangeText={setSn} maxLength={80}/>
   <Field placeholder="Seller phone (03xx...)" keyboardType="phone-pad" value={sp} onChangeText={setSp} maxLength={20}/>
   <Field placeholder="Commission % (e.g. 1 or 2.5)" keyboardType="decimal-pad" value={rate} onChangeText={setRate} maxLength={5}/>
   <Text style={[type.bodyB,{color:C.tx,marginTop:4}]}>Commission: {fmt(preview)}</Text>
   <View style={{marginTop:14}}><GradientButton icon="check" title="Save commission" onPress={save} loading={busy}/></View></BottomSheet>}
 </SafeAreaView>)}