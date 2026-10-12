import React,{useState,useCallback,useMemo} from 'react';
import {View,Text,FlatList,RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import StatusChip from '../components/StatusChip';
import DisputeSheet from '../components/DisputeSheet';
import {Skeleton} from '../components/Skeleton';
import {Empty} from '../components/ui';
import {supabase} from '../lib/supabase';
import {notify,confirm} from '../lib/dialog';
import {useApp} from '../store';
import {useC,type,fmt} from '../theme';
import {OFFER_STATUS,offerState,ago} from '../lib/stats';
import {daysLeft} from '../lib/plans';
import useContact from '../lib/useContact';
import {call,whatsapp} from '../lib/contact';

export default function MyOffersScreen({navigation}){
 const C=useC(),{user,listings,isPaid}=useApp(),{unlock}=useContact(),[rows,setRows]=useState(null),[rf,setRf]=useState(false),[dispute,setDispute]=useState(null);
 const load=useCallback(async()=>{if(!user){setRows([]);return}const {data}=await supabase.from('offers').select('*').eq('buyer_id',user.id).order('created_at',{ascending:false});setRows(data||[])},[user]);
 useFocusEffect(useCallback(()=>{load()},[load]));
 const withdraw=o=>confirm('Withdraw offer?',fmt(o.amount),async()=>{const {error}=await supabase.from('offers').update({status:'withdrawn'}).eq('id',o.id);error?notify('Error','Could not withdraw.'):load()},'Withdraw');
 const contact=async(o,kind)=>{const d=await unlock(o.listing_id);if(!d)return;kind==='call'?call(d.phone):whatsapp(d.whatsapp,`Assalam o Alaikum, regarding my offer on "${listings.find(l=>l.id===o.listing_id)?.title||'your listing'}".`)};
 const render=({item:o})=>{const st=offerState(o),[l,c]=OFFER_STATUS[st]||OFFER_STATUS.pending,lst=listings.find(x=>x.id===o.listing_id),d=daysLeft(o.valid_until);return(
  <GlassCard r={18} padding={14} style={{marginBottom:12}}>
   <View style={{flexDirection:'row',justifyContent:'space-between',gap:8}}><View style={{flex:1}}><Text style={[type.h3,{color:C.red2}]}>{fmt(o.amount)}</Text><Text numberOfLines={1} style={[type.small,{color:C.tx}]}>{lst?.title||'Listing'}</Text></View><StatusChip label={l} color={c}/></View>
   <Text style={[type.caption,{color:C.mute,marginTop:6}]}>Sent {ago(o.created_at)}{st==='pending'&&d!=null?` · ${d>0?`${d} day${d===1?'':'s'} left`:'expires today'}`:''}</Text>
   <View style={{marginTop:10,padding:12,borderRadius:14,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill,gap:3}}>
    <Text style={[type.smallB,{color:C.tx}]}>Advance {fmt(o.advance_amount)} · within {o.advance_due_days} {o.advance_due_days===1?'day':'days'}</Text>
    <Text style={[type.smallB,{color:C.tx}]}>Final {fmt(o.final_amount)} · within {o.final_due_days} days</Text>
    {o.accepted_at&&<Text style={[type.caption,{color:C.mute}]}>Accepted {ago(o.accepted_at)}; days count from then.</Text>}</View>
   {!!o.seller_note&&<Text style={[type.small,{color:C.mute,marginTop:8}]}>Seller note: {o.seller_note}</Text>}
   {st==='pending'&&<View style={{marginTop:10}}><GradientButton ghost icon="undo" title="Withdraw offer" height={48} onPress={()=>withdraw(o)}/></View>}
   {st==='accepted'&&<View style={{flexDirection:'row',gap:8,marginTop:10}}>
    <View style={{flex:1}}><GradientButton ghost icon={isPaid?'phone':'lock'} title="Call" height={48} onPress={()=>contact(o,'call')}/></View>
    <View style={{flex:1}}><GradientButton ghost icon={isPaid?'whatsapp':'lock'} title="WhatsApp" height={48} onPress={()=>contact(o,'wa')}/></View></View>}
   {(st==='accepted'||st==='disputed')&&<View style={{marginTop:8}}><GradientButton icon="gavel" title={st==='disputed'?'Dispute filed · under review':'Report a dispute'} height={48} disabled={st==='disputed'} onPress={()=>setDispute(o)}/>
    {st==='accepted'&&<Text style={[type.caption,{color:C.mute,marginTop:6}]}>Seller not replying after acceptance, or something changed? File a dispute. Admin and the system are both informed.</Text>}</View>}
  </GlassCard>)};
 return(<SafeAreaView edges={[]} style={{flex:1,backgroundColor:C.bg}}>
  <FlatList data={rows||[]} keyExtractor={o=>o.id} renderItem={render} contentContainerStyle={{padding:16,paddingBottom:40}} initialNumToRender={5}
   refreshControl={<RefreshControl refreshing={rf} onRefresh={async()=>{setRf(true);await load();setRf(false)}} tintColor={C.crimson}/>}
   ListEmptyComponent={!rows?<Skeleton style={{height:200}} r={18}/>:!user?<View><Empty icon="account-outline" text="Log in to see your offers."/><View style={{width:200,alignSelf:'center'}}><GradientButton title="Log in" onPress={()=>navigation.navigate('Account')}/></View></View>:<Empty icon="flash-outline" text="You have not placed any offers yet."/>}/>
  {dispute&&<DisputeSheet offer={dispute} onClose={()=>setDispute(null)} onDone={load}/>}</SafeAreaView>)}
