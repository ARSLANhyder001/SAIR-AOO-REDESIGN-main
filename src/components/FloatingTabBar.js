import React,{memo,useEffect} from 'react';
import {View,Text,Pressable,Platform} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated,{useSharedValue,useAnimatedStyle,withSpring} from 'react-native-reanimated';
import GlassCard from './GlassCard';
import {useC,type} from '../theme';
import {tap} from '../lib/haptics';
const META={Home:['home-variant','home-variant-outline','Home'],List:['magnify','magnify','Search'],Saved:['heart','heart-outline','Saved'],Account:['account','account-outline','Account'],Menu:['view-grid','view-grid-outline','More']};
const Item=memo(function Item({name,focused,onPress,onLong,label}){
 const C=useC(),a=useSharedValue(focused?1:0);
 useEffect(()=>{a.value=withSpring(focused?1:0,{damping:12,stiffness:220})},[focused,a]);
 const ic=useAnimatedStyle(()=>({transform:[{translateY:-3*a.value},{scale:1+0.18*a.value}]})),dot=useAnimatedStyle(()=>({opacity:a.value,transform:[{scale:a.value}]}));
 const m=META[name]||META.Home;
 return(<Pressable accessibilityRole="tab" accessibilityState={{selected:focused}} accessibilityLabel={label} onPress={onPress} onLongPress={onLong} style={{flex:1,minHeight:56,alignItems:'center',justifyContent:'center'}}>
  <Animated.View style={[ic,focused&&{shadowColor:C.crimson,shadowOpacity:0.9,shadowRadius:12,shadowOffset:{width:0,height:0},elevation:0}]}>
   <Icon name={focused?m[0]:m[1]} size={26} color={focused?C.red2:C.mute}/></Animated.View>
  <Text style={[type.captionB,{fontSize:11,color:focused?C.red2:C.mute,marginTop:2}]}>{m[2]}</Text>
  <Animated.View style={[dot,{position:'absolute',bottom:2,width:5,height:5,borderRadius:3,backgroundColor:C.crimson}]}/></Pressable>)});
// Floating, rounded glass bar. Pass as <Tab.Navigator tabBar={p=><FloatingTabBar {...p}/>}>
export default function FloatingTabBar({state,descriptors,navigation}){
 const ins=useSafeAreaInsets();
 return(<View pointerEvents="box-none" style={{position:'absolute',left:14,right:14,bottom:Math.max(ins.bottom,10)}}>
  <GlassCard r={32} intensity={60} glow style={{paddingHorizontal:6}}>
   <View style={{flexDirection:'row'}}>
    {state.routes.map((r,i)=>{const focused=state.index===i,{options}=descriptors[r.key];
     const press=()=>{const e=navigation.emit({type:'tabPress',target:r.key,canPreventDefault:true});if(!focused&&!e.defaultPrevented){tap();navigation.navigate(r.name,r.params)}};
     return <Item key={r.key} name={r.name} focused={focused} label={options.tabBarAccessibilityLabel||META[r.name]?.[2]||r.name} onPress={press} onLong={()=>navigation.emit({type:'tabLongPress',target:r.key})}/>})}</View></GlassCard></View>)}
