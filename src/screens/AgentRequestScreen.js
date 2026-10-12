import React,{useState} from 'react';
import {View,Text,TextInput,ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import {Empty} from '../components/ui';
import {supabase} from '../lib/supabase';
import {notify} from '../lib/dialog';
import {useApp} from '../store';
import {useC,type} from '../theme';
import {success} from '../lib/haptics';
export default function AgentRequestScreen({navigation}){
 const C=useC(),{user,role,agentStatus,refreshProfile}=useApp(),[name,setName]=useState(user?.user_metadata?.full_name||''),[phone,setPhone]=useState(''),[company,setCompany]=useState(''),[busy,setBusy]=useState(false);
 const inp={marginTop:10,minHeight:52,borderRadius:16,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill,paddingHorizontal:16,color:C.tx};
 const send=async()=>{
  if(name.trim().length<2)return notify('Check name','Enter your full name.');
  if(phone.replace(/\D/g,'').length<7)return notify('Check phone','Enter a valid phone number.');
  setBusy(true);
  const {data,error}=await supabase.rpc('request_agent',{p_name:name.trim(),p_phone:phone.trim(),p_company:company.trim()||null});
  setBusy(false);
  if(error)return notify('Error',/function|schema cache/i.test(error.message)?`${error.message}\n\nRun migration_05_agents.sql in Supabase first.`:error.message);
  if(data==='ok'){success();notify('Request sent','SAIR will verify you and approve your agent account.');refreshProfile()}
  else if(data==='already')notify('Already approved','Your account already has this role.');
  else notify('Could not send',data==='invalid'?'Please check your name and phone number.':'Please try again.')};
 const wrap=c=><SafeAreaView edges={[]} style={{flex:1,backgroundColor:C.bg}}><ScrollView contentContainerStyle={{padding:16,paddingBottom:40}} keyboardShouldPersistTaps="handled">{c}</ScrollView></SafeAreaView>;
 if(!user)return wrap(<><Empty icon="account-lock-outline" text="Please log in first, then apply to become an agent."/><GradientButton title="Go to Account" onPress={()=>navigation.navigate('Tabs',{screen:'Account'})}/></>);
 if(role==='agent'||role==='admin')return wrap(<GlassCard r={20} padding={16}>
  <View style={{flexDirection:'row',alignItems:'center',gap:8}}><Icon name="check-decagram" size={24} color={C.success}/><Text style={[type.h3,{color:C.tx}]}>{role==='admin'?'You are the admin':'Verified agent'}</Text></View>
  <Text style={[type.small,{color:C.mute,marginTop:6}]}>You can add and manage your own listings, and see offers on them.</Text>
  <View style={{marginTop:14,gap:8}}><GradientButton icon="plus" title="Add property" onPress={()=>navigation.navigate('AddListing')}/><GradientButton ghost icon="view-list-outline" title="My listings" onPress={()=>navigation.navigate('MyListings')}/></View></GlassCard>);
 if(agentStatus==='pending')return wrap(<GlassCard r={20} padding={16}>
  <View style={{flexDirection:'row',alignItems:'center',gap:8}}><Icon name="clock-outline" size={24} color={C.gold}/><Text style={[type.h3,{color:C.tx}]}>Request sent</Text></View>
  <Text style={[type.small,{color:C.mute,marginTop:6}]}>SAIR is verifying your details. You will become an agent as soon as the admin approves.</Text>
  <View style={{marginTop:14}}><GradientButton ghost icon="refresh" title="Check status" onPress={refreshProfile}/></View></GlassCard>);
 return wrap(<GlassCard r={20} padding={16}>
  <Text style={[type.h3,{color:C.tx}]}>Become a SAIR agent</Text>
  <Text style={[type.small,{color:C.mute,marginTop:2}]}>Verified agents add and manage their own listings. SAIR approves your account once.</Text>
  {agentStatus==='rejected'&&<Text style={[type.smallB,{color:'#EF4444',marginTop:8}]}>Your last request was not approved. You can apply again with correct details.</Text>}
  <TextInput accessibilityLabel="Full name" value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={C.mute} style={[type.body,inp]}/>
  <TextInput accessibilityLabel="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Phone / WhatsApp (03xx...)" placeholderTextColor={C.mute} style={[type.body,inp]}/>
  <TextInput accessibilityLabel="Company" value={company} onChangeText={setCompany} placeholder="Agency / company (optional)" placeholderTextColor={C.mute} style={[type.body,inp]}/>
  <View style={{marginTop:14}}><GradientButton icon="send" title="Send request" onPress={send} loading={busy}/></View></GlassCard>)}