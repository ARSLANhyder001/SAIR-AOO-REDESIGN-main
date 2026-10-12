import {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import {supabase} from './supabase';
import {notify} from './dialog';
import {useApp} from '../store';
// Direct contact is released by the SERVER (rpc unlock_contact) only for paid plans / admin. Not stored in the app.
export default function useContact(){
 const nav=useNavigation(),{user,isPaid}=useApp();
 const unlock=useCallback(async listingId=>{
  if(!user){notify('Log in first','Log in to see contact options.');nav.navigate('Account');return null}
  if(!isPaid){nav.navigate('Plans');return null}
  const {data,error}=await supabase.rpc('unlock_contact',{p_listing:listingId});
  if(error){if(/plan_required/.test(error.message))nav.navigate('Plans');else notify('Could not unlock','Please try again.');return null}
  return data},[user,isPaid,nav]);
 return {unlock,isPaid};}
