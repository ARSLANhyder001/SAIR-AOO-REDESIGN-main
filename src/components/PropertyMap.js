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
import {coordsOf,compactPrice,areaText,TYPE_LABEL,propType,parseCoords} from '../lib/propertyMeta';
import {tap} from '../lib/haptics';

/* MapLibre GL JS in WebView. OpenFreeMap supplies free vector tiles; Esri supplies satellite imagery. */
const MAPLIBRE='https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl';
const STYLE={dark:'https://tiles.openfreemap.org/styles/dark',light:'https://tiles.openfreemap.org/styles/positron'};

const page=({pts,dark,single,picker,center,selection})=>`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="${MAPLIBRE}.css"><style>html,body,#m{height:100%;margin:0;background:${dark?'#141416':'#eceef1'}}
.pin{background:#E11D2E;color:#fff;font:700 12px system-ui,sans-serif;padding:5px 10px;border-radius:999px;white-space:nowrap;border:2px solid #fff;box-shadow:0 4px 14px rgba(225,29,46,.55);cursor:pointer}
.pin.ap{border-style:dashed}.pin.sel{background:#F5B544;color:#0A0A0B;transform:scale(1.18)}
.maplibregl-ctrl-group button{width:40px!important;height:40px!important}.maplibregl-ctrl-attrib{font-size:9px!important}</style></head>
<body><div id="m"></div><script src="${MAPLIBRE}.js"></script><script>
var D=${JSON.stringify(pts).replace(/</g,'\\u003c')},SINGLE=${single?1:0},PICKER=${picker?1:0},CENTER=${JSON.stringify(center)},SELECTED=${JSON.stringify(selection)};
var send=function(o){var s=JSON.stringify(o);if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(s);else window.parent.postMessage(s,'*')};
var map=new maplibregl.Map({container:'m',style:${JSON.stringify(dark?STYLE.dark:STYLE.light)},center:CENTER?[CENTER.lng,CENTER.lat]:[69.3,30.4],zoom:PICKER?12:5,maxZoom:19,attributionControl:true});
map.addControl(new maplibregl.NavigationControl({showCompass:false}),'bottom-right');
var M={},selId=null,pin=null;
function addPin(p){var el=document.createElement('div');el.className='pin'+(p.ap?' ap':'');el.textContent=p.label||'Property';var mk=new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat([p.lng,p.lat]).addTo(map);if(p.id){M[p.id]=mk;el.addEventListener('click',function(e){e.stopPropagation();sel(p.id);send({t:'select',id:p.id})})}return mk}
window.sel=function(id){if(selId&&M[selId])M[selId].getElement().classList.remove('sel');selId=id;if(id&&M[id])M[id].getElement().classList.add('sel')};
map.on('style.load',function(){map.getStyle().layers.forEach(function(layer){var field=layer.layout&&layer.layout['text-field'];if(layer.type==='symbol'&&field&&JSON.stringify(field).indexOf('name')!==-1)map.setLayoutProperty(layer.id,'text-field',['coalesce',['get','name_en'],['get','name:en'],['get','name:latin']])})});
if(PICKER&&SELECTED)pin=addPin({lat:SELECTED.lat,lng:SELECTED.lng,label:'Selected location'});
D.forEach(function(p){if(!PICKER)addPin(p)});
window.setLayer=function(k){if(k==='sat'){map.setStyle({version:8,sources:{esri:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],tileSize:256,attribution:'Imagery © Esri'}},layers:[{id:'satellite',type:'raster',source:'esri'}]})}else map.setStyle(${JSON.stringify(STYLE)}[k])};
window.searchArea=function(){var b=map.getBounds();send({t:'search-area',bounds:{south:b.getSouth(),west:b.getWest(),north:b.getNorth(),east:b.getEast()}})};
var ready=false;
map.on('moveend',function(){if(ready&&!PICKER)send({t:'map-moved'})});
map.on('click',function(e){if(PICKER){var c=e.lngLat;if(pin)pin.setLngLat([c.lng,c.lat]);else pin=addPin({lat:c.lat,lng:c.lng,label:'Selected location'});send({t:'pick',lat:c.lat,lng:c.lng})}else{sel(null);send({t:'clear'})}});
map.on('load',function(){if(D.length===1&&!PICKER)map.setZoom(SINGLE?(D[0].ap?13:16):14).setCenter([D[0].lng,D[0].lat]);else if(D.length>1){var b=new maplibregl.LngLatBounds();D.forEach(function(p){b.extend([p.lng,p.lat])});map.fitBounds(b,{padding:60,maxZoom:14})}if(PICKER&&SELECTED)map.setZoom(16);map.once('idle',function(){ready=true})});
window.addEventListener('message',function(e){try{var m=JSON.parse(e.data);if(m.t==='layer')setLayer(m.k);if(m.t==='sel')sel(m.id);if(m.t==='search-area')searchArea()}catch(x){}});
</script></body></html>`;

function Canvas({pts,single,onSelect,webRef,picker=false,center,selection,onCoordinateSelect,onMapMoved,onSearchArea}){
 const C=useC(),sig=pts.map(p=>p.id+p.lat+p.lng+p.label).join('|'),html=useMemo(()=>page({pts:pts.map(({item,...p})=>p),dark:C.dark,single,picker,center,selection}),[sig,C.dark,single,picker,center?.lat,center?.lng,selection?.lat,selection?.lng]);// eslint-disable-line
 const source=useMemo(()=>({html}),[html]);
 const onMsg=useCallback(raw=>{try{const m=JSON.parse(typeof raw==='string'?raw:raw.nativeEvent.data);if(m.t==='select')onSelect(m.id);if(m.t==='clear')onSelect(null);if(m.t==='pick')onCoordinateSelect?.({lat:m.lat,lng:m.lng});if(m.t==='map-moved')onMapMoved?.();if(m.t==='search-area')onSearchArea?.(m.bounds)}catch{}},[onSelect,onCoordinateSelect,onMapMoved,onSearchArea]);
 useEffect(()=>{if(Platform.OS!=='web')return;const h=e=>{if(typeof e.data==='string')onMsg(e.data)};window.addEventListener('message',h);return()=>window.removeEventListener('message',h)},[onMsg]);
 if(Platform.OS==='web')return React.createElement('iframe',{ref:webRef,srcDoc:html,style:{border:0,width:'100%',height:'100%'},title:'Map'});
 return <WebView ref={webRef} key={sig+C.dark+picker+(center?.lat||'')+(center?.lng||'')+(selection?.lat||'')+(selection?.lng||'')} originWhitelist={['*']} source={source} onMessage={onMsg} javaScriptEnabled domStorageEnabled setSupportMultipleWindows={false}
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
export default function PropertyMap({items,height=240,single,interactive,onOpen,style,title,selectable,selectedCoordinates,initialCenter,onCoordinateSelect,mapMoved,onMapMoved,onSearchArea}){
 const C=useC(),ins=useSafeAreaInsets(),[full,setFull]=useState(false),[sel,setSel]=useState(null),[sat,setSat]=useState(false),[offer,setOffer]=useState(null),ref=useRef(null);
 const initialSelection=useRef(parseCoords(selectedCoordinates)).current;
 const pts=useMemo(()=>selectable?[]:items.map(x=>{const c=coordsOf(x);return c&&{id:x.id,lat:c.lat,lng:c.lng,ap:c.approx,label:compactPrice(x),item:x}}).filter(Boolean),[items,selectable]);
 if(selectable)return <View style={[{height,borderRadius:20,overflow:'hidden',borderWidth:1,borderColor:C.glassBorder},style]}><Canvas pts={pts} single={false} onSelect={()=>{}} webRef={ref} picker center={initialSelection||initialCenter} selection={initialSelection} onCoordinateSelect={onCoordinateSelect}/></View>;
 const picked=pts.find(p=>p.id===sel)?.item;
 const toggleSat=()=>{tap();const n=!sat;setSat(n);const k=n?'sat':C.dark?'dark':'light';
  if(Platform.OS==='web')ref.current?.contentWindow?.postMessage(JSON.stringify({t:'layer',k}),'*');else ref.current?.injectJavaScript(`setLayer('${k}');true;`)};
 const go=id=>{setFull(false);onOpen&&onOpen(id)};
 const live=(isFull)=>(<View style={{flex:1}}>
  <Canvas pts={pts} single={single} onSelect={setSel} webRef={ref} onMapMoved={onMapMoved} onSearchArea={onSearchArea}/>
  <View pointerEvents="box-none" style={{position:'absolute',left:12,right:12,top:isFull?ins.top+8:12,flexDirection:'row',justifyContent:'space-between'}}>
   {isFull?<Pressable onPress={()=>{setFull(false);setSel(null)}} accessibilityRole="button" accessibilityLabel="Close map" style={{width:48,height:48}}><GlassCard r={24} intensity={50} style={{width:48,height:48,alignItems:'center',justifyContent:'center'}}><Icon name="close" size={22} color={C.tx}/></GlassCard></Pressable>:<View/>}
   <Pressable onPress={toggleSat} accessibilityRole="button" accessibilityLabel={sat?'Show street map':'Show satellite'} style={{height:48}}><GlassCard r={24} intensity={50} style={{height:48,paddingHorizontal:16,flexDirection:'row',alignItems:'center',gap:6}}><Icon name={sat?'map-outline':'satellite-variant'} size={20} color={C.tx}/><Text style={[type.smallB,{color:C.tx}]}>{sat?'Map':'Satellite'}</Text></GlassCard></Pressable></View>
  {interactive&&mapMoved&&<Pressable onPress={()=>{tap();if(Platform.OS==='web')ref.current?.contentWindow?.postMessage(JSON.stringify({t:'search-area'}),'*');else ref.current?.injectJavaScript('searchArea();true;')}} accessibilityRole="button" accessibilityLabel="Search this map area" style={{position:'absolute',top:68,alignSelf:'center',height:48}}><GlassCard r={24} intensity={50} style={{height:48,paddingHorizontal:18,flexDirection:'row',alignItems:'center',gap:8}}><Icon name="magnify" size={18} color={C.red2}/><Text style={[type.smallB,{color:C.tx}]}>Search this area</Text></GlassCard></Pressable>}
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