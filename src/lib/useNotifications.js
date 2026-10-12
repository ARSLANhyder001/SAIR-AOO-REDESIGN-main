import {useState,useCallback,useMemo} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from './supabase';
import {useApp} from '../store';
import {FREE_NOTIF_LIMIT,daysLeft} from './plans';
import {fmt} from '../theme';
const KEY='notif:seen:v1',DAY=864e5;
// No notifications table: built from existing data.
//  everyone → new listings (14 days) + status updates on YOUR offers
//  admin    → + new offers, open disputes, listings about to expire
// Free accounts only see the FREE_NOTIF_LIMIT newest items ("limited lead notifications"); the rest show as locked.
export default function useNotifications(){
 const {published,listings,role,user,isPaid}=useApp(),[seen,setSeen]=useState(null),[offers,setOffers]=useState([]),[disp,setDisp]=useState([]);
 const load=useCallback(async()=>{
  const s=await AsyncStorage.getItem(KEY).catch(()=>null);setSeen(s?Number(s):0);
  if(role==='admin'){
   const [o,d]=await Promise.all([supabase.from('offers').select('*').eq('status','pending').order('created_at',{ascending:false}).limit(30),supabase.from('disputes').select('*').eq('status','open').order('created_at',{ascending:false}).limit(20)]);
   setOffers(o.data||[]);setDisp(d.data||[])}
  else if(user){const {data}=await supabase.from('offers').select('*').eq('buyer_id',user.id).neq('status','pending').order('created_at',{ascending:false}).limit(20);setOffers(data||[]);setDisp([])}
  else{setOffers([]);setDisp([])}},[role,user]);
 useFocusEffect(useCallback(()=>{load()},[load]));
 const all=useMemo(()=>{
  const adm=role==='admin';
  const a=offers.map(o=>adm?{id:'o'+o.id,t:o.created_at,icon:'flash',title:`New offer ${fmt(o.amount)} from ${o.name}`,sub:`${o.buyer_role} · advance ${fmt(o.advance_amount)}`,go:['Inbox',{tab:'offers'}]}
   :{id:'o'+o.id,t:o.accepted_at||o.created_at,icon:o.status==='accepted'?'check-decagram':'flash-outline',title:`Your offer ${fmt(o.amount)} was ${o.status}`,sub:o.status==='accepted'?'Payment days now count from today':'',go:['MyOffers']});
  const dd=disp.map(d=>({id:'d'+d.id,t:d.created_at,icon:'gavel',title:`Dispute: ${d.reason}`,sub:'Needs review',go:['Disputes']}));
  const ex=adm?listings.filter(l=>l.status==='published'&&l.expires_at&&daysLeft(l.expires_at)<=3&&daysLeft(l.expires_at)>0).map(l=>({id:'x'+l.id,t:new Date().toISOString(),icon:'timer-sand',title:`Expiring soon: ${l.title}`,sub:`${daysLeft(l.expires_at)} day(s) left · relist to keep it live`,go:['MyListings']})):[];
  const b=published.filter(l=>Date.now()-new Date(l.created_at).getTime()<14*DAY).slice(0,15).map(l=>({id:'l'+l.id,t:l.created_at,icon:l.kind==='project'?'crane':'home-plus-outline',title:`New ${l.kind==='project'?'project':'listing'}: ${l.title}`,sub:[l.city,l.purpose==='rent'?'For rent':l.kind==='property'?'For sale':null].filter(Boolean).join(' · '),go:['Detail',{id:l.id}]}));
  return [...dd,...ex,...a,...b].sort((x,y)=>new Date(y.t)-new Date(x.t))},[offers,disp,published,listings,role]);
 const limited=!isPaid&&role!=='admin',items=limited?all.slice(0,FREE_NOTIF_LIMIT):all,locked=limited?Math.max(0,all.length-FREE_NOTIF_LIMIT):0;
 const unread=seen==null?0:items.filter(i=>new Date(i.t).getTime()>seen).length;
 const markRead=useCallback(()=>{const n=Date.now();setSeen(n);AsyncStorage.setItem(KEY,String(n)).catch(()=>{})},[]);
 return {items,locked,unread,markRead,reload:load}}
