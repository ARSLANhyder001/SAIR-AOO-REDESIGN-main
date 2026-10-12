import React from 'react';
import {View,Text,Pressable} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {Screen,H,Muted} from '../components/ui';
import GlassCard from '../components/GlassCard';
import ThemeToggle from '../components/ThemeToggle';
import {useApp} from '../store';
import {useC,type} from '../theme';
import {tap} from '../lib/haptics';
export default function MenuScreen({navigation}){
 const {role,user}=useApp(),C=useC(),go=(n,p)=>()=>{tap();navigation.navigate(n,p)};
 const rows=[['Projects','crane','List',{kind:'project'}],['Properties','office-building-outline','List',{kind:'property'}],['Buy / Sell / Rent','home-city-outline','BuySell'],['Contact SAIR','phone-outline','Contact'],['My offers','flash-outline','MyOffers'],['SAIR Pro plan','crown-outline','Plans'],['Notifications','bell-outline','Notifications'],
  ...(role==='agent'?[['My listings','view-list-outline','MyListings'],['Add property','plus-circle-outline','AddListing'],['Offers on my listings','flash','AgentOffers']]:[]),
  ...(role!=='admin'&&role!=='agent'?[[role==='user'&&user?'Become an agent':'Agent account','account-tie-outline','AgentRequest']]:[]),
  ...(role==='admin'?[['Admin dashboard','view-dashboard-outline','Admin'],['Add property','plus-circle-outline','AddListing'],['My listings','view-list-outline','MyListings'],['Offers & messages','flash','Inbox'],['Agents','account-check-outline','AgentsAdmin'],['Disputes','gavel','Disputes'],['Subscribers','crown-outline','Subscribers']]:[])];
 return(<Screen tab><H>More</H>
  {rows.map(([l,ic,n,p])=>(<Pressable key={l} accessibilityRole="button" accessibilityLabel={l} onPress={go(n,p)} style={{marginBottom:10}}>
   <GlassCard r={18} padding={12}><View style={{flexDirection:'row',alignItems:'center',gap:14,minHeight:48}}>
    <View style={{width:44,height:44,borderRadius:22,alignItems:'center',justifyContent:'center',backgroundColor:C.tint}}><Icon name={ic} size={24} color={C.red2}/></View>
    <Text style={[type.bodyB,{flex:1,color:C.tx}]}>{l}</Text><Icon name="chevron-right" size={22} color={C.mute}/></View></GlassCard></Pressable>))}
  <Text style={[type.h3,{color:C.tx,marginTop:18,marginBottom:4}]}>Appearance</Text><Muted style={{marginBottom:10}}>Choose how SAIR looks on your phone.</Muted>
  <ThemeToggle/></Screen>)}