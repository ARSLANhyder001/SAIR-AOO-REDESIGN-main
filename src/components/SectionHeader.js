import React,{memo} from 'react';
import {View,Text,Pressable} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {useC,type,spacing} from '../theme';
function SectionHeader({title,subtitle,action,onAction}){
 const C=useC();
 return(<View style={{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',paddingHorizontal:spacing.lg,marginBottom:spacing.md}}>
  <View style={{flex:1}}>
   <Text accessibilityRole="header" style={[type.h3,{color:C.tx}]}>{title}</Text>
   {!!subtitle&&<Text style={[type.small,{color:C.mute,marginTop:2}]}>{subtitle}</Text>}</View>
  {!!action&&<Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={action} style={{minHeight:48,justifyContent:'center',flexDirection:'row',alignItems:'center'}}>
   <Text style={[type.smallB,{color:C.red2}]}>{action}</Text><Icon name="chevron-right" size={18} color={C.red2}/></Pressable>}</View>)}
export default memo(SectionHeader);
