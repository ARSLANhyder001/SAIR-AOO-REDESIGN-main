import React,{memo} from 'react';
import {Text,View} from 'react-native';
import {type} from '../theme';
export default memo(function StatusChip({label,color}){return <View style={{backgroundColor:color+'26',borderColor:color+'66',borderWidth:1,paddingHorizontal:10,paddingVertical:3,borderRadius:999,alignSelf:'flex-start'}}><Text style={[type.captionB,{color}]}>{label}</Text></View>});
