import React,{useEffect,useState,useCallback} from 'react';
import {Modal,View,Text,Pressable,KeyboardAvoidingView,Platform,StyleSheet,useWindowDimensions} from 'react-native';
import {BlurView} from 'expo-blur';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated,{useSharedValue,useAnimatedStyle,withTiming,Easing} from 'react-native-reanimated';
import {useC,type} from '../theme';
// Glass bottom sheet. Mount it only while open: {open&&<BottomSheet onClose={...}>}. Backdrop tap / close button / Android back dismiss.
export default function BottomSheet({title,onClose,children}){
 const C=useC(),ins=useSafeAreaInsets(),{height}=useWindowDimensions(),y=useSharedValue(height),bd=useSharedValue(0);
 useEffect(()=>{y.value=withTiming(0,{duration:320,easing:Easing.out(Easing.cubic)});bd.value=withTiming(1,{duration:260})},[y,bd]);
 const close=useCallback(()=>{bd.value=withTiming(0,{duration:200});y.value=withTiming(height,{duration:240,easing:Easing.in(Easing.cubic)});setTimeout(onClose,250)},[y,bd,height,onClose]);
 const sheet=useAnimatedStyle(()=>({transform:[{translateY:y.value}]})),back=useAnimatedStyle(()=>({opacity:bd.value}));
 return(<Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={close}>
  <KeyboardAvoidingView style={{flex:1,justifyContent:'flex-end'}} behavior={Platform.OS==='ios'?'padding':undefined}>
   <Animated.View style={[StyleSheet.absoluteFill,{backgroundColor:C.scrim},back]}><Pressable style={{flex:1}} onPress={close} accessibilityLabel="Close sheet"/></Animated.View>
   <Animated.View style={[{borderTopLeftRadius:24,borderTopRightRadius:24,overflow:'hidden',borderWidth:1,borderBottomWidth:0,borderColor:C.glassBorder,backgroundColor:C.dark?'rgba(20,20,22,0.92)':'rgba(255,255,255,0.96)',maxHeight:height*0.85},sheet]}>
    {Platform.OS==='ios'&&<BlurView intensity={50} tint={C.blurTint} style={StyleSheet.absoluteFill}/>}
    <View style={{padding:16,paddingBottom:Math.max(ins.bottom,16)+8}}>
     <View style={{alignSelf:'center',width:40,height:4,borderRadius:2,backgroundColor:C.glassBorder,marginBottom:12}}/>
     <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
      <Text accessibilityRole="header" style={[type.h3,{color:C.tx,flex:1}]}>{title}</Text>
      <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" style={{width:48,height:48,alignItems:'center',justifyContent:'center'}}><Icon name="close" size={24} color={C.tx}/></Pressable></View>
     {children}</View></Animated.View></KeyboardAvoidingView></Modal>)}
