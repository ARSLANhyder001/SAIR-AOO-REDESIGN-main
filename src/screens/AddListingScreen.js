import React,{useState,useRef,useEffect,useMemo} from 'react';
import {View,Text,Pressable,ScrollView,KeyboardAvoidingView,Platform,ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Image} from 'expo-image';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {Field,Empty} from '../components/ui';
import MultiChips from '../components/MultiChips';
import GradientButton from '../components/GradientButton';
import {supabase} from '../lib/supabase';
import {pickAndUpload,removeImage} from '../lib/images';
import {notify} from '../lib/dialog';
import {useApp} from '../store';
import {useC,type,AREA} from '../theme';
import {CATEGORY_OPTS,TYPE_OPTS,FEATURES,parseCoords} from '../lib/propertyMeta';
import {success,tap} from '../lib/haptics';
import {LISTING_DAYS} from '../lib/plans';
const MAX=10,STEPS=['Basics','Details','Location','Photos'];
const blank={kind:'property',title:'',subtitle:'',city:'',price:'',bedrooms:'',bathrooms:'',area_size:'',area_unit:'marla',purpose:'sale',description:'',status:'published',images:[],category:'',property_type:'',address:'',coords:'',features:[],floors:'',year_built:'',listed_days:'30'};
const fromRow=l=>({kind:l.kind,title:l.title,subtitle:l.subtitle||'',city:l.city||'',price:l.price?String(l.price):'',bedrooms:l.bedrooms!=null?String(l.bedrooms):'',bathrooms:l.bathrooms!=null?String(l.bathrooms):'',area_size:l.area_size?String(+l.area_size):'',area_unit:l.area_unit||'marla',purpose:l.purpose||'sale',description:l.description||'',status:l.status,images:l.images||[],category:l.category||'',property_type:l.property_type||'',address:l.address||'',coords:l.lat!=null&&l.lng!=null?`${l.lat}, ${l.lng}`:'',features:l.features||[],floors:l.floors!=null?String(l.floors):'',year_built:l.year_built!=null?String(l.year_built):'',listed_days:String(l.listed_days||30)});

export default function AddListingScreen({navigation,route}){
 const C=useC(),{role,listings,reload}=useApp(),id=route.params?.id,existing=useMemo(()=>id?listings.find(l=>l.id===id):null,[id,listings]);
 const [f,setF]=useState(()=>existing?fromRow(existing):blank),[step,setStep]=useState(0),[busy,setBusy]=useState(false),orig=useRef(existing?.images||[]),done=useRef(false),imgs=useRef(f.images);
 imgs.current=f.images;
 useEffect(()=>()=>{if(!done.current)imgs.current.filter(u=>!orig.current.includes(u)).forEach(u=>removeImage(u).catch(()=>{}))},[]);// leaving without saving → delete fresh uploads (no orphans)
 const set=k=>v=>setF(p=>({...p,[k]:v})),isProp=f.kind==='property';
 if(role!=='admin'&&role!=='agent')return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}><Empty text="Admins and approved agents only." icon="shield-lock-outline"/></SafeAreaView>;
 const check=s=>{
  if(s===0&&f.title.trim().length<2)return notify('Title needed','Give the listing a short title.'),false;
  if(s===1&&[f.price,f.bedrooms,f.bathrooms,f.area_size,f.floors,f.year_built].some(v=>v!==''&&isNaN(Number(v))))return notify('Check numbers','Price, rooms, area, floors and year must be numbers.'),false;
  if(s===2&&f.coords.trim()&&!parseCoords(f.coords))return notify('Check location','Paste coordinates like 25.3960, 68.3578 (long-press a spot in Google Maps and copy the numbers).'),false;
  return true};
 const next=()=>{if(!check(step))return;tap();setStep(s=>Math.min(3,s+1))};
 const addPhotos=async()=>{if(f.images.length>=MAX)return notify('Limit reached',`Up to ${MAX} photos per listing.`);setBusy(true);
  try{const urls=await pickAndUpload(MAX-f.images.length);setF(p=>({...p,images:[...p.images,...urls].slice(0,MAX)}))}catch(e){notify('Upload failed',e.message)}setBusy(false)};
 const makeCover=i=>setF(p=>({...p,images:[p.images[i],...p.images.filter((_,k)=>k!==i)]}));
 const dropImg=i=>{const u=f.images[i];if(u&&!orig.current.includes(u))removeImage(u).catch(()=>{});setF(p=>({...p,images:p.images.filter((_,k)=>k!==i)}))};
 const save=async()=>{
  for(const s of [0,1,2])if(!check(s)){setStep(s);return}
  const cc=f.coords.trim()?parseCoords(f.coords):null;
  const row={category:f.category||null,property_type:isProp?f.property_type||null:null,address:f.address.trim()||null,lat:cc?cc.lat:null,lng:cc?cc.lng:null,features:f.features,floors:f.floors!==''?Number(f.floors):null,year_built:f.year_built!==''?Number(f.year_built):null,
   ...(f.status==='published'&&(!existing||existing.status!=='published'||Number(f.listed_days)!==(existing.listed_days||30))?{listed_days:Number(f.listed_days),expires_at:new Date(Date.now()+Number(f.listed_days)*864e5).toISOString()}:{}),
   ...(f.status!=='published'?{listed_days:Number(f.listed_days)}:{}),
   kind:f.kind,title:f.title.trim(),subtitle:f.subtitle.trim()||null,city:f.city.trim()||null,description:f.description.trim()||null,status:f.status,price:f.price?Number(f.price):null,
   bedrooms:f.bedrooms!==''?Number(f.bedrooms):null,bathrooms:f.bathrooms!==''?Number(f.bathrooms):null,area_size:f.area_size!==''?Number(f.area_size):null,area_unit:f.area_unit,purpose:f.purpose,images:f.images};
  setBusy(true);
  const {error}=id?await supabase.from('listings').update(row).eq('id',id):await supabase.from('listings').insert(row);
  setBusy(false);
  if(error)return notify('Error',/column|schema/i.test(error.message)?`${error.message}\n\nRun migration_03_property_details.sql in Supabase first.`:error.message);
  orig.current.filter(u=>!f.images.includes(u)).forEach(u=>removeImage(u).catch(()=>{}));
  done.current=true;success();reload();navigation.goBack()};
 const lbl=t=><Text style={[type.captionB,{color:C.mute,marginTop:14,marginBottom:8}]}>{t}</Text>;
 return(<SafeAreaView edges={[]} style={{flex:1,backgroundColor:C.bg}}>
  <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined} keyboardVerticalOffset={90}>
   {/* Stepper */}
   <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:20,paddingTop:14}}>
    {STEPS.map((s,i)=>{const on=i<=step;return(<React.Fragment key={s}>
     <Pressable onPress={()=>{if(i<step)setStep(i)}} accessibilityRole="button" accessibilityLabel={`Step ${i+1}: ${s}`} style={{alignItems:'center',width:56}}>
      <View style={{width:32,height:32,borderRadius:16,alignItems:'center',justifyContent:'center',backgroundColor:on?C.crimson:C.glassFill,borderWidth:1,borderColor:on?C.crimson:C.glassBorder,...(i===step?C.glow:null)}}>{i<step?<Icon name="check" size={18} color="#fff"/>:<Text style={[type.captionB,{color:on?'#fff':C.mute}]}>{i+1}</Text>}</View>
      <Text style={[type.caption,{color:on?C.tx:C.mute,marginTop:4}]}>{s}</Text></Pressable>
     {i<3&&<View style={{flex:1,height:2,backgroundColor:i<step?C.crimson:C.line,marginBottom:18}}/>}</React.Fragment>)})}</View>

   <ScrollView contentContainerStyle={{padding:16,paddingBottom:30}} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    {step===0&&<>
     {lbl('LISTING TYPE')}<MultiChips options={[['property','Property'],['project','Project']]} value={f.kind} onChange={set('kind')}/>
     {isProp&&<>{lbl('FOR')}<MultiChips options={[['sale','For sale'],['rent','For rent (price per month)']]} value={f.purpose} onChange={set('purpose')}/>
      {lbl('CATEGORY')}<MultiChips options={CATEGORY_OPTS} value={f.category} onChange={v=>set('category')(f.category===v?'':v)}/>
      {lbl('PROPERTY TYPE')}<MultiChips options={TYPE_OPTS} value={f.property_type} onChange={v=>set('property_type')(f.property_type===v?'':v)}/></>}
     <View style={{height:16}}/>
     <Field placeholder="Title" value={f.title} onChangeText={set('title')} maxLength={120}/><Field placeholder="Subtitle (e.g. phase / society)" value={f.subtitle} onChangeText={set('subtitle')} maxLength={120}/><Field placeholder="City" value={f.city} onChangeText={set('city')} maxLength={80}/></>}
    {step===1&&<>
     <Field placeholder={f.purpose==='rent'&&isProp?'Rent per month in PKR':'Price in PKR (optional)'} keyboardType="numeric" value={f.price} onChangeText={set('price')}/>
     {isProp&&<><View style={{flexDirection:'row',gap:10}}><View style={{flex:1}}><Field placeholder="Bedrooms" keyboardType="numeric" value={f.bedrooms} onChangeText={set('bedrooms')}/></View><View style={{flex:1}}><Field placeholder="Bathrooms" keyboardType="numeric" value={f.bathrooms} onChangeText={set('bathrooms')}/></View></View>
      <View style={{flexDirection:'row',gap:10}}><View style={{flex:1}}><Field placeholder="Floors" keyboardType="numeric" value={f.floors} onChangeText={set('floors')}/></View><View style={{flex:1}}><Field placeholder="Year built" keyboardType="numeric" value={f.year_built} onChangeText={set('year_built')}/></View></View></>}
     <Field placeholder="Area size" keyboardType="numeric" value={f.area_size} onChangeText={set('area_size')}/>
     <MultiChips options={Object.entries(AREA)} value={f.area_unit} onChange={set('area_unit')}/>
     {isProp&&<>{lbl('FEATURES & FACILITIES')}<MultiChips multi options={FEATURES} value={f.features} onChange={set('features')}/></>}</>}
    {step===2&&<>
     <Field placeholder="Full address (optional)" value={f.address} onChangeText={set('address')} maxLength={200}/>
     <Field placeholder="Map location, e.g. 25.3960, 68.3578" value={f.coords} onChangeText={set('coords')} autoCapitalize="none" keyboardType="numbers-and-punctuation"/>
     <Text style={[type.caption,{color:C.mute,marginBottom:10}]}>Tip: in Google Maps long-press the spot, then copy the two numbers shown on top. Leave empty to show an approximate pin from the city.</Text>
     <Field placeholder="Description" multiline value={f.description} onChangeText={set('description')} maxLength={3000}/></>}
    {step===3&&<>
     {lbl(`PHOTOS ${f.images.length}/${MAX} · tap a photo to make it the cover`)}
     <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
      {f.images.map((u,i)=><View key={u} style={{width:'31%'}}>
       <Pressable onPress={()=>{tap();makeCover(i)}} accessibilityLabel={i===0?'Cover photo':'Make cover photo'}><Image source={{uri:u}} style={{width:'100%',aspectRatio:1,borderRadius:14,borderWidth:i===0?2:0,borderColor:C.crimson}} contentFit="cover"/></Pressable>
       <Pressable onPress={()=>dropImg(i)} accessibilityLabel="Remove photo" style={{position:'absolute',top:-8,right:-8,width:48,height:48,alignItems:'flex-end',justifyContent:'flex-start'}}><View style={{width:26,height:26,borderRadius:13,backgroundColor:C.crimson,alignItems:'center',justifyContent:'center'}}><Icon name="close" size={16} color="#fff"/></View></Pressable>
       {i===0&&<Text style={[type.captionB,{color:C.red2,textAlign:'center',marginTop:2}]}>Cover</Text>}</View>)}
      {f.images.length<MAX&&<Pressable onPress={addPhotos} disabled={busy} accessibilityRole="button" accessibilityLabel="Add photos" style={{width:'31%',aspectRatio:1,borderRadius:14,borderWidth:1.5,borderStyle:'dashed',borderColor:C.glassBorder,backgroundColor:C.glassFill,alignItems:'center',justifyContent:'center'}}>
       {busy?<ActivityIndicator color={C.crimson}/>:<><Icon name="image-plus" size={28} color={C.crimson}/><Text style={[type.caption,{color:C.mute}]}>Add</Text></>}</Pressable>}</View>
     {lbl('VISIBILITY')}<MultiChips options={[['published','Published'],['draft','Draft (hidden)']]} value={f.status} onChange={set('status')}/>
     {lbl('LIVE FOR (15 to 30 days, then it hides until relisted)')}<MultiChips options={LISTING_DAYS.map(d=>[String(d),`${d} days`])} value={f.listed_days} onChange={set('listed_days')}/>
     {existing?.expires_at&&<Text style={[type.caption,{color:C.mute,marginTop:8}]}>Current expiry: {new Date(existing.expires_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</Text>}</>}
   </ScrollView>
   <View style={{flexDirection:'row',gap:10,padding:16,paddingTop:8}}>
    {step>0&&<View style={{flex:1}}><GradientButton ghost title="Back" onPress={()=>setStep(s=>s-1)}/></View>}
    <View style={{flex:2}}>{step<3?<GradientButton title="Next" icon="arrow-right" onPress={next}/>:<GradientButton title={busy?'Saving…':id?'Save changes':'Publish listing'} icon="check" onPress={save} loading={busy}/>}</View></View>
  </KeyboardAvoidingView></SafeAreaView>)}