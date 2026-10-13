import React,{useMemo,useState,useCallback} from 'react';
import {View,Text,Share,Pressable,ScrollView} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Gallery,Empty} from '../components/ui';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import OfferSheet from '../components/OfferSheet';
import PropertyMap from '../components/PropertyMap';
import NearbyCard from '../components/NearbyCard';
import InstallmentCalc from '../components/InstallmentCalc';
import {useApp} from '../store';
import {SAIR,hasPhone} from '../config';
import {call,whatsapp} from '../lib/contact';
import {useC,type,priceText,fmt,isNew,agentId} from '../theme';
import {propType,propCategory,TYPE_LABEL,CAT_LABEL,TYPE_ICON,areaText,areaMarla} from '../lib/propertyMeta';
import {tap} from '../lib/haptics';
import useContact from '../lib/useContact';

const SERVICES=[['file-document-check-outline','Legal & documentation','Transfer, registry, verification'],['calculator-variant-outline','Estimation & BOQ','Build or renovate cost'],['hammer-wrench','Renovation','Repairs & upgrades'],['sofa-outline','Interior design','Make it yours']];
const Section=({title,children,C})=><View style={{marginTop:24}}><Text accessibilityRole="header" style={[type.h3,{color:C.tx,marginBottom:12}]}>{title}</Text>{children}</View>;

