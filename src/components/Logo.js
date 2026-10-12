import React from 'react';
import {Image} from 'react-native';
export default function Logo({size=160}){
 return <Image source={require('../../assets/logo.png')} style={{width:size,height:size*196/221,borderRadius:14}} resizeMode="contain" accessibilityLabel="SAIR Construction logo"/>;
}
