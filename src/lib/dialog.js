// Alert.alert web par kaam nahi karta, is liye web par window.alert/confirm use hota hai.
import {Alert,Platform} from 'react-native';
export const notify=(t,m)=>Platform.OS==='web'?window.alert(m?`${t}\n${m}`:t):Alert.alert(t,m);
export const confirm=(t,m,onYes,label='Delete')=>Platform.OS==='web'
 ?(window.confirm(`${t}\n${m||''}`)&&onYes())
 :Alert.alert(t,m,[{text:'Cancel',style:'cancel'},{text:label,style:'destructive',onPress:onYes}]);