export default function DetailScreen({navigation,route}){
 const C=useC(),ins=useSafeAreaInsets(),{listings,favs,toggleFav}=useApp(),[offer,setOffer]=useState(false),x=useMemo(()=>listings.find(l=>l.id===route.params.id),[listings,route.params.id]);
 const closeOffer=useCallback(()=>setOffer(false),[]),{unlock,isPaid}=useContact();
 const reach=async k=>{const d=await unlock(x.id);if(d)k==='call'?call(d.phone):whatsapp(d.whatsapp,`Assalam o Alaikum, I am interested in "${x.title}"${x.city?` (${x.city})`:''}. Please share details.`)};
 if(!x)return <View style={{flex:1,backgroundColor:C.bg}}><Empty text="Listing not found."/></View>;
 const t=propType(x),cat=propCategory(x),mar=areaMarla(x),isProp=x.kind==='property';
 const save=async()=>{if(!(await toggleFav(x.id)))navigation.navigate('Account')};
 const msg=`Assalam o Alaikum, I am interested in "${x.title}"${x.city?` (${x.city})`:''}. Please share details.`;
 const share=()=>Share.share({message:`${x.title}${x.city?` - ${x.city}`:''}${x.price?`\n${priceText(x)}`:''}\n${SAIR.name}`}).catch(()=>{});
 const ppm=x.price&&mar&&x.purpose!=='rent'?Math.round(Number(x.price)/mar):null;
 const rows=[
  t&&['Type',TYPE_LABEL[t],TYPE_ICON[t]||'home-outline'],cat&&['Category',CAT_LABEL[cat],'shape-outline'],['Purpose',x.purpose==='rent'?'For rent':'For sale','tag-outline'],
  areaText(x)&&['Area',areaText(x),'ruler-square'],x.bedrooms!=null&&['Bedrooms',x.bedrooms,'bed-outline'],x.bathrooms!=null&&['Bathrooms',x.bathrooms,'shower'],
  x.floors!=null&&['Floors',x.floors,'layers-outline'],x.year_built&&['Year built',x.year_built,'calendar-outline'],ppm&&['Price / marla',fmt(ppm),'cash'],
  x.created_at&&['Listed',new Date(x.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),'clock-outline']].filter(Boolean);
 const IconBtn=({name,label,onPress})=><Pressable accessibilityRole="button" accessibilityLabel={label} onPress={()=>{tap();onPress()}} style={{width:52,height:52}}><GlassCard r={26} intensity={50} style={{width:52,height:52,alignItems:'center',justifyContent:'center'}}><Icon name={name} size={24} color={C.red2}/></GlassCard></Pressable>;
 return(<View style={{flex:1,backgroundColor:C.bg}}>
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:130}}>
   <View><Gallery item={x} height={300}/>
    <View pointerEvents="none" style={{position:'absolute',top:12,left:12,flexDirection:'row',gap:6}}>
     <View style={{backgroundColor:x.purpose==='rent'?'rgba(0,0,0,0.6)':C.crimson,paddingHorizontal:10,paddingVertical:4,borderRadius:999}}><Text style={[type.captionB,{color:'#fff'}]}>{x.purpose==='rent'?'FOR RENT':'FOR SALE'}</Text></View>
     {isNew(x)&&<View style={{backgroundColor:C.gold,paddingHorizontal:10,paddingVertical:4,borderRadius:999}}><Text style={[type.captionB,{color:'#0A0A0B'}]}>NEW</Text></View>}</View></View>
   <View style={{padding:16,marginTop:-24,borderTopLeftRadius:28,borderTopRightRadius:28,backgroundColor:C.bg}}>
    <Text style={[type.h1,{color:C.red2}]}>{priceText(x)||'Price on request'}</Text>
    <Text style={[type.h3,{color:C.tx,marginTop:6}]}>{x.title}</Text>
    <View style={{flexDirection:'row',alignItems:'center',gap:4,marginTop:4}}><Icon name="map-marker" size={17} color={C.crimson}/><Text style={[type.small,{color:C.mute,flex:1}]}>{[x.address,x.subtitle,x.city].filter(Boolean).join(' · ')}</Text></View>
    <View style={{flexDirection:'row',gap:10,marginTop:14}}>
     <View style={{flex:1}}><GradientButton ghost icon={favs.has(x.id)?'heart':'heart-outline'} title={favs.has(x.id)?'Saved':'Save'} onPress={save}/></View>
     <View style={{flex:1}}><GradientButton ghost icon="share-variant-outline" title="Share" onPress={share}/></View></View>

    {rows.length>0&&<Section title="Property details" C={C}><GlassCard r={20} padding={4}>
     <View style={{flexDirection:'row',flexWrap:'wrap'}}>{rows.map(([l,v,ic])=>(
      <View key={l} style={{width:'50%',padding:12,flexDirection:'row',gap:10,alignItems:'center'}} accessible accessibilityLabel={`${l}: ${v}`}>
       <View style={{width:36,height:36,borderRadius:18,backgroundColor:C.tint,alignItems:'center',justifyContent:'center'}}><Icon name={ic} size={18} color={C.crimson}/></View>
       <View style={{flex:1}}><Text style={[type.caption,{color:C.mute}]}>{l}</Text><Text style={[type.smallB,{color:C.tx}]} numberOfLines={1}>{String(v)}</Text></View></View>))}</View></GlassCard></Section>}

    {!!x.features?.length&&<Section title="Features & facilities" C={C}><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{x.features.map(k=>(
     <View key={k} style={{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:12,minHeight:40,borderRadius:999,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill}}><Icon name="check-circle" size={16} color={C.success}/><Text style={[type.smallB,{color:C.tx}]}>{k}</Text></View>))}</View></Section>}

    {!!x.description&&<Section title={`About this ${x.kind==='project'?'project':'property'}`} C={C}><Text style={[type.body,{color:C.mute}]}>{x.description}</Text></Section>}

    {isProp&&<Section title="Location" C={C}><PropertyMap single items={[x]} height={220} onOpen={()=>{}} title="View on map"/></Section>}
    {isProp&&<View style={{marginTop:16}}><NearbyCard item={x}/></View>}
    {isProp&&x.purpose!=='rent'&&Number(x.price)>0&&<View style={{marginTop:16}}><InstallmentCalc price={Number(x.price)}/></View>}

    <Section title="Services for this property" C={C}>
     <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>{SERVICES.map(([ic,tt,sub])=>(
      <Pressable key={tt} accessibilityRole="button" accessibilityLabel={`${tt}. ${sub}`} onPress={()=>{tap();navigation.navigate('Contact',{listingId:x.id})}} style={{width:'48%'}}>
       <GlassCard r={18} padding={14} style={{minHeight:116}}><Icon name={ic} size={26} color={C.crimson}/><Text style={[type.smallB,{color:C.tx,marginTop:8}]}>{tt}</Text><Text style={[type.caption,{color:C.mute,marginTop:2}]}>{sub}</Text></GlassCard></Pressable>))}</View></Section>

    <GlassCard r={20} padding={16} style={{marginTop:24}}>
     <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
      <View style={{width:44,height:44,borderRadius:22,backgroundColor:C.tint,alignItems:'center',justifyContent:'center'}}><Icon name="account-tie-outline" size={22} color={C.crimson}/></View>
      <View style={{flex:1}}><View style={{flexDirection:'row',alignItems:'center',gap:5}}><Text style={[type.smallB,{color:C.tx}]}>{x.agent_name?`Listed by ${x.agent_name} · ${agentId(x)}`:`Listed by Agent ID · ${agentId(x)}`}</Text>{!!x.agent_verified&&<Icon name="check-decagram" size={16} color={C.gold}/>}</View>
       <View style={{flexDirection:'row',alignItems:'center',gap:5,marginTop:2}}><Icon name="lock" size={13} color={C.gold}/><Text style={[type.caption,{color:C.mute}]}>Contact details unlock with a paid SAIR Pro plan</Text></View></View></View></GlassCard>
   </View></ScrollView>

  <View style={{position:'absolute',left:0,right:0,bottom:0,paddingHorizontal:12,paddingBottom:Math.max(ins.bottom,10)}}>
   <GlassCard r={32} intensity={60} padding={10}><View style={{flexDirection:'row',alignItems:'center',gap:10}}>
    <IconBtn name={isPaid?'phone':'lock'} label={isPaid?'Call':'Call (locked, Pro plan)'} onPress={()=>reach('call')}/>
    <IconBtn name={isPaid?'whatsapp':'lock'} label={isPaid?'WhatsApp':'WhatsApp (locked, Pro plan)'} onPress={()=>reach('wa')}/>
    <View style={{flex:1}}><GradientButton title="Place Your Offer First" icon="flash" onPress={()=>setOffer(true)}/></View></View></GlassCard></View>
  {offer&&<OfferSheet item={x} onClose={closeOffer}/>}</View>)}