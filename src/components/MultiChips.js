import React,{memo} from 'react';
import {View,Text,Pressable} from 'react-native';
import {useC,type} from '../theme';
import {tap} from '../lib/haptics';
// Glass-style chips. single: value is one id, onChange(id). multi: value is an array, onChange(newArray). 48px touch height.
function MultiChips({options,value,onChange,multi}){
 const C=useC();
 const on=v=>multi?value.includes(v):value===v;
 const press=v=>{tap();onChange(multi?(value.includes(v)?value.filter(k=>k!==v):[...value,v]):v)};
 return(<View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
  {options.map(o=>{const v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o,a=on(v);
   return <Pressable key={v} accessibilityRole="button" accessibilityState={{selected:a}} onPress={()=>press(v)}
    style={{minHeight:40,paddingHorizontal:14,justifyContent:'center',borderRadius:999,borderWidth:1,borderColor:a?C.crimson:C.glassBorder,backgroundColor:a?C.tint:C.glassFill}}>
    <Text style={[type.smallB,{color:a?C.red2:C.tx}]}>{l}</Text></Pressable>})}</View>)}
export default memo(MultiChips);
