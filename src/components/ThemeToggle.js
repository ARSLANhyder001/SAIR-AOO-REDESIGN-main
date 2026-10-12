import React from 'react';
import {View,Text,Pressable} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {useTheme,type} from '../theme';
import {tap} from '../lib/haptics';
const THEMES=[['system','System','theme-light-dark'],['light','Light','white-balance-sunny'],['dark','Dark','weather-night']];
export default function ThemeToggle(){
 const {C,mode,setMode}=useTheme();
 return(<View style={{flexDirection:'row',backgroundColor:C.soft,borderRadius:18,padding:4}}>
  {THEMES.map(([v,l,ic])=>{const a=mode===v;return <Pressable key={v} onPress={()=>{tap();setMode(v)}} accessibilityRole="tab" accessibilityState={{selected:a}} style={{flex:1,minHeight:48,flexDirection:'row',gap:6,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:a?C.card:'transparent'}}>
   <Icon name={ic} size={18} color={a?C.red2:C.mute}/><Text style={[type.smallB,{color:a?C.red2:C.mute}]}>{l}</Text></Pressable>})}</View>)}
