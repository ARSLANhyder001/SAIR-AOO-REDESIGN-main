import React,{useEffect,useState,useMemo,useCallback,useDeferredValue} from 'react';
import {FlatList,RefreshControl,View,Text,Pressable,ScrollView,TextInput} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import FilterSheet from '../components/FilterSheet';
import GlassCard from '../components/GlassCard';
import {PropertyCardSkeleton} from '../components/Skeleton';
import {ErrorBox,Empty} from '../components/ui';
import {useApp} from '../store';
import {useC,type} from '../theme';
import {TYPE_PILLS} from '../lib/propertyMeta';
import {DEFAULT_FILTERS,buildIndex,runFilter,activeCount} from '../lib/filters';
import {tap} from '../lib/haptics';

const Pill=({label,on,onPress})=>{const C=useC();return(
 <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{selected:on}} style={{minHeight:44,paddingHorizontal:16,justifyContent:'center',borderRadius:999,borderWidth:1,borderColor:on?C.crimson:C.glassBorder,backgroundColor:on?C.crimson:C.glassFill}}>
  <Text style={[type.smallB,{color:on?'#fff':C.tx}]}>{label}</Text></Pressable>)};

export default function ListScreen({navigation,route}){
 const C=useC(),{published,favs,toggleFav,loading,error,reload}=useApp();
 const [q,setQ]=useState(''),[f,setF]=useState(DEFAULT_FILTERS),[sheet,setSheet]=useState(false),[mode,setMode]=useState('list'),[rf,setRf]=useState(false);
 useEffect(()=>{const p=route.params;if(!p)return;setQ(p.q||'');setF(v=>({...DEFAULT_FILTERS,feats:[],type:p.type||'all',kind:p.kind||'all',purpose:p.purpose||'all'}))},[route.params]);
 const txt=useDeferredValue(q.trim().toLowerCase()),index=useMemo(()=>buildIndex(published),[published]);
 const cities=useMemo(()=>[['all','All cities'],...[...new Set(published.map(x=>x.city).filter(Boolean))].map(c=>[c,c])],[published]);
 const rows=useMemo(()=>runFilter(index,f,txt),[index,f,txt]),n=activeCount(f),set=k=>v=>{tap();setF(p=>({...p,[k]:v}))};
 const star=useCallback(async id=>{if(!(await toggleFav(id)))navigation.navigate('Account')},[toggleFav,navigation]);
 const open=useCallback(id=>navigation.navigate('Detail',{id}),[navigation]);
 const refresh=async()=>{setRf(true);await reload();setRf(false)};
 const apply=useCallback(v=>setF(v),[]),closeSheet=useCallback(()=>setSheet(false),[]);
 const render=useCallback(({item})=><PropertyCard item={item} saved={favs.has(item.id)} onStar={star} onOpen={open}/>,[favs,star,open]);
 return(<SafeAreaView edges={['top']} style={{flex:1,backgroundColor:C.bg}}>
  <View style={{paddingHorizontal:16,paddingTop:8}}>
   <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
    <Text accessibilityRole="header" style={[type.h2,{color:C.tx}]}>Search</Text>
    <View style={{flexDirection:'row',borderRadius:999,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill,padding:3}}>
     {[['list','format-list-bulleted','List'],['map','map-marker-radius-outline','Map']].map(([k,ic,l])=><Pressable key={k} onPress={()=>{tap();setMode(k)}} accessibilityRole="button" accessibilityState={{selected:mode===k}} accessibilityLabel={`${l} view`}
      style={{minHeight:44,paddingHorizontal:14,borderRadius:999,flexDirection:'row',alignItems:'center',gap:6,backgroundColor:mode===k?C.crimson:'transparent'}}><Icon name={ic} size={18} color={mode===k?'#fff':C.tx}/><Text style={[type.smallB,{color:mode===k?'#fff':C.tx}]}>{l}</Text></Pressable>)}</View></View>
   <GlassCard r={999} style={{marginTop:12,flexDirection:'row',alignItems:'center',minHeight:52,paddingLeft:16,paddingRight:6,gap:10}}>
    <Icon name="magnify" size={22} color={C.mute}/>
    <TextInput accessibilityLabel="Search" value={q} onChangeText={setQ} returnKeyType="search" autoCorrect={false} placeholder="Search area, title, city" placeholderTextColor={C.mute} style={[type.body,{flex:1,color:C.tx,paddingVertical:10}]}/>
    {!!q&&<Pressable onPress={()=>setQ('')} accessibilityLabel="Clear search" style={{width:44,height:44,alignItems:'center',justifyContent:'center'}}><Icon name="close-circle" size={20} color={C.mute}/></Pressable>}
    <Pressable onPress={()=>{tap();setSheet(true)}} accessibilityRole="button" accessibilityLabel={`Filters${n?`, ${n} active`:''}`} style={{width:44,height:44,borderRadius:22,backgroundColor:n?C.crimson:C.tint,alignItems:'center',justifyContent:'center'}}>
     <Icon name="tune-variant" size={20} color={n?'#fff':C.red2}/>{n>0&&<View style={{position:'absolute',top:-2,right:-2,minWidth:18,height:18,borderRadius:9,backgroundColor:C.gold,alignItems:'center',justifyContent:'center'}}><Text style={[type.captionB,{color:'#0A0A0B',fontSize:11}]}>{n}</Text></View>}</Pressable></GlassCard>
  </View>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexGrow:0,marginTop:12}} contentContainerStyle={{paddingHorizontal:16,gap:8}} keyboardShouldPersistTaps="handled">
   {TYPE_PILLS.map(([k,l])=><Pill key={k} label={l} on={f.type===k} onPress={()=>set('type')(k)}/>)}</ScrollView>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexGrow:0,marginTop:8}} contentContainerStyle={{paddingHorizontal:16,gap:8,alignItems:'center'}}>
   {[['all','Buy & Rent'],['sale','Buy'],['rent','Rent']].map(([k,l])=><Pill key={k} label={l} on={f.purpose===k} onPress={()=>set('purpose')(k)}/>)}
   <Text style={[type.small,{color:C.mute,marginLeft:6}]}>{loading?'Loading…':`${rows.length} ${rows.length===1?'listing':'listings'}`}</Text></ScrollView>

  <View style={{flex:1,marginTop:8}}>
   {mode==='map'
    ?(loading?<View style={{padding:16}}><PropertyCardSkeleton/></View>:<PropertyMap interactive items={rows.filter(x=>x.kind==='property'||f.kind!=='property')} onOpen={open} style={{flex:1}}/>)
    :<FlatList data={loading||(error&&!published.length)?[]:rows} keyExtractor={x=>x.id} renderItem={render} keyboardShouldPersistTaps="handled"
      contentContainerStyle={{padding:16,paddingBottom:120}} initialNumToRender={4} maxToRenderBatch={4} windowSize={7} removeClippedSubviews
      refreshControl={<RefreshControl refreshing={rf} onRefresh={refresh} tintColor={C.crimson}/>}
      ListEmptyComponent={loading?<><PropertyCardSkeleton/><PropertyCardSkeleton/></>:error&&!published.length?<ErrorBox text="Could not load listings. Check your internet." onRetry={reload}/>
       :<View><Empty text="Nothing matches these filters."/>{(n>0||f.type!=='all'||f.purpose!=='all')&&<Pressable onPress={()=>setF(DEFAULT_FILTERS)} accessibilityRole="button" style={{alignSelf:'center',minHeight:48,justifyContent:'center'}}><Text style={[type.smallB,{color:C.red2}]}>Clear all filters</Text></Pressable>}</View>}/>}</View>
  {sheet&&<FilterSheet value={f} index={index} txt={txt} cities={cities} onApply={apply} onClose={closeSheet}/>}</SafeAreaView>)}
