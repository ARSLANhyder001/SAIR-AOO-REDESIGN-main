import React from 'react';
import {Modal,View,Text,ScrollView,Pressable} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import GradientButton from './GradientButton';
import {useC,type} from '../theme';
import {TERMS,TERMS_VERSION} from '../lib/terms';
export default function TermsModal({onClose}){
 const C=useC(),ins=useSafeAreaInsets();
 return(<Modal visible animationType="slide" onRequestClose={onClose} statusBarTranslucent>
  <View style={{flex:1,backgroundColor:C.bg,paddingTop:ins.top+8}}>
   <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:16}}><Text accessibilityRole="header" style={[type.h2,{color:C.tx,flex:1}]}>Offer terms</Text>
    <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={{width:48,height:48,alignItems:'center',justifyContent:'center'}}><Icon name="close" size={26} color={C.tx}/></Pressable></View>
   <ScrollView contentContainerStyle={{padding:16,paddingBottom:24}}>
    {TERMS.map(([h,t])=><View key={h} style={{marginBottom:16}}><Text style={[type.bodyB,{color:C.tx}]}>{h}</Text><Text style={[type.small,{color:C.mute,marginTop:4}]}>{t}</Text></View>)}
    <Text style={[type.caption,{color:C.mute}]}>Version {TERMS_VERSION}</Text></ScrollView>
   <View style={{padding:16,paddingBottom:Math.max(ins.bottom,16)}}><GradientButton title="Close" onPress={onClose}/></View></View></Modal>)}
