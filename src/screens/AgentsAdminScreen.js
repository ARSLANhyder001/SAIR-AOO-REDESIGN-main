import React,{useState,useCallback} from 'react';
import {View,Text,FlatList,RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import StatusChip from '../components/StatusChip';
import {Empty,Loading} from '../components/ui';
import {supabase} from '../lib/supabase';
import {call,whatsapp,toWa} from '../lib/contact';
import {notify,confirm} from '../lib/dialog';
import {useApp} from '../store';
import {useC,type} from '../theme';
import {success} from '../lib/haptics';
const ST={pending:['Pending','#F5B544'],approved:['Approved','#22C55E'],rejected:['Rejected','#EF4444']};
export default function AgentsAdminScreen(){
 const C=useC(),{role}=useApp(),[rows,setRows]=useState(null),[rf,setRf]=useState(false),[busy,setBusy]=useState(null);
 const load=useCallback(async()=>{const {data,error}=await supabase.rpc('admin_list_agents');
  if(error){setRows([]);return notify('Error',/function|schema cache/i.test(error.message)?`${error.message}\n\nRun migration_05_agents.sql in Supabase first.`:error.message)}
  setRows(data||[])},[]);
 useFocusEffect(useCallback(()=>{if(role==='admin')load()},[role,load]));
 const setAgent=(a,ok)=>confirm(ok?'Approve this agent?':a.status==='approved'?'Remove agent role?':'Reject this request?',a.full_name||a.email,async()=>{
  setBusy(a.uid);const {data,error}=await supabase.rpc('admin_set_agent',{p_user:a.uid,p_approve:ok});setBusy(null);
  if(error)return notify('Error',error.message);
  if(data!=='ok')return notify('Not changed',data==='is_admin'?'This account is the admin.':'This user has no profile row yet.');
  success();load()},ok?'Approve':'Confirm');
 if(role!=='admin')return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}><Empty text="Admins only." icon="shield-lock-outline"/></SafeAreaView>;
 const render=({item:a})=>{const [l,c]=ST[a.status]||ST.pending;return(
  <GlassCard r={18} padding={14} style={{marginBottom:10}}>
   <View style={{flexDirection:'row',justifyContent:'space-between',gap:8}}><View style={{flex:1}}>
    <Text style={[type.bodyB,{color:C.tx}]}>{a.full_name||'No name'}</Text>
    <Text style={[type.small,{color:C.mute}]}>{a.email}</Text>
    {!!a.phone&&<Text style={[type.small,{color:C.mute}]}>{a.phone}</Text>}
    {!!a.company&&<Text style={[type.small,{color:C.mute}]}>{a.company}</Text>}
    <Text style={[type.caption,{color:C.mute,marginTop:4}]}>{Number(a.listing_count)} listing{Number(a.listing_count)===1?'':'s'}</Text></View><StatusChip label={l} color={c}/></View>
   {!!a.phone&&<View style={{flexDirection:'row',gap:8,marginTop:12}}>
    <View style={{flex:1}}><GradientButton ghost icon="phone" title="Call" height={48} onPress={()=>call(a.phone)}/></View>
    <View style={{flex:1}}><GradientButton ghost icon="whatsapp" title="WhatsApp" height={48} onPress={()=>whatsapp(toWa(a.phone),`Assalam o Alaikum ${a.full_name||''}, this is SAIR regarding your agent request.`)}/></View></View>}
   <View style={{flexDirection:'row',gap:8,marginTop:8}}>
    {a.status!=='approved'&&<View style={{flex:1}}><GradientButton icon="check" title="Approve" height={48} loading={busy===a.uid} onPress={()=>setAgent(a,true)}/></View>}
    {a.status!=='rejected'&&<View style={{flex:1}}><GradientButton ghost icon="close" title={a.status==='approved'?'Remove':'Reject'} height={48} disabled={busy===a.uid} onPress={()=>setAgent(a,false)}/></View>}</View>
  </GlassCard>)};
 return(<SafeAreaView edges={[]} style={{flex:1,backgroundColor:C.bg}}>
  {rows===null?<View style={{padding:16}}><Loading/></View>
   :<FlatList data={rows} keyExtractor={a=>a.uid} renderItem={render} contentContainerStyle={{padding:16,paddingBottom:90}} initialNumToRender={8} windowSize={7}
     refreshControl={<RefreshControl refreshing={rf} onRefresh={async()=>{setRf(true);await load();setRf(false)}} tintColor={C.crimson}/>}
     ListEmptyComponent={<Empty icon="account-tie-outline" text="No agent requests yet."/>}/>}
 </SafeAreaView>)}