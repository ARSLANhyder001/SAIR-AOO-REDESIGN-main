import React,{useState,useMemo} from 'react';
import {Text,TextInput,View,ScrollView,Pressable,useWindowDimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import BottomSheet from './BottomSheet';
import GradientButton from './GradientButton';
import MultiChips from './MultiChips';
import TermsModal from './TermsModal';
import {useC,type,priceText,fmt} from '../theme';
import {supabase} from '../lib/supabase';
import {notify} from '../lib/dialog';
import {useApp} from '../store';
import {TERMS_VERSION} from '../lib/terms';
import {OFFER_VALIDITY,ADVANCE_PCT,ADVANCE_DUE,FINAL_DUE} from '../lib/plans';
import {success,tap} from '../lib/haptics';
const phoneOk=p=>{const d=p.replace(/\D/g,'');return /^[\d+\s()-]+$/.test(p)&&d.length>=7&&d.length<=15};
// "Place your offer first": validity + payment schedule + accepted terms → saved in `offers` → admin Offers inbox.
export default function OfferSheet({item,onClose}){
 const C=useC(),nav=useNavigation(),{height}=useWindowDimensions(),{user}=useApp();
 const [role,setRole]=useState('buyer'),[amt,setAmt]=useState(''),[valid,setValid]=useState('7'),[advPct,setAdvPct]=useState('20'),[advDue,setAdvDue]=useState('3'),[finDue,setFinDue]=useState('30'),
  [name,setName]=useState(user?.user_metadata?.full_name||''),[phone,setPhone]=useState(''),[note,setNote]=useState(''),[agree,setAgree]=useState(false),[terms,setTerms]=useState(false),[busy,setBusy]=useState(false);
 const n=Number(amt)||0,adv=Math.round(n*Number(advPct)/100),fin=n-adv,until=useMemo(()=>new Date(Date.now()+Number(valid)*864e5),[valid]);
 const box=[type.body,{color:C.tx,minHeight:52,borderRadius:16,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill,paddingHorizontal:16}];
 const lbl=t=><Text style={[type.captionB,{color:C.mute,marginTop:14,marginBottom:6}]}>{t}</Text>;
 const send=async()=>{
  if(busy)return;
  if(!user){onClose();notify('Log in first','Please log in or sign up to place an offer.');return nav.navigate('Account')}
  if(n<1)return notify('Enter your offer','Type the amount you want to offer in PKR.');
  if(name.trim().length<2||!phoneOk(phone.trim()))return notify('Check details','Enter your name and a valid phone number.');
  if(!agree)return notify('Accept the terms','Please read and accept the offer terms first.');
  setBusy(true);
  const {error}=await supabase.from('offers').insert({listing_id:item.id,buyer_id:user.id,buyer_role:role,name:name.trim(),phone:phone.trim(),amount:n,valid_until:until.toISOString(),
   advance_amount:adv,advance_due_days:Number(advDue),final_amount:fin,final_due_days:Number(finDue),note:note.trim()||null,terms_version:TERMS_VERSION,terms_accepted_at:new Date().toISOString()});
  setBusy(false);
  if(error)return notify('Could not send',/relation|does not exist/i.test(error.message)?'Offers are not set up yet. Run migration_04 in Supabase.':'Please check your internet and try again.');
  success();onClose();notify('Offer sent','Your offer is now with SAIR admin. Track it under More > My offers.')};
 return(<BottomSheet title="Place your offer first" onClose={onClose}>
  <Text numberOfLines={1} style={[type.bodyB,{color:C.tx}]}>{item.title}</Text>
  <Text style={[type.small,{color:C.mute,marginTop:2}]}>Asking: {priceText(item,true)||'Price on request'}</Text>
  <ScrollView style={{maxHeight:height*0.5}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
   {lbl('I AM A')}<MultiChips options={[['buyer','Buyer'],['agent','Agent (for a client)']]} value={role} onChange={setRole}/>
   {lbl('YOUR OFFER (PKR)')}
   <TextInput accessibilityLabel="Offer amount in PKR" keyboardType="number-pad" value={amt} onChangeText={t=>setAmt(t.replace(/[^\d]/g,''))} placeholder="e.g. 8500000" placeholderTextColor={C.mute} style={[...box,type.h3]}/>
   {n>0&&<Text style={[type.small,{color:C.gold,marginTop:6}]}>{fmt(n)}</Text>}
   {lbl('OFFER VALID FOR')}<MultiChips options={OFFER_VALIDITY} value={valid} onChange={setValid}/>
   <Text style={[type.caption,{color:C.mute,marginTop:6}]}>Expires on {until.toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</Text>
   {lbl('PAYMENT SCHEDULE')}
   <Text style={[type.caption,{color:C.mute,marginBottom:6}]}>Advance</Text><MultiChips options={ADVANCE_PCT} value={advPct} onChange={setAdvPct}/>
   <Text style={[type.caption,{color:C.mute,marginTop:10,marginBottom:6}]}>Advance paid within (after acceptance)</Text><MultiChips options={ADVANCE_DUE} value={advDue} onChange={setAdvDue}/>
   <Text style={[type.caption,{color:C.mute,marginTop:10,marginBottom:6}]}>Final payment at deal close, within</Text><MultiChips options={FINAL_DUE} value={finDue} onChange={setFinDue}/>
   {n>0&&<View style={{marginTop:12,padding:12,borderRadius:14,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill,gap:4}}>
    <Text style={[type.smallB,{color:C.tx}]}>Advance: {fmt(adv)} · within {advDue} {advDue==='1'?'day':'days'}</Text>
    <Text style={[type.smallB,{color:C.tx}]}>Final: {fmt(fin)} · within {finDue} days</Text>
    <Text style={[type.caption,{color:C.mute}]}>Counted from the day the offer is accepted.</Text></View>}
   {lbl('YOUR NAME')}<TextInput accessibilityLabel="Your name" value={name} onChangeText={setName} maxLength={100} placeholder="Full name" placeholderTextColor={C.mute} style={box}/>
   {lbl('PHONE')}<TextInput accessibilityLabel="Phone number" value={phone} onChangeText={setPhone} maxLength={20} keyboardType="phone-pad" placeholder="03xx xxxxxxx" placeholderTextColor={C.mute} style={box}/>
   {lbl('NOTE (OPTIONAL)')}<TextInput accessibilityLabel="Note" value={note} onChangeText={setNote} maxLength={300} placeholder="Anything the seller should know" placeholderTextColor={C.mute} style={box}/>
   <Pressable onPress={()=>{tap();setAgree(a=>!a)}} accessibilityRole="checkbox" accessibilityState={{checked:agree}} style={{flexDirection:'row',alignItems:'center',gap:10,minHeight:52,marginTop:10}}>
    <Icon name={agree?'checkbox-marked':'checkbox-blank-outline'} size={26} color={agree?C.crimson:C.mute}/>
    <Text style={[type.small,{color:C.tx,flex:1}]}>I have read and accept the <Text onPress={()=>setTerms(true)} style={{color:C.red2,textDecorationLine:'underline'}}>offer terms & conditions</Text></Text></Pressable>
  </ScrollView>
  <View style={{marginTop:12}}><GradientButton title={busy?'Sending…':'Send my offer'} icon="send" onPress={send} loading={busy} disabled={!agree}/></View>
  {terms&&<TermsModal onClose={()=>setTerms(false)}/>}</BottomSheet>)}
