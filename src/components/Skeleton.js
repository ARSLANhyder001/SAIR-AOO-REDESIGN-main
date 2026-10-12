import React,{useEffect,memo} from 'react';
import {View} from 'react-native';
import Animated,{useSharedValue,useAnimatedStyle,withRepeat,withTiming,Easing} from 'react-native-reanimated';
import {useC} from '../theme';
// One shared pulse per skeleton, runs on the UI thread.
export function Skeleton({style,r=16}){
 const C=useC(),o=useSharedValue(0.4);
 useEffect(()=>{o.value=withRepeat(withTiming(0.9,{duration:750,easing:Easing.inOut(Easing.quad)}),-1,true)},[o]);
 const a=useAnimatedStyle(()=>({opacity:o.value}));
 return <Animated.View accessibilityLabel="Loading" style={[{backgroundColor:C.skel,borderRadius:r},a,style]}/>}
export const PropertyCardSkeleton=memo(()=>(<View style={{marginBottom:16,gap:10}}>
 <Skeleton style={{height:200}} r={20}/><Skeleton style={{height:18,width:'70%'}} r={8}/><Skeleton style={{height:14,width:'45%'}} r={8}/></View>));
export const CarouselSkeleton=memo(()=>(<View style={{alignItems:'center',paddingVertical:16}}><Skeleton style={{width:'66%',height:300}} r={24}/></View>));
export const TileRowSkeleton=memo(()=>(<View style={{flexDirection:'row',gap:12,paddingHorizontal:16}}>{[0,1,2].map(i=><Skeleton key={i} style={{width:132,height:132}}/>)}</View>));
