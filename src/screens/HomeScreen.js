import React,{useState,useCallback,useMemo,useEffect} from 'react';
import {View,Text,TextInput,Pressable,RefreshControl,StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import Animated,{FadeInDown,useSharedValue,useAnimatedStyle,withRepeat,withTiming,Easing} from 'react-native-reanimated';
import Logo from '../components/Logo';
import GlassCard,{GlassProvider,GlassBackdrop} from '../components/GlassCard';
import ServiceTile from '../components/ServiceTile';
import Carousel from '../components/Carousel';
import PropertyCard from '../components/PropertyCard';
import StatCard from '../components/StatCard';
import PropertyMap from '../components/PropertyMap';
import SectionHeader from '../components/SectionHeader';
import GradientButton from '../components/GradientButton';
import {CarouselSkeleton,PropertyCardSkeleton,TileRowSkeleton} from '../components/Skeleton';
import {useApp} from '../store';
import {useC,type,spacing} from '../theme';
import {tap} from '../lib/haptics';
import useNotifications from '../lib/useNotifications';

// [icon, title, one-liner, route, params] – routes are the existing ones; nothing new in the navigation graph.
const SERVICES=[
 ['crane','Construction','Homes & commercial builds','List',{kind:'project'}],
 ['home-city-outline','Buy / Sell','List or find a property','BuySell'],
 ['key-variant','Rent','Houses, flats, shops','List',{purpose:'rent'}],
 ['hammer-wrench','Renovation','Upgrade & repair','Contact'],
 ['calculator-variant-outline','Estimation & BOQ','Accurate costing','Contact'],
 ['sofa-outline','Interior','Design that fits you','Contact'],
 ['file-document-check-outline','Legal / Docs','Paperwork handled','Contact']];

const greet=()=>{const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening'};

// Reveal: staggered fade-in / slide-up (Reanimated layout animation, runs on UI thread).
const Reveal=({i=0,children,style})=><Animated.View entering={FadeInDown.delay(80+i*90).duration(520).springify().damping(18)} style={style}>{children}</Animated.View>;

function Blob({color,size,top,left,dx,dy,ms}){
 const t=useSharedValue(0);
 useEffect(()=>{t.value=withRepeat(withTiming(1,{duration:ms,easing:Easing.inOut(Easing.sin)}),-1,true)},[t,ms]);
 const a=useAnimatedStyle(()=>({transform:[{translateX:t.value*dx},{translateY:t.value*dy},{scale:1+t.value*0.15}]}));
 return <Animated.View pointerEvents="none" style={[{position:'absolute',top,left,width:size,height:size,borderRadius:size/2,backgroundColor:color},a]}/>}

export default function HomeScreen({navigation}){
 const C=useC(),ins=useSafeAreaInsets(),{published,favs,toggleFav,loading,error,reload}=useApp();
 const {unread}=useNotifications(),[q,setQ]=useState(''),[rf,setRf]=useState(false);
 const featured=useMemo(()=>published.filter(x=>x.kind==='project').slice(0,6),[published]);
 const carouselData=featured.length?featured:published.slice(0,6);
 const latest=useMemo(()=>{const p=published.filter(x=>x.kind==='property');return (p.length?p:published).slice(0,5)},[published]);
 const open=useCallback(id=>navigation.navigate('Detail',{id}),[navigation]);
 const star=useCallback(async id=>{if(!(await toggleFav(id)))navigation.navigate('Account')},[toggleFav,navigation]);
 const refresh=useCallback(async()=>{setRf(true);await reload();setRf(false)},[reload]);
 const empty=!loading&&!carouselData.length;
 return(<GlassProvider style={{backgroundColor:C.bg}}>
  <GlassBackdrop>
   <LinearGradient colors={C.hero} locations={[0,0.35,1]} style={StyleSheet.absoluteFill}/>
   <Blob color={C.dark?'rgba(225,29,46,0.35)':'rgba(225,29,46,0.22)'} size={280} top={-60} left={-80} dx={60} dy={40} ms={7000}/>
   <Blob color={C.dark?'rgba(139,14,26,0.55)':'rgba(245,181,68,0.25)'} size={320} top={180} left={160} dx={-70} dy={60} ms={9000}/></GlassBackdrop>
  <Animated.ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingTop:ins.top+spacing.lg,paddingBottom:120}}
   refreshControl={<RefreshControl refreshing={rf} onRefresh={refresh} tintColor={C.crimson} progressViewOffset={ins.top}/>}>

   {/* 1 · Hero */}
   <Reveal i={0} style={{paddingHorizontal:spacing.lg}}>
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
     <View style={{flex:1}}><Text style={[type.small,{color:C.mute}]}>{greet()} 👋</Text>
      <Text style={[type.h2,{color:C.tx}]} numberOfLines={2}>Build. Buy. Belong.</Text></View>
     <Pressable accessibilityRole="button" accessibilityLabel={`Notifications${unread?`, ${unread} new`:''}`} onPress={()=>{tap();navigation.navigate('Notifications')}} style={{width:48,height:48,marginRight:6}}>
      <GlassCard r={24} style={{width:48,height:48,alignItems:'center',justifyContent:'center'}}><Icon name="bell-outline" size={22} color={C.tx}/></GlassCard>
      {unread>0&&<View style={{position:'absolute',top:2,right:2,minWidth:18,height:18,borderRadius:9,backgroundColor:C.crimson,alignItems:'center',justifyContent:'center',paddingHorizontal:4}}><Text style={[type.captionB,{color:'#fff',fontSize:10}]}>{unread>9?'9+':unread}</Text></View>}</Pressable>
     <Logo size={72}/></View>
    <GlassCard r={999} style={{marginTop:spacing.lg,flexDirection:'row',alignItems:'center',minHeight:56,paddingLeft:18,paddingRight:6,gap:10}}>
     <Icon name="magnify" size={22} color={C.mute}/>
     <TextInput accessibilityLabel="Search projects or properties" value={q} onChangeText={setQ} returnKeyType="search" autoCorrect={false}
      onSubmitEditing={()=>navigation.navigate('List',{q})} placeholder="Search projects or properties" placeholderTextColor={C.mute} style={[type.body,{flex:1,color:C.tx,paddingVertical:12}]}/>
     <Pressable accessibilityRole="button" accessibilityLabel="Filters" onPress={()=>{tap();navigation.navigate('List')}} style={{width:48,height:48,borderRadius:24,overflow:'hidden'}}>
      <LinearGradient colors={C.btnG} style={{flex:1,alignItems:'center',justifyContent:'center'}}><Icon name="tune-variant" size={22} color="#fff"/></LinearGradient></Pressable></GlassCard></Reveal>

   {/* 2 · Services */}
   <Reveal i={1} style={{marginTop:spacing.xl}}>
    <SectionHeader title="Our services" subtitle="Everything under one roof"/>
    <Animated.FlatList horizontal data={SERVICES} keyExtractor={s=>s[1]} showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:spacing.lg,gap:spacing.md}}
     renderItem={({item:[icon,title,line,route,params]})=><ServiceTile icon={icon} title={title} line={line} onPress={()=>navigation.navigate(route,params)}/>}
     initialNumToRender={4} windowSize={3}/></Reveal>

   {/* 3 · Featured projects */}
   <Reveal i={2} style={{marginTop:spacing.xl}}>
    <SectionHeader title="Featured projects" action="See all" onAction={()=>navigation.navigate('List',{kind:'project'})}/>
    {loading?<CarouselSkeleton/>
     :error&&!carouselData.length?<Pressable onPress={reload} accessibilityRole="button" style={{padding:spacing.xl,alignItems:'center',minHeight:48}}><Icon name="wifi-off" size={28} color={C.mute}/><Text style={[type.small,{color:C.mute,marginTop:8,textAlign:'center'}]}>Could not load projects. Tap to retry.</Text></Pressable>
     :empty?<View style={{padding:spacing.xl,alignItems:'center'}}><Icon name="home-search-outline" size={32} color={C.mute}/><Text style={[type.small,{color:C.mute,marginTop:8}]}>No listings yet. Check back soon.</Text></View>
     :<Carousel data={carouselData} onOpen={open}/>}</Reveal>

   {/* 4 · Latest properties */}
   <Reveal i={3} style={{marginTop:spacing.lg}}>
    <SectionHeader title="Latest properties" action="See all" onAction={()=>navigation.navigate('List',{kind:'property'})}/>
    <View style={{paddingHorizontal:spacing.lg}}>
     {loading?<><PropertyCardSkeleton/><PropertyCardSkeleton/></>
      :latest.map(x=><PropertyCard key={x.id} item={x} saved={favs.has(x.id)} onStar={star} onOpen={open}/>)}</View></Reveal>

   {/* Map */}
   {!loading&&published.length>0&&<Reveal i={4} style={{marginTop:spacing.sm,paddingHorizontal:spacing.lg,marginBottom:spacing.lg}}>
    <Text accessibilityRole="header" style={[type.h3,{color:C.tx,marginBottom:spacing.md}]}>Explore on map</Text>
    <PropertyMap items={published.filter(x=>x.kind==='property')} height={220} onOpen={open} title="All properties"/></Reveal>}

   {/* 5 · Stats */}
   <Reveal i={4} style={{marginTop:spacing.sm,paddingHorizontal:spacing.lg}}>
    <View style={{flexDirection:'row',gap:spacing.md}}>
     <StatCard value={20} suffix="+" label="Projects" delay={200}/>
     <StatCard value={2022} from={2000} prefix="" label="Since" delay={350}/>
     <StatCard icon="shield-check" label="Trusted Clients"/></View></Reveal>

   {/* 6 · Why SAIR + CTA */}
   <Reveal i={5} style={{marginTop:spacing.xl,paddingHorizontal:spacing.lg}}>
    <GlassCard r={24} padding={20} glow>
     <Text accessibilityRole="header" style={[type.h3,{color:C.tx}]}>Why choose SAIR</Text>
     {[['office-building-cog-outline','Construction and real estate, one team'],['file-certificate-outline','Registered, documented and contract-backed'],['clipboard-check-outline','Clear estimates before work begins']].map(([ic,t])=>(
      <View key={t} style={{flexDirection:'row',alignItems:'center',gap:12,marginTop:14}}>
       <View style={{width:40,height:40,borderRadius:20,backgroundColor:C.tint,alignItems:'center',justifyContent:'center'}}><Icon name={ic} size={20} color={C.crimson}/></View>
       <Text style={[type.small,{color:C.tx,flex:1}]}>{t}</Text></View>))}
     <View style={{marginTop:20}}><GradientButton title="Get Free Quote" icon="arrow-right" onPress={()=>navigation.navigate('Contact')}/></View></GlassCard></Reveal>
  </Animated.ScrollView></GlassProvider>)}
