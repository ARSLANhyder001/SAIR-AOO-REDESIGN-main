import React,{useMemo,useCallback} from 'react';
import {View,Text,FlatList} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import PropertyCard from '../components/PropertyCard';
import GradientButton from '../components/GradientButton';
import {Empty} from '../components/ui';
import {useApp} from '../store';
import {useC,type} from '../theme';
export default function SavedScreen({navigation}){
 const C=useC(),{published,favs,user,toggleFav}=useApp(),rows=useMemo(()=>published.filter(x=>favs.has(x.id)),[published,favs]);
 const open=useCallback(id=>navigation.navigate('Detail',{id}),[navigation]);
 const render=useCallback(({item})=><PropertyCard item={item} saved onStar={toggleFav} onOpen={open}/>,[toggleFav,open]);
 const empty=!user?<View><Empty icon="heart-outline" text="Log in to save homes and see them here."/><View style={{width:200,alignSelf:'center'}}><GradientButton title="Log in" icon="login" onPress={()=>navigation.navigate('Account')}/></View></View>
  :<View><Empty icon="heart-outline" text="Nothing saved yet. Tap the heart on any listing."/><View style={{width:220,alignSelf:'center'}}><GradientButton title="Browse listings" icon="magnify" onPress={()=>navigation.navigate('List')}/></View></View>;
 return(<SafeAreaView edges={['top']} style={{flex:1,backgroundColor:C.bg}}>
  <View style={{paddingHorizontal:16,paddingTop:8}}><Text accessibilityRole="header" style={[type.h2,{color:C.tx}]}>Saved</Text>{user&&<Text style={[type.small,{color:C.mute}]}>{rows.length} {rows.length===1?'listing':'listings'}</Text>}</View>
  <FlatList data={user?rows:[]} keyExtractor={x=>x.id} renderItem={render} contentContainerStyle={{padding:16,paddingBottom:130}} ListEmptyComponent={empty} initialNumToRender={4} windowSize={7}/></SafeAreaView>)}
