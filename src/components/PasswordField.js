import React from 'react';
import {View,Pressable} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {Field} from './ui';
import {useC} from '../theme';
// Password box with a show / hide eye (floating label like every other field).
export default function PasswordField({show,onToggle,placeholder,...p}){
 const C=useC();
 return(<View><Field placeholder={placeholder} autoCapitalize="none" autoCorrect={false} {...p} secureTextEntry={!show} style={{paddingRight:52}}/>
  <Pressable onPress={onToggle} accessibilityRole="button" accessibilityLabel={show?'Hide password':'Show password'} style={{position:'absolute',right:0,top:0,width:52,height:56,alignItems:'center',justifyContent:'center'}}>
   <Icon name={show?'eye-off-outline':'eye-outline'} size={22} color={C.mute}/></Pressable></View>)}
