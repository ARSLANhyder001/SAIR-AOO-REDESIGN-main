import React,{useEffect} from 'react';
import {View,Text,FlatList,Pressable} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import {Empty} from '../components/ui';
import useNotifications from '../lib/useNotifications';
import {useC,type} from '../theme';
import {ago} from '../lib/stats';
import {tap} from '../lib/haptics';
export default function NotificationsScreen({navigation}){
 const C=useC(),{items,locked,markRead}=useNotifications();
 useEffect(()=>{const t=setTimeout(markRead,1200);return()=>clearTimeout(t)},[markRead]);
 return(<SafeAreaView edges={[]} style={{flex:1,backgroundColor:C.bg}}>
  <FlatList data={items} keyExtractor={i=>i.id} contentContainerStyle={{padding:16,paddingBottom:40}} ListFooterComponent={locked>0?<Pressable accessibilityRole="button" onPress={()=>navigation.navigate('Plans')}><GlassCard r={18} padding={14} glow><View style={{flexDirection:'row',gap:12,alignItems:'center'}}><Icon name="lock" size={24} color={C.gold}/><View style={{flex:1}}><Text style={[type.smallB,{color:C.tx}]}>{locked} more lead notification{locked>1?'s':''} locked</Text><Text style={[type.caption,{color:C.mute}]}>Upgrade to SAIR Pro to see all of them.</Text></View><Icon name="chevron-right" size={20} color={C.mute}/></View></GlassCard></Pressable>:null} ListEmptyComponent={<Empty icon="bell-outline" text="You are all caught up. New listings and offers show up here."/>}
   renderItem={({item:n})=><Pressable accessibilityRole="button" onPress={()=>{tap();navigation.navigate(...n.go)}} style={{marginBottom:10}}>
    <GlassCard r={18} padding={14}><View style={{flexDirection:'row',gap:12,alignItems:'center'}}>
     <View style={{width:42,height:42,borderRadius:21,backgroundColor:C.tint,alignItems:'center',justifyContent:'center'}}><Icon name={n.icon} size={21} color={C.crimson}/></View>
     <View style={{flex:1}}><Text style={[type.smallB,{color:C.tx}]} numberOfLines={2}>{n.title}</Text>{!!n.sub&&<Text style={[type.caption,{color:C.mute}]} numberOfLines={1}>{n.sub}</Text>}<Text style={[type.caption,{color:C.mute,marginTop:2}]}>{ago(n.t)}</Text></View>
     <Icon name="chevron-right" size={20} color={C.mute}/></View></GlassCard></Pressable>}/></SafeAreaView>)}
