import React,{useState} from 'react';
import {notify} from '../lib/dialog';
import {Btn,Chips,Field} from './ui';
import {supabase} from '../lib/supabase';
const phoneOk=p=>{const d=p.replace(/\D/g,'');return /^[\d+\s()-]+$/.test(p)&&d.length>=7&&d.length<=15};
export default function InquiryForm({types,listingId,button}){
 const blank={name:'',phone:'',area:'',message:''};
 const [type,setType]=useState(types[0][0]),[f,setF]=useState(blank),[busy,setBusy]=useState(false);
 const set=k=>v=>setF(p=>({...p,[k]:v}));
 const send=async()=>{
  if(busy)return;
  if(f.name.trim().length<2||!phoneOk(f.phone.trim()))return notify('Check details','Enter your name and a valid phone number.');
  setBusy(true);
  const {error}=await supabase.from('inquiries').insert({type,name:f.name.trim(),phone:f.phone.trim(),area:f.area.trim()||null,message:f.message.trim()||null,listing_id:listingId||null});
  setBusy(false);
  if(error)return notify('Could not send','Please try again.');
  setF(blank);notify('Sent','We will call you back.')};
 return(<>
  {types.length>1&&<Chips options={types} value={type} onChange={setType}/>}
  <Field placeholder="Your name" autoComplete="name" textContentType="name" value={f.name} onChangeText={set('name')} maxLength={100}/>
  <Field placeholder="Phone number" autoComplete="tel" textContentType="telephoneNumber" keyboardType="phone-pad" value={f.phone} onChangeText={set('phone')} maxLength={20}/>
  {types.length>1&&<Field placeholder="Area / city" value={f.area} onChangeText={set('area')} maxLength={100}/>}
  <Field placeholder={types.length>1?'Details (size, budget)':'How can we help?'} multiline value={f.message} onChangeText={set('message')} maxLength={1000}/>
  <Btn title={busy?'Sending...':button} onPress={send} disabled={busy}/></>)}
