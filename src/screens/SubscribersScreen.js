import React,{useState,useCallback} from 'react';
import {View,Text,TextInput,ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import MultiChips from '../components/MultiChips';
import {Empty} from '../components/ui';
import {supabase} from '../lib/supabase';
import {notify} from '../lib/dialog';
import {useApp} from '../store';
import {useC,type} from '../theme';
import {success} from '../lib/haptics';
export default function SubscribersScreen(){
 const C=useC(),{role}=useApp(),[email,setEmail]=useState(''),[days,setDays]=useState('30'),[list,setList]=useState([]),[busy,setBusy]=useState(false);
 const load=useCallback(async()=>{const {data}=await supabase.rpc('admin_list_paid');setList(data||[])},[]);
 useFocusEffect(useCallback(()=>{if(role==='admin')load()},[role,load]));
 const run=async d=>{if(!/^\S+@\S+\.\S+$/.test(email.trim()))return notify('Check email','Enter the user\'s account email.');setBusy(true);
  const {data,error}=await supabase.rpc('admin_set_plan',{p_email:email.trim(),p_days:d});setBusy(false);
  if(error)return notify('Error',error.message);
  if(data==='not_found')return notify('Not found','No account uses this email.');if(data==='no_profile')return notify('No profile','This user has no profile row yet.');
  success();notify('Done',d>0?`Pro activated for ${d} days.`:'Plan set to Free.');setEmail('');load()};
 if(role!=='admin')return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}><Empty text="Admins only." icon="shield-lock-outline"/></SafeAreaView>;
 return(<SafeAreaView edges={[]} style={{flex:1,backgroundColor:C.bg}}><ScrollView contentContainerStyle={{padding:16,paddingBottom:40}} keyboardShouldPersistTaps="handled">
  <GlassCard r={20} padding={16}><Text style={[type.h3,{color:C.tx}]}>Activate Pro plan</Text><Text style={[type.small,{color:C.mute,marginTop:2}]}>After you have received the user's payment.</Text>
   <TextInput accessibilityLabel="User email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="user@email.com" placeholderTextColor={C.mute} style={[type.body,{color:C.tx,marginTop:12,minHeight:52,borderRadius:16,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill,paddingHorizontal:16}]}/>
   <Text style={[type.captionB,{color:C.mute,marginTop:12,marginBottom:6}]}>DURATION</Text><MultiChips options={[['30','30 days'],['90','90 days'],['180','6 months'],['365','1 year']]} value={days} onChange={setDays}/>
   <View style={{flexDirection:'row',gap:8,marginTop:14}}><View style={{flex:2}}><GradientButton title="Activate" icon="crown-outline" onPress={()=>run(Number(days))} loading={busy}/></View><View style={{flex:1}}><GradientButton ghost title="Set Free" onPress={()=>run(0)}/></View></View></GlassCard>
  <Text style={[type.h3,{color:C.tx,marginTop:22,marginBottom:10}]}>Active subscribers ({list.length})</Text>
  {list.length?list.map(u=><GlassCard key={u.email} r={16} padding={12} style={{marginBottom:8}}><Text style={[type.smallB,{color:C.tx}]}>{u.email}</Text><Text style={[type.caption,{color:C.mute}]}>{u.plan_expires_at?`Until ${new Date(u.plan_expires_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}`:'No end date'}</Text></GlassCard>):<Empty icon="crown-outline" text="No paid subscribers yet."/>}</ScrollView></SafeAreaView>)}
