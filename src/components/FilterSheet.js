import React,{useState,useMemo,useCallback} from 'react';
import {Text,TextInput,View,ScrollView,Pressable} from 'react-native';
import BottomSheet from './BottomSheet';
import MultiChips from './MultiChips';
import GradientButton from './GradientButton';
import {useC,type} from '../theme';
import {TYPE_PILLS,FEATURES} from '../lib/propertyMeta';
import {runFilter,DEFAULT_FILTERS} from '../lib/filters';
const KINDS=[['all','Any'],['property','Properties'],['project','Projects']],PURPOSE=[['all','All'],['sale','Buy'],['rent','Rent']],
 BEDS=[['any','Any'],['1','1'],['2','2'],['3','3'],['4','4'],['5','5+']],BATHS=[['any','Any'],['1','1'],['2','2'],['3','3'],['4','4+']],
 SORTS=[['new','Newest'],['low','Price: low → high'],['high','Price: high → low']];
export default function FilterSheet({value,index,txt,cities,onApply,onClose}){
 const C=useC(),[f,setF]=useState(value),set=k=>v=>setF(p=>({...p,[k]:v})),count=useMemo(()=>runFilter(index,f,txt).length,[index,f,txt]);
 const lbl=t=><Text style={[type.captionB,{color:C.mute,marginTop:16,marginBottom:8}]}>{t}</Text>;
 const num=(k,ph)=><TextInput accessibilityLabel={ph} value={f[k]} onChangeText={t=>set(k)(t.replace(/[^\d]/g,''))} keyboardType="number-pad" placeholder={ph} placeholderTextColor={C.mute}
  style={[type.body,{flex:1,color:C.tx,minHeight:48,borderRadius:14,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill,paddingHorizontal:14}]}/>;
 const apply=useCallback(()=>{onApply(f);onClose()},[f,onApply,onClose]);
 return(<BottomSheet title="Filters" onClose={onClose}>
  <ScrollView style={{maxHeight:460}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
   {lbl('PROPERTY TYPE')}<MultiChips options={TYPE_PILLS} value={f.type} onChange={set('type')}/>
   {lbl('LISTING')}<MultiChips options={PURPOSE} value={f.purpose} onChange={set('purpose')}/>
   {lbl('SHOW')}<MultiChips options={KINDS} value={f.kind} onChange={set('kind')}/>
   {lbl('CITY')}<MultiChips options={cities} value={f.city} onChange={set('city')}/>
   {lbl('BEDROOMS')}<MultiChips options={BEDS} value={f.bed} onChange={set('bed')}/>
   {lbl('BATHROOMS')}<MultiChips options={BATHS} value={f.bath} onChange={set('bath')}/>
   {lbl('PRICE RANGE (PKR)')}<View style={{flexDirection:'row',gap:10}}>{num('min','Min')}{num('max','Max')}</View>
   {lbl('AREA RANGE (MARLA)')}<View style={{flexDirection:'row',gap:10}}>{num('amin','Min')}{num('amax','Max')}</View>
   {lbl('FEATURES & FACILITIES')}<MultiChips multi options={FEATURES} value={f.feats} onChange={set('feats')}/>
   {lbl('SORT BY')}<MultiChips options={SORTS} value={f.sort} onChange={set('sort')}/></ScrollView>
  <View style={{flexDirection:'row',gap:10,marginTop:14}}>
   <View style={{flex:1}}><GradientButton ghost title="Reset" onPress={()=>setF({...DEFAULT_FILTERS,type:f.type})}/></View>
   <View style={{flex:2}}><GradientButton title={`Show ${count} result${count===1?'':'s'}`} onPress={apply}/></View></View></BottomSheet>)}
