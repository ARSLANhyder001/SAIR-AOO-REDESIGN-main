import React from 'react';
import {View,Text} from 'react-native';
import {Screen,Muted} from '../components/ui';
import ContactButtons from '../components/ContactButtons';
import InquiryForm from '../components/InquiryForm';
import {useApp} from '../store';
import {SAIR} from '../config';
import {useC} from '../theme';
export default function ContactScreen({route}){
 const C=useC(),id=route.params?.listingId,{listings}=useApp(),x=listings.find(l=>l.id===id);
 return <Screen top={false}>
  <View style={{padding:14,marginBottom:14,borderRadius:22,borderWidth:1,borderColor:C.line,backgroundColor:C.card,...C.shadow}}>
   <Text style={{color:C.tx,fontWeight:'700',fontSize:16}}>{SAIR.name}</Text><Muted>{SAIR.address}</Muted>
   <ContactButtons text={x?`Assalam o Alaikum, I want details about "${x.title}".`:'Assalam o Alaikum, I want some information.'}/></View>
  {x&&<Muted style={{marginBottom:10}}>Enquiring about: {x.title}</Muted>}
  <InquiryForm button="Send message" listingId={id} types={[['contact','Contact']]}/></Screen>}
