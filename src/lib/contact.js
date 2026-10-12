import {Linking} from 'react-native';
import {notify} from './dialog';
const open=u=>Linking.openURL(u).catch(()=>notify('Could not open','Please try again.'));
export const call=n=>open(`tel:${n}`);
export const whatsapp=(n,text='')=>open(`https://wa.me/${n}?text=${encodeURIComponent(text)}`);
// 0300-1234567 / +92 300 1234567 -> 923001234567 (wa.me format)
export const toWa=p=>{const d=String(p||'').replace(/\D/g,'');return d.startsWith('92')?d:d.startsWith('0')?'92'+d.slice(1):d};
