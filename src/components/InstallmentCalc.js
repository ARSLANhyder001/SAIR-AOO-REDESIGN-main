import React,{useState,useMemo} from 'react';
import {View,Text,TextInput} from 'react-native';
import GlassCard from './GlassCard';
import MultiChips from './MultiChips';
import {useC,type,fmt} from '../theme';
// Illustrative monthly instalment (reducing-balance). Not a bank offer.
export default function InstallmentCalc({price}){
 const C=useC(),[down,setDown]=useState('20'),[yrs,setYrs]=useState('10'),[rate,setRate]=useState('15');
 const r=useMemo(()=>{const P=price*(1-Number(down)/100),i=Number(rate)/1200,n=Number(yrs)*12;if(!(P>0)||!n)return null;
  const m=i>0?P*i/(1-Math.pow(1+i,-n)):P/n;return {m,P,paid:m*n+price*Number(down)/100}},[price,down,yrs,rate]);
 return(<GlassCard r={20} padding={16}>
  <Text accessibilityRole="header" style={[type.h3,{color:C.tx}]}>Instalment estimate</Text>
  <Text style={[type.captionB,{color:C.mute,marginTop:12,marginBottom:6}]}>DOWN PAYMENT</Text>
  <MultiChips options={[['10','10%'],['20','20%'],['30','30%'],['50','50%']]} value={down} onChange={setDown}/>
  <Text style={[type.captionB,{color:C.mute,marginTop:12,marginBottom:6}]}>YEARS</Text>
  <MultiChips options={[['5','5'],['10','10'],['15','15'],['20','20']]} value={yrs} onChange={setYrs}/>
  <Text style={[type.captionB,{color:C.mute,marginTop:12,marginBottom:6}]}>YEARLY PROFIT / INTEREST RATE (%)</Text>
  <TextInput accessibilityLabel="Rate percent" value={rate} onChangeText={t=>setRate(t.replace(/[^\d.]/g,'').slice(0,5))} keyboardType="decimal-pad" style={[type.body,{color:C.tx,minHeight:48,borderRadius:14,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill,paddingHorizontal:14,width:110}]}/>
  {r&&<View style={{marginTop:14}}><Text style={[type.h2,{color:C.gold}]}>{fmt(Math.round(r.m))}<Text style={[type.small,{color:C.mute}]}> / month</Text></Text>
   <Text style={[type.caption,{color:C.mute,marginTop:4}]}>Financed {fmt(Math.round(r.P))} · total paid about {fmt(Math.round(r.paid))}. Estimate only; actual terms depend on your bank or seller.</Text></View>}</GlassCard>)}
