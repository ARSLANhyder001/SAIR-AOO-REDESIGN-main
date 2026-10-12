import {Platform} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as Crypto from 'expo-crypto';
import {supabase} from './supabase';
import {makePassword} from './password';
WebBrowser.maybeCompleteAuthSession();
export const suggestPassword=()=>makePassword(n=>Crypto.getRandomBytes(n));
// Returns null on success, 'cancelled' if the user closed the window, or an error text.
export async function signInWithGoogle(){
 if(Platform.OS==='web'){
  const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}});
  return error?error.message:null; // page goes to Google and comes back signed in
 }
 const redirectTo=Linking.createURL('auth-callback');
 const {data,error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo,skipBrowserRedirect:true}});
 if(error||!data?.url)return error?.message||'Could not start Google sign in.';
 const res=await WebBrowser.openAuthSessionAsync(data.url,redirectTo);
 if(res.type!=='success')return res.type==='cancel'||res.type==='dismiss'?'cancelled':'Google sign in failed.';
 const q=res.url.includes('#')?res.url.split('#')[1]:(res.url.split('?')[1]||''),p=new URLSearchParams(q);
 const at=p.get('access_token'),rt=p.get('refresh_token');
 if(!at||!rt)return p.get('error_description')||'Google sign in failed.';
 const {error:e2}=await supabase.auth.setSession({access_token:at,refresh_token:rt});
 return e2?e2.message:null;
}