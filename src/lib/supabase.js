import 'react-native-url-polyfill/auto';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
const url=process.env.EXPO_PUBLIC_SUPABASE_URL,key=process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const configured=!!url&&!!key&&!url.startsWith('YOUR');
export const supabase=createClient(configured?url:'https://missing.supabase.co',configured?key:'missing',
 {auth:{storage:AsyncStorage,autoRefreshToken:true,persistSession:true,detectSessionInUrl:Platform.OS==='web'}});