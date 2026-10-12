import React from 'react';
import {View} from 'react-native';
import {Btn} from './ui';
import {SAIR,hasPhone} from '../config';
import {call,whatsapp} from '../lib/contact';
export default function ContactButtons({text}){
 if(!hasPhone)return null;
 return(<View style={{flexDirection:'row',gap:10}}>
  <View style={{flex:1}}><Btn title="Call" icon="phone" onPress={()=>call(SAIR.phone)}/></View>
  <View style={{flex:1}}><Btn title="WhatsApp" icon="whatsapp" onPress={()=>whatsapp(SAIR.whatsapp,text)}/></View></View>)}
