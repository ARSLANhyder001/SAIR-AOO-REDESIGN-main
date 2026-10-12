import React,{useState,useEffect,memo} from 'react';
import {Pressable,Text,TextInput,View,ScrollView,FlatList,RefreshControl,Modal,KeyboardAvoidingView,Platform,useWindowDimensions} from 'react-native';
import {SafeAreaView,useSafeAreaInsets} from 'react-native-safe-area-context';
import {Image} from 'expo-image';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import Animated,{useSharedValue,useAnimatedStyle,withTiming,interpolate} from 'react-native-reanimated';
import {useC,cover,sized,type} from '../theme';
import GradientButton from './GradientButton';
import MultiChips from './MultiChips';
import {Skeleton} from './Skeleton';
export {Skeleton};

/* Shared building blocks used by Login/Signup, Contact, Buy-Sell, Admin, Menu … all restyled here in one place. */
export {LinearGradient as Grad} from 'expo-linear-gradient';

const Shell=({children,top})=>{const C=useC();return(
 <SafeAreaView edges={top?['top']:[]} style={{flex:1,backgroundColor:C.bg}}>
  <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>{children}</KeyboardAvoidingView></SafeAreaView>)};
// tab = screen lives under the floating tab bar → extra bottom space.
export const Screen=({children,top=true,onRefresh,refreshing,scrollRef,pad=16,tab})=>{const C=useC();return(
 <Shell top={top}>
  <ScrollView ref={scrollRef} refreshControl={onRefresh?<RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={C.crimson}/>:undefined}
   contentContainerStyle={{padding:pad,paddingBottom:tab?130:pad?40:0}} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
   <View style={{width:'100%',maxWidth:720,alignSelf:'center'}}>{children}</View></ScrollView></Shell>)};
export const Page=({children,top=true})=><Shell top={top}><View style={{flex:1,width:'100%',maxWidth:720,alignSelf:'center'}}>{children}</View></Shell>;
export const H=({children})=>{const C=useC();return <Text accessibilityRole="header" style={[type.h2,{color:C.tx,marginVertical:14}]}>{children}</Text>};
export const Muted=({children,style})=>{const C=useC();return <Text style={[type.small,{color:C.mute},style]}>{children}</Text>};
export const Empty=({text,icon='home-search-outline'})=>{const C=useC();return(<View style={{alignItems:'center',paddingVertical:36,gap:12}}>
 <View style={[{width:72,height:72,borderRadius:36,alignItems:'center',justifyContent:'center',backgroundColor:C.tint}]}><Icon name={icon} size={32} color={C.crimson}/></View>
 <Text style={[type.small,{color:C.mute,textAlign:'center',paddingHorizontal:24}]}>{text}</Text></View>)};
export const Btn=({title,onPress,ghost,disabled,icon})=><GradientButton title={title} onPress={onPress} ghost={ghost} disabled={disabled} icon={icon} style={{marginTop:10}}/>;

// Floating-label input: the old `placeholder` becomes the label that floats up when focused / filled.
export const Field=({onFocus,onBlur,value,placeholder,multiline,style,...p})=>{
 const C=useC(),[f,setF]=useState(false),up=f||(value!=null&&String(value).length>0),t=useSharedValue(up?1:0);
 useEffect(()=>{t.value=withTiming(up?1:0,{duration:160})},[up,t]);
 const lab=useAnimatedStyle(()=>({top:interpolate(t.value,[0,1],[multiline?17:17,7]),fontSize:interpolate(t.value,[0,1],[16,11])}));
 return(<View style={{marginBottom:10}}>
  <TextInput accessibilityLabel={placeholder} value={value} multiline={multiline} {...p}
   onFocus={e=>{setF(true);onFocus&&onFocus(e)}} onBlur={e=>{setF(false);onBlur&&onBlur(e)}} placeholderTextColor={C.mute}
   style={[type.body,{color:C.tx,backgroundColor:C.glassFill,borderWidth:1,borderColor:f?C.crimson:C.glassBorder,borderRadius:16,paddingHorizontal:16,paddingTop:24,paddingBottom:8,minHeight:56},multiline&&{height:110,textAlignVertical:'top'},style]}/>
  <Animated.Text pointerEvents="none" numberOfLines={1} style={[{position:'absolute',left:17,right:17,color:f?C.red2:C.mute,fontFamily:type.small.fontFamily},lab]}>{placeholder}</Animated.Text></View>)};

export const Chips=memo(({options,value,onChange})=><View style={{marginBottom:10}}><MultiChips options={options} value={value} onChange={onChange}/></View>);
export const PillRow=memo(({options,value,onChange})=>{const C=useC();return(
 <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexGrow:0}} contentContainerStyle={{gap:8,paddingVertical:6}} keyboardShouldPersistTaps="handled">
  {options.map(([v,l])=>{const a=value===v;return <Pressable key={v} accessibilityRole="button" accessibilityState={{selected:a}} onPress={()=>onChange(v)} style={{minHeight:44,paddingHorizontal:16,justifyContent:'center',borderRadius:999,borderWidth:1,borderColor:a?C.crimson:C.glassBorder,backgroundColor:a?C.crimson:C.glassFill}}><Text style={[type.smallB,{color:a?'#fff':C.tx}]}>{l}</Text></Pressable>})}</ScrollView>)});
