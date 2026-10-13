import React,{memo,useState,useCallback} from 'react';
import {View,Text,Pressable} from 'react-native';
import {Image} from 'expo-image';
import {LinearGradient} from 'expo-linear-gradient';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import Animated,{useSharedValue,useAnimatedStyle,withSpring,withSequence} from 'react-native-reanimated';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import OfferSheet from './OfferSheet';
import {useC,type,cover,sized,priceText,isNew,AREA,agentId} from '../theme';
import {propType,TYPE_LABEL} from '../lib/propertyMeta';
import {tap} from '../lib/haptics';
const AP=Animated.createAnimatedComponent(Pressable);

const Badge=({text,bg,fg='#fff'})=><View style={{backgroundColor:bg,paddingHorizontal:10,paddingVertical:4,borderRadius:999}}><Text style={[type.captionB,{color:fg}]}>{text}</Text></View>;

function Heart({saved,onPress,label}){
 const C=useC(),s=useSharedValue(1),a=useAnimatedStyle(()=>({transform:[{scale:s.value}]}));
 return(<AP accessibilityRole="button" accessibilityLabel={label} onPress={()=>{tap();s.value=withSequence(withSpring(1.35,{damping:6,stiffness:400}),withSpring(1,{damping:8}));onPress()}}
  style={[{width:48,height:48,alignItems:'center',justifyContent:'center'},a]}>
  <View style={{width:36,height:36,borderRadius:18,backgroundColor:'rgba(0,0,0,0.45)',alignItems:'center',justifyContent:'center'}}>
   <Icon name={saved?'heart':'heart-outline'} size={20} color={saved?C.crimson:'#fff'}/></View></AP>)}

// Same props as the old ListingCard (item,width,saved,onOpen,onStar) so List/Saved keep working. Contact details stay locked; agent shown by name + ID only.
function PropertyCard({item,width,saved,onOpen,onStar}){
 const C=useC(),pt=propType(item),[offer,setOffer]=useState(false),sc=useSharedValue(1),a=useAnimatedStyle(()=>({transform:[{scale:sc.value}]}));
 const u=sized(cover(item),width?480:900),place=[item.subtitle,item.city].filter(Boolean).join(' · ');
 const stats=[item.bedrooms!=null&&['bed-outline',item.bedrooms],item.bathrooms!=null&&['shower',item.bathrooms],item.area_size&&['ruler-square',`${+item.area_size} ${AREA[item.area_unit]||''}`.trim()]].filter(Boolean);
 const openOffer=useCallback(()=>setOffer(true),[]),closeOffer=useCallback(()=>setOffer(false),[]);
 return(<Animated.View style={[width?{width}:{marginBottom:16},a]}>
  <AP accessibilityRole="button" accessibilityLabel={item.title} onPress={()=>onOpen(item.id)}
   onPressIn={()=>{sc.value=withSpring(0.975,{damping:18,stiffness:300})}} onPressOut={()=>{sc.value=withSpring(1,{damping:14,stiffness:240})}}
   style={[{borderRadius:20,backgroundColor:C.card,borderWidth:1,borderColor:C.line,overflow:'hidden'},C.shadow]}>
   <View style={{height:width?170:210}}>
    {u?<Image source={{uri:u}} style={{flex:1}} contentFit="cover" transition={200} cachePolicy="memory-disk" recyclingKey={u}/>
     :<View style={{flex:1,backgroundColor:C.skel,alignItems:'center',justifyContent:'center'}}><Icon name="office-building-outline" size={40} color={C.mute}/></View>}
    <LinearGradient pointerEvents="none" colors={['rgba(0,0,0,0.35)','transparent','rgba(0,0,0,0.75)']} locations={[0,0.45,1]} style={{position:'absolute',left:0,right:0,top:0,bottom:0}}/>
    <View pointerEvents="none" style={{position:'absolute',top:12,left:12,flexDirection:'row',gap:6}}>
     <Badge text={item.purpose==='rent'?'FOR RENT':'FOR SALE'} bg={item.purpose==='rent'?'rgba(0,0,0,0.6)':C.crimson}/>
     {!!pt&&!!TYPE_LABEL[pt]&&<Badge text={TYPE_LABEL[pt].toUpperCase()} bg="rgba(0,0,0,0.6)"/>}{isNew(item)&&<Badge text="NEW" bg={C.gold} fg="#0A0A0B"/>}{item.status!=='published'&&<Badge text="DRAFT" bg="rgba(0,0,0,0.6)"/>}</View>
    {!!onStar&&<View style={{position:'absolute',top:4,right:4}}><Heart saved={saved} label={saved?'Remove from saved':'Save'} onPress={()=>onStar(item.id)}/></View>}
    <View pointerEvents="none" style={{position:'absolute',left:12,bottom:12}}>
     <GlassCard r={999} intensity={30} style={{paddingHorizontal:14,paddingVertical:7}}><Text style={[type.bodyB,{color:'#fff'}]}>{priceText(item,true)||'Price on request'}</Text></GlassCard></View>
   </View>
   <View style={{padding:14}}>
    <Text numberOfLines={1} style={[type.bodyB,{color:C.tx}]}>{item.title}</Text>
    {!!place&&<View style={{flexDirection:'row',alignItems:'center',gap:4,marginTop:3}}><Icon name="map-marker" size={15} color={C.crimson}/><Text numberOfLines={1} style={[type.small,{color:C.mute,flex:1}]}>{place}</Text></View>}
    {stats.length>0&&<View style={{flexDirection:'row',gap:16,marginTop:10}}>{stats.map(([ic,v])=><View key={ic} style={{flexDirection:'row',alignItems:'center',gap:5}}><Icon name={ic} size={17} color={C.mute}/><Text style={[type.smallB,{color:C.tx}]}>{v}</Text></View>)}</View>}
    <View style={{marginTop:12,paddingTop:12,borderTopWidth:1,borderTopColor:C.line}}>
     <View style={{flexDirection:'row',alignItems:'center',gap:5}}>{!!item.agent_verified&&<Icon name="check-decagram" size={15} color={C.gold}/>}<Text numberOfLines={1} style={[type.captionB,{color:C.mute,flex:1}]}>{item.agent_name?`${item.agent_name}${item.agent_verified?' · Verified':''} · ${agentId(item)}`:`Agent ID · ${agentId(item)}`}</Text></View>
     <View style={{flexDirection:'row',alignItems:'center',gap:5,marginTop:2}} accessible accessibilityLabel="Contact details locked"><Icon name="lock" size={13} color={C.gold}/><Text style={[type.caption,{color:C.mute}]}>+92 ••• ••••••• · unlock with Pro plan</Text></View>
     <View style={{marginTop:10}}><GradientButton title="Place Your Offer First" icon="flash" height={48} onPress={openOffer}/></View></View>
   </View></AP>
  {offer&&<OfferSheet item={item} onClose={closeOffer}/>}</Animated.View>)}
export default memo(PropertyCard);