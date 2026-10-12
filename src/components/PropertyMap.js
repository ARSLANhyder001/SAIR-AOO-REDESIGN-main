import React,{useMemo,useRef,useState,useCallback,useEffect} from 'react';
import {View,Text,Pressable,Modal,Platform,StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import {Image} from 'expo-image';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import OfferSheet from './OfferSheet';
import {useC,type,cover,sized,priceText} from '../theme';
import {coordsOf,compactPrice,areaText,TYPE_LABEL,propType} from '../lib/propertyMeta';
import {tap} from '../lib/haptics';

/* Leaflet + OpenStreetMap inside a WebView: free, no API key, works in Expo Go. Tiles: CARTO (dark/light), Esri (satellite). */
const LF='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet';
const page=({pts,dark,single})=>`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="${LF}.min.css"><style>html,body,#m{height:100%;margin:0;background:${dark?'#141416':'#eceef1'}}
.pin{position:relative;transform:translate(-50%,-100%) translateY(-6px);background:#E11D2E;color:#fff;font:700 12px system-ui,sans-serif;padding:5px 10px;border-radius:999px;white-space:nowrap;border:2px solid #fff;box-shadow:0 4px 14px rgba(225,29,46,.55)}
.pin:after{content:'';position:absolute;left:50%;bottom:-8px;margin-left:-5px;border:5px solid transparent;border-top-color:#fff;border-bottom:0}
.pin.ap{border-style:dashed}.pin.sel{background:#F5B544;color:#0A0A0B;z-index:9999!important;transform:translate(-50%,-100%) translateY(-6px) scale(1.18)}
.leaflet-control-attribution{font-size:9px;background:rgba(255,255,255,.7)!important}.leaflet-bar a{width:40px!important;height:40px!important;line-height:40px!important}</style></head>
<body><div id="m"></div><script src="${LF}.min.js"></script><script>
var D=${JSON.stringify(pts).replace(/</g,'\\u003c')},SINGLE=${single?1:0};
var send=function(o){var s=JSON.stringify(o);if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(s);else window.parent.postMessage(s,'*')};
var map=L.map('m',{zoomControl:false,tap:true}).setView([30.4,69.3],5);L.control.zoom({position:'bottomright'}).addTo(map);
var TL={dark:L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19,subdomains:'abcd',attribution:'© OpenStreetMap © CARTO'}),
 light:L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:19,subdomains:'abcd',attribution:'© OpenStreetMap © CARTO'}),
 sat:L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Imagery © Esri'})};
var cur=null;window.setLayer=function(k){if(cur)map.removeLayer(cur);cur=TL[k];cur.addTo(map)};setLayer('${dark?'dark':'light'}');
var M={},selId=null;
window.sel=function(id){if(selId&&M[selId]&&M[selId]._icon)M[selId]._icon.firstChild.classList.remove('sel');selId=id;if(id&&M[id]&&M[id]._icon){M[id]._icon.firstChild.classList.add('sel');M[id].setZIndexOffset(1000)}};
D.forEach(function(p){var mk=L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',html:'<div class="pin'+(p.ap?' ap':'')+'">'+p.label+'</div>',iconSize:[0,0]})}).addTo(map);M[p.id]=mk;
 mk.on('click',function(e){L.DomEvent.stopPropagation(e);sel(p.id);send({t:'select',id:p.id})});if(SINGLE&&p.ap)L.circle([p.lat,p.lng],{radius:1500,color:'#E11D2E',weight:1,fillOpacity:.08}).addTo(map)});
map.on('click',function(){sel(null);send({t:'clear'})});
if(D.length===1)map.setView([D[0].lat,D[0].lng],SINGLE?(D[0].ap?13:16):14);else if(D.length>1)map.fitBounds(D.map(function(p){return[p.lat,p.lng]}),{padding:[60,60],maxZoom:14});
window.addEventListener('message',function(e){try{var m=JSON.parse(e.data);if(m.t==='layer')setLayer(m.k);if(m.t==='sel')sel(m.id)}catch(x){}});
</script></body></html>`;

function Canvas({pts,single,onSelect,webRef}){
 const C=useC(),sig=pts.map(p=>p.id+p.lat+p.lng+p.label).join('|'),html=useMemo(()=>page({pts:pts.map(({item,...p})=>p),dark:C.dark,single}),[sig,C.dark,single]);// eslint-disable-line
 const onMsg=useCallback(raw=>{try{const m=JSON.parse(typeof raw==='string'?raw:raw.nativeEvent.data);if(m.t==='select')onSelect(m.id);if(m.t==='clear')onSelect(null)}catch{}},[onSelect]);
 useEffect(()=>{if(Platform.OS!=='web')return;const h=e=>{if(typeof e.data==='string')onMsg(e.data)};window.addEventListener('message',h);return()=>window.removeEventListener('message',h)},[onMsg]);
 if(Platform.OS==='web')return React.createElement('iframe',{ref:webRef,srcDoc:html,style:{border:0,width:'100%',height:'100%'},title:'Map'});
 return <WebView ref={webRef} key={sig+C.dark} originWhitelist={['*']} source={{html}} onMessage={onMsg} javaScriptEnabled domStorageEnabled setSupportMultipleWindows={false}
  style={{flex:1,backgroundColor:C.dark?'#141416':'#eceef1'}} containerStyle={{backgroundColor:'transparent'}} overScrollMode="never" bounces={false}/>}

function Preview({item,onOpen,onOffer,onClose}){
 const C=useC(),u=sized(cover(item),300),t=propType(item),stats=[item.bedrooms!=null&&`${item.bedrooms} bed`,item.bathrooms!=null&&`${item.bathrooms} bath`,areaText(item)].filter(Boolean).join(' · ');
 return(<GlassCard r={22} intensity={50} padding={12}>
  <Pressable onPress={()=>onOpen(item.id)} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} style={{flexDirection:'row',gap:12}}>
   <View style={{width:92,height:92,borderRadius:14,overflow:'hidden',backgroundColor:C.skel}}>{!!u&&<Image source={{uri:u}} style={{flex:1}} contentFit="cover" cachePolicy="memory-disk"/>}</View>
   <View style={{flex:1}}>
    <Text style={[type.bodyB,{color:C.tx}]} numberOfLines={1}>{priceText(item,true)||'Price on request'}</Text>
    <Text style={[type.small,{color:C.tx}]} numberOfLines={1}>{item.title}</Text>
    <Text style={[type.caption,{color:C.mute,marginTop:2}]} numberOfLines={1}>{[t&&TYPE_LABEL[t],item.city].filter(Boolean).join(' · ')}</Text>
    {!!stats&&<Text style={[type.caption,{color:C.mute,marginTop:2}]} numberOfLines={1}>{stats}</Text>}</View>
   <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close preview" style={{width:32,height:32,alignItems:'center',justifyContent:'flex-start'}}><Icon name="close" size={20} color={C.mute}/></Pressable></Pressable>
  <View style={{marginTop:10}}><GradientButton title="Place Your Offer First" height={48} onPress={()=>onOffer(item)}/></View></GlassCard>)}

