import React,{useState} from 'react';
import {Text,TextInput,View} from 'react-native';
import BottomSheet from './BottomSheet';
import GradientButton from './GradientButton';
import MultiChips from './MultiChips';
import {useC,type} from '../theme';
import {supabase} from '../lib/supabase';
import {notify} from '../lib/dialog';
import {useApp} from '../store';
import {DISPUTE_REASONS} from '../lib/plans';
import {success} from '../lib/haptics';
// Filing a dispute: admin sees it in Disputes; the database trigger freezes the offer as 'disputed' (the "system" side).
export default function DisputeSheet({offer,onClose,onDone}){
 const C=useC(),{user}=useApp(),[reason,setReason]=useState('no_response'),[details,setDetails]=useState(''),[busy,setBusy]=useState(false);
 const send=async()=>{if(busy)return;setBusy(true);
  const label=DISPUTE_REASONS.find(r=>r[0]===reason)?.[1]||reason;
  const {error}=await supabase.from('disputes').insert({offer_id:offer.id,filed_by:user.id,reason:label,details:details.trim()||null});
  setBusy(false);
  if(error)return notify('Could not file dispute','Only accepted offers can be disputed. Please try again.');
  success();onDone&&onDone();onClose();notify('Dispute filed','SAIR admin has been notified and the offer is now on hold while we review it.')};
 return(<BottomSheet title="Report a dispute" onClose={onClose}>
  <Text style={[type.small,{color:C.mute}]}>Use this if the offer was accepted but the seller does not reply, or something was changed. Admin and the system are both informed.</Text>
  <Text style={[type.captionB,{color:C.mute,marginTop:14,marginBottom:8}]}>WHAT WENT WRONG?</Text><MultiChips options={DISPUTE_REASONS} value={reason} onChange={setReason}/>
  <Text style={[type.captionB,{color:C.mute,marginTop:14,marginBottom:8}]}>DETAILS</Text>
  <TextInput accessibilityLabel="Dispute details" multiline value={details} onChangeText={setDetails} maxLength={800} placeholder="What happened, and when?" placeholderTextColor={C.mute}
   style={[type.body,{color:C.tx,minHeight:100,textAlignVertical:'top',borderRadius:16,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill,padding:14}]}/>
  <View style={{marginTop:16}}><GradientButton title={busy?'Sending…':'File dispute'} icon="gavel" onPress={send} loading={busy}/></View></BottomSheet>)}
