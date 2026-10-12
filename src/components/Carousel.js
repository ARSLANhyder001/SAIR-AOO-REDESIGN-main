import React,{useRef,useEffect,useCallback,memo} from 'react';
import {View,Text,Pressable,useWindowDimensions} from 'react-native';
import {Image} from 'expo-image';
import {LinearGradient} from 'expo-linear-gradient';
import Animated,{useSharedValue,useAnimatedScrollHandler,useAnimatedStyle,interpolate,Extrapolation} from 'react-native-reanimated';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import {useC,type,cover,sized,priceText} from '../theme';
import {tap} from '../lib/haptics';
const GAP=12;

const Slide=memo(function Slide({item,index,x,cw,itemW,onOpen}){
 const C=useC(),u=sized(cover(item),700);
 const range=[(index-1)*itemW,index*itemW,(index+1)*itemW];
 const card=useAnimatedStyle(()=>({
  opacity:interpolate(x.value,range,[0.55,1,0.55],Extrapolation.CLAMP),
  transform:[{perspective:900},{scale:interpolate(x.value,range,[0.85,1,0.85],Extrapolation.CLAMP)},{rotateY:`${interpolate(x.value,range,[-24,0,24],Extrapolation.CLAMP)}deg`}]}));
 const par=useAnimatedStyle(()=>({transform:[{translateX:interpolate(x.value,range,[-cw*0.14,0,cw*0.14],Extrapolation.CLAMP)}]}));
 return(<View style={{width:itemW,alignItems:'center'}}>
  <Animated.View style={[{width:cw,height:cw*1.2,borderRadius:24,overflow:'hidden',backgroundColor:C.card},C.glow,card]}>
   <Pressable accessibilityRole="button" accessibilityLabel={`View ${item.title}`} onPress={()=>onOpen(item.id)} style={{flex:1}}>
    <Animated.View style={[{position:'absolute',top:0,bottom:0,left:-cw*0.15,width:cw*1.3},par]}>
     {u?<Image source={{uri:u}} style={{flex:1}} contentFit="cover" cachePolicy="memory-disk" recyclingKey={u} transition={200}/>:<View style={{flex:1,backgroundColor:C.skel}}/>}</Animated.View>
    <LinearGradient pointerEvents="none" colors={['transparent','rgba(0,0,0,0.85)']} locations={[0.35,1]} style={{position:'absolute',left:0,right:0,top:0,bottom:0}}/>
    <View style={{position:'absolute',left:14,right:14,bottom:14}}>
     <GlassCard r={999} intensity={30} style={{alignSelf:'flex-start',paddingHorizontal:12,paddingVertical:5,marginBottom:8}}><Text style={[type.captionB,{color:'#fff'}]}>{priceText(item,true)||[item.subtitle,item.city].filter(Boolean).join(' · ')||'Featured'}</Text></GlassCard>
     <Text numberOfLines={2} style={[type.h3,{color:'#fff'}]}>{item.title}</Text>
     {!!item.city&&<View style={{flexDirection:'row',alignItems:'center',gap:4,marginTop:2}}><Icon name="map-marker" size={14} color="#fff"/><Text style={[type.small,{color:'rgba(255,255,255,0.85)'}]}>{item.city}</Text></View>}
    </View></Pressable></Animated.View></View>)});

function Dot({i,x,itemW}){
 const C=useC(),s=useAnimatedStyle(()=>({width:interpolate(x.value,[(i-1)*itemW,i*itemW,(i+1)*itemW],[8,22,8],Extrapolation.CLAMP),opacity:interpolate(x.value,[(i-1)*itemW,i*itemW,(i+1)*itemW],[0.4,1,0.4],Extrapolation.CLAMP)}));
 return <Animated.View style={[{height:8,borderRadius:4,backgroundColor:C.crimson},s]}/>}

// Coverflow carousel: centre card 1.0, sides 0.85 + fade + rotateY, parallax image, dots, autoplay that pauses while touched.
export default function Carousel({data,onOpen,autoplayMs=3800}){
 const {width}=useWindowDimensions(),cw=Math.min(width*0.66,300),itemW=cw+GAP,pad=(width-itemW)/2;
 const x=useSharedValue(0),list=useRef(null),idx=useRef(0),paused=useRef(false),resume=useRef(null);
 const onScroll=useAnimatedScrollHandler(e=>{x.value=e.contentOffset.x});
 const pause=useCallback(()=>{paused.current=true;clearTimeout(resume.current)},[]);
 const later=useCallback(()=>{clearTimeout(resume.current);resume.current=setTimeout(()=>{paused.current=false},4000)},[]);
 const settle=useCallback(e=>{const i=Math.round(e.nativeEvent.contentOffset.x/itemW);if(i!==idx.current)tap();idx.current=i;later()},[itemW,later]);
 useEffect(()=>{if(data.length<2)return;const t=setInterval(()=>{if(paused.current)return;const n=(idx.current+1)%data.length;idx.current=n;list.current?.scrollToOffset({offset:n*itemW,animated:true})},autoplayMs);
  return()=>{clearInterval(t);clearTimeout(resume.current)}},[data.length,itemW,autoplayMs]);
 const render=useCallback(({item,index})=><Slide item={item} index={index} x={x} cw={cw} itemW={itemW} onOpen={onOpen}/>,[x,cw,itemW,onOpen]);
 return(<View>
  <Animated.FlatList ref={list} data={data} keyExtractor={i=>i.id} horizontal showsHorizontalScrollIndicator={false} renderItem={render}
   snapToInterval={itemW} decelerationRate="fast" contentContainerStyle={{paddingHorizontal:pad,paddingVertical:24}}
   getItemLayout={(_,i)=>({length:itemW,offset:itemW*i,index:i})} windowSize={5} initialNumToRender={3} maxToRenderBatch={3}
   onScroll={onScroll} scrollEventThrottle={16} onTouchStart={pause} onScrollBeginDrag={pause} onMomentumScrollEnd={settle} onTouchEnd={later}/>
  {data.length>1&&<View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:6,marginTop:-4}}>{data.map((d,i)=><Dot key={d.id} i={i} x={x} itemW={itemW}/>)}</View>}</View>)}