// items: listings. interactive=false → tap anywhere (or ⤢) to open full screen. interactive → live map with property preview.
export default function PropertyMap({items,height=240,single,interactive,onOpen,style,title}){
 const C=useC(),ins=useSafeAreaInsets(),[full,setFull]=useState(false),[sel,setSel]=useState(null),[sat,setSat]=useState(false),[offer,setOffer]=useState(null),ref=useRef(null);
 const pts=useMemo(()=>items.map(x=>{const c=coordsOf(x);return c&&{id:x.id,lat:c.lat,lng:c.lng,ap:c.approx,label:compactPrice(x),item:x}}).filter(Boolean),[items]);
 const picked=pts.find(p=>p.id===sel)?.item;
 const toggleSat=()=>{tap();const n=!sat;setSat(n);const k=n?'sat':C.dark?'dark':'light';
  if(Platform.OS==='web')ref.current?.contentWindow?.postMessage(JSON.stringify({t:'layer',k}),'*');else ref.current?.injectJavaScript(`setLayer('${k}');true;`)};
 const go=id=>{setFull(false);onOpen&&onOpen(id)};
 const live=(isFull)=>(<View style={{flex:1}}>
  <Canvas pts={pts} single={single} onSelect={setSel} webRef={ref}/>
  <View pointerEvents="box-none" style={{position:'absolute',left:12,right:12,top:isFull?ins.top+8:12,flexDirection:'row',justifyContent:'space-between'}}>
   {isFull?<Pressable onPress={()=>{setFull(false);setSel(null)}} accessibilityRole="button" accessibilityLabel="Close map" style={{width:48,height:48}}><GlassCard r={24} intensity={50} style={{width:48,height:48,alignItems:'center',justifyContent:'center'}}><Icon name="close" size={22} color={C.tx}/></GlassCard></Pressable>:<View/>}
   <Pressable onPress={toggleSat} accessibilityRole="button" accessibilityLabel={sat?'Show street map':'Show satellite'} style={{height:48}}><GlassCard r={24} intensity={50} style={{height:48,paddingHorizontal:16,flexDirection:'row',alignItems:'center',gap:6}}><Icon name={sat?'map-outline':'satellite-variant'} size={20} color={C.tx}/><Text style={[type.smallB,{color:C.tx}]}>{sat?'Map':'Satellite'}</Text></GlassCard></Pressable></View>
  <View pointerEvents="box-none" style={{position:'absolute',left:12,right:12,bottom:isFull?Math.max(ins.bottom,12):12,gap:8}}>
   {!picked&&<GlassCard r={999} intensity={50} style={{alignSelf:'center',paddingHorizontal:16,paddingVertical:8}}><Text style={[type.captionB,{color:C.tx}]}>{pts.length} {pts.length===1?'property':'properties'}{pts.some(p=>p.ap)?' · dashed = approximate area':''} · tap a pin</Text></GlassCard>}
   {picked&&<Preview item={picked} onOpen={go} onOffer={setOffer} onClose={()=>{setSel(null);ref.current?.injectJavaScript?.('sel(null);true;')}}/>}</View>
  {offer&&<OfferSheet item={offer} onClose={()=>setOffer(null)}/>}</View>);
 if(!pts.length)return <View style={[{height,borderRadius:20,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill,alignItems:'center',justifyContent:'center',padding:20},style]}><Icon name="map-marker-off-outline" size={28} color={C.mute}/><Text style={[type.small,{color:C.mute,marginTop:8,textAlign:'center'}]}>No mappable locations yet.</Text></View>;
 if(interactive)return <View style={[{flex:1,overflow:'hidden'},style]}>{live(false)}</View>;
 return(<>
  <View style={[{height,borderRadius:20,overflow:'hidden',borderWidth:1,borderColor:C.glassBorder},style]}>
   <View pointerEvents="none" style={StyleSheet.absoluteFill}><Canvas pts={pts} single={single} onSelect={()=>{}} webRef={null}/></View>
   <Pressable accessibilityRole="button" accessibilityLabel="Open full screen map" onPress={()=>{tap();setFull(true)}} style={StyleSheet.absoluteFill}/>
   <View pointerEvents="none" style={{position:'absolute',right:10,top:10}}><GlassCard r={24} intensity={50} style={{width:48,height:48,alignItems:'center',justifyContent:'center'}}><Icon name="arrow-expand-all" size={22} color={C.tx}/></GlassCard></View>
   <View pointerEvents="none" style={{position:'absolute',left:10,bottom:10}}><GlassCard r={999} intensity={50} style={{paddingHorizontal:14,paddingVertical:8}}><Text style={[type.captionB,{color:C.tx}]}>{title||`${pts.length} on map`} · tap to expand</Text></GlassCard></View></View>
  {full&&<Modal visible animationType="slide" onRequestClose={()=>setFull(false)} statusBarTranslucent>{live(true)}</Modal>}</>)}