export const SearchBar=({value,onChangeText,onSubmitEditing})=>{const C=useC();return(
 <View style={{flexDirection:'row',alignItems:'center',gap:10,minHeight:52,paddingHorizontal:16,borderRadius:26,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill}}><Icon name="magnify" size={22} color={C.mute}/>
  <TextInput accessibilityLabel="Search" value={value} onChangeText={onChangeText} onSubmitEditing={onSubmitEditing} returnKeyType="search" autoCorrect={false} placeholder="Search" placeholderTextColor={C.mute} style={[type.body,{flex:1,color:C.tx}]}/>
  {!!value&&<Pressable onPress={()=>onChangeText('')} hitSlop={10} accessibilityLabel="Clear search"><Icon name="close-circle" size={20} color={C.mute}/></Pressable>}</View>)};
export const Badge=({text,dark})=><View style={{backgroundColor:dark?'rgba(0,0,0,0.6)':'#E11D2E',paddingHorizontal:10,paddingVertical:4,borderRadius:999}}><Text style={[type.captionB,{color:'#fff'}]}>{text}</Text></View>;
export const Thumb=memo(({item,style,w=480})=>{const C=useC(),u=sized(cover(item),w);return u
 ?<Image source={{uri:u}} style={style} contentFit="cover" transition={200} cachePolicy="memory-disk" recyclingKey={u}/>
 :<View style={[style,{backgroundColor:C.skel,alignItems:'center',justifyContent:'center'}]}><Icon name="office-building-outline" size={38} color={C.mute}/></View>});
export const Loading=()=><View accessibilityLabel="Loading" style={{gap:10,paddingVertical:16}}>{[0,1,2].map(k=><Skeleton key={k} style={{height:70}}/>)}</View>;
export const ErrorBox=({text,onRetry})=>(<View style={{alignItems:'center',paddingVertical:24,gap:4}}><Muted>{text}</Muted><View style={{width:170}}><Btn ghost title="Try again" icon="refresh" onPress={onRetry}/></View></View>);

export function Gallery({item,height=240}){
 const C=useC(),imgs=item.images?.length?item.images:(item.image_url?[item.image_url]:[]);
 const [w,setW]=useState(0),[i,setI]=useState(0),[full,setFull]=useState(false);
 const {width:sw,height:sh}=useWindowDimensions(),ins=useSafeAreaInsets();
 if(!imgs.length)return <Thumb item={item} style={{height,width:'100%'}}/>;
 return(<View onLayout={e=>setW(e.nativeEvent.layout.width)} style={{height}}>
  {w>0&&<FlatList horizontal pagingEnabled showsHorizontalScrollIndicator={false} data={imgs} keyExtractor={(u,k)=>u+k}
   getItemLayout={(_,k)=>({length:w,offset:w*k,index:k})} initialNumToRender={1} windowSize={3}
   onMomentumScrollEnd={e=>setI(Math.round(e.nativeEvent.contentOffset.x/w))}
   renderItem={({item:u})=><Pressable onPress={()=>setFull(true)} accessibilityLabel="Open photo full screen"><Image source={{uri:sized(u,900)}} style={{width:w,height}} contentFit="cover" transition={200} cachePolicy="memory-disk"/></Pressable>}/>}
  {imgs.length>1&&<View pointerEvents="none" style={{position:'absolute',bottom:36,alignSelf:'center',flexDirection:'row',gap:6}}>
   {imgs.map((_,k)=><View key={k} style={{width:k===i?20:8,height:8,borderRadius:4,backgroundColor:k===i?C.crimson:'rgba(255,255,255,.6)'}}/>)}</View>}
  <Modal visible={full} transparent animationType="fade" statusBarTranslucent onRequestClose={()=>setFull(false)}>
   <View style={{flex:1,backgroundColor:'#000'}}>
    <FlatList horizontal pagingEnabled data={imgs} initialScrollIndex={i} keyExtractor={(u,k)=>u+k} showsHorizontalScrollIndicator={false}
     getItemLayout={(_,k)=>({length:sw,offset:sw*k,index:k})}
     renderItem={({item:u})=><Pressable onPress={()=>setFull(false)}><Image source={{uri:u}} style={{width:sw,height:sh}} contentFit="contain" cachePolicy="memory-disk"/></Pressable>}/>
    <Pressable onPress={()=>setFull(false)} hitSlop={12} accessibilityLabel="Close" style={{position:'absolute',top:ins.top+10,right:16,width:48,height:48,alignItems:'center',justifyContent:'center'}}><Icon name="close" size={30} color="#fff"/></Pressable></View></Modal></View>)}
