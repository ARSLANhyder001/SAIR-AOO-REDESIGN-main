import React,{memo} from 'react';
import {View,Text} from 'react-native';
import Svg,{Polyline,Circle,Rect,Line,Defs,LinearGradient as SG,Stop} from 'react-native-svg';
import {useC,type} from '../theme';
export const Sparkline=memo(({data,width=84,height=32,color})=>{
 const C=useC(),col=color||C.crimson,max=Math.max(1,...data),pts=data.map((v,i)=>`${(i/(Math.max(1,data.length-1)))*(width-6)+3},${height-4-(v/max)*(height-8)}`);
 const last=pts[pts.length-1].split(',');
 return(<Svg width={width} height={height} accessibilityLabel="Trend"><Polyline points={pts.join(' ')} fill="none" stroke={col} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/><Circle cx={last[0]} cy={last[1]} r={3.5} fill={col}/></Svg>)});
// Grouped bars: series=[{name,color,data}], labels=[…]
export const BarChart=memo(({series,labels,height=160,width=300})=>{
 const C=useC(),max=Math.max(1,...series.flatMap(s=>s.data)),n=labels.length,gw=width/n,bw=Math.min(14,(gw-10)/series.length),ch=height-26;
 return(<View accessible accessibilityLabel={`Monthly chart: ${series.map(s=>`${s.name} ${s.data.join(', ')}`).join('; ')}`}>
  <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
   <Defs>{series.map((s,k)=><SG key={k} id={`g${k}`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={s.color}/><Stop offset="1" stopColor={s.color} stopOpacity="0.45"/></SG>)}</Defs>
   {[0.5,1].map(f=><Line key={f} x1="0" x2={width} y1={ch-ch*f+4} y2={ch-ch*f+4} stroke={C.line} strokeWidth="1" strokeDasharray="4 4"/>)}
   {series.map((s,k)=>s.data.map((v,i)=>{const h=Math.max(v?4:1,(v/max)*(ch-6));return <Rect key={`${k}-${i}`} x={i*gw+(gw-bw*series.length)/2+k*bw} y={ch+4-h} width={bw-2} height={h} rx={4} fill={`url(#g${k})`}/>}))}</Svg>
  <View style={{flexDirection:'row'}}>{labels.map(l=><Text key={l} style={[type.caption,{flex:1,textAlign:'center',color:C.mute}]}>{l}</Text>)}</View></View>)});
