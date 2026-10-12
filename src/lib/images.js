import * as ImagePicker from 'expo-image-picker';
import {ImageManipulator,SaveFormat} from 'expo-image-manipulator';
import {supabase} from './supabase';
const B='listing-images',PARALLEL=3;
async function one(a){
 const ctx=ImageManipulator.manipulate(a.uri);
 if(a.width>1400)ctx.resize({width:1400});
 const img=await ctx.renderAsync();
 const out=await img.saveAsync({compress:0.7,format:SaveFormat.JPEG});
 const buf=await (await fetch(out.uri)).arrayBuffer();
 const path=`${Date.now()}-${Math.random().toString(36).slice(2,8)}.jpg`;
 // long cache header: images never change once uploaded (new upload = new filename)
 const {error}=await supabase.storage.from(B).upload(path,buf,{contentType:'image/jpeg',cacheControl:'31536000'});
 if(error)throw error;
 return supabase.storage.from(B).getPublicUrl(path).data.publicUrl;
}
// Photos chunta hai, 1400px tak chhota + compress karta hai, 3 ek saath upload karta hai (order barqarar).
export async function pickAndUpload(limit=8){
 const r=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsMultipleSelection:true,selectionLimit:Math.max(1,limit),quality:1,exif:false});
 if(r.canceled)return [];
 const urls=[];
 for(let i=0;i<r.assets.length;i+=PARALLEL)urls.push(...await Promise.all(r.assets.slice(i,i+PARALLEL).map(one)));
 return urls;
}
export const removeImage=async url=>{const p=(url||'').split(`/${B}/`)[1];if(p)await supabase.storage.from(B).remove([p])};
