import React,{useState} from 'react';
import {View,Text} from 'react-native';
import {Screen} from '../components/ui';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {supabase} from '../lib/supabase';
import {notify} from '../lib/dialog';
import {whatsapp} from '../lib/contact';
import {SAIR,hasPhone} from '../config';
import {useApp} from '../store';
import {useC,type} from '../theme';
import {PLAN_PRICE_TEXT,FREE_NOTIF_LIMIT} from '../lib/plans';
const Row=({ok,text})=>{const C=useC();return <View style={{flexDirection:'row',gap:10,alignItems:'center',marginTop:8}}><Icon name={ok?'check-circle':'lock-outline'} size={20} color={ok?C.success:C.mute}/><Text style={[type.small,{color:ok?C.tx:C.mute,flex:1}]}>{text}</Text></View>};
// Activation is done by SAIR admin (Admin > Subscribers) after payment is confirmed. No payment gateway is wired in this version.
export default function PlansScreen({navigation}){
 const C=useC(),{user,isPaid,plan,role}=useApp(),[busy,setBusy]=useState(false);
 const request=async()=>{
  if(!user){notify('Log in first','Please log in to request a plan.');return navigation.navigate('Account')}
  setBusy(true);
  const {error}=await supabase.from('inquiries').insert({type:'subscription',name:user.user_metadata?.full_name||user.email,phone:user.user_metadata?.phone||'n/a',message:`PRO PLAN REQUEST from ${user.email}`});
  setBusy(false);
  if(error)return notify('Could not send','Please try again.');
  notify('Request sent','SAIR will contact you to confirm payment and activate your plan.');
  if(hasPhone)whatsapp(SAIR.whatsapp,`Assalam o Alaikum, I want to activate the SAIR Pro plan. My account email: ${user.email}`)};
 return(<Screen top={false}>
  <GlassCard r={22} glow padding={18} style={{marginTop:6}}>
   <Text style={[type.captionB,{color:C.gold}]}>{isPaid?(role==='admin'?'ADMIN ACCESS':'YOUR PLAN · ACTIVE'):'YOUR PLAN · FREE'}</Text>
   <Text style={[type.h2,{color:C.tx,marginTop:4}]}>SAIR Pro</Text>
   <Text style={[type.small,{color:C.mute,marginTop:2}]}>{PLAN_PRICE_TEXT||'Ask SAIR for the current price'}{isPaid&&plan.until?` · valid until ${new Date(plan.until).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}`:''}</Text>
   <Row ok text="See and use direct contact details (call / WhatsApp)"/><Row ok text="Unlimited lead notifications"/><Row ok text="Place offers with full payment schedule"/><Row ok text="Dispute support from admin"/>
   {!isPaid&&<View style={{marginTop:16}}><GradientButton icon="crown-outline" title={busy?'Sending…':'Request Pro plan'} onPress={request} loading={busy}/></View>}</GlassCard>
  <GlassCard r={22} padding={18} style={{marginTop:14}}>
   <Text style={[type.h3,{color:C.tx}]}>Free plan</Text>
   <Row ok text="Browse all listings and maps"/><Row ok text="Place offers and file disputes"/><Row text="Contact details stay locked"/><Row text={`Only the ${FREE_NOTIF_LIMIT} newest lead notifications`}/></GlassCard></Screen>)}
