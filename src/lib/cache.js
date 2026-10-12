import AsyncStorage from '@react-native-async-storage/async-storage';
// Tiny stale-while-revalidate cache: app opens instantly with last-known data, then refreshes.
export const readCache=async k=>{try{return JSON.parse(await AsyncStorage.getItem(k))}catch{return null}};
export const writeCache=(k,v)=>{AsyncStorage.setItem(k,JSON.stringify(v)).catch(()=>{})};
