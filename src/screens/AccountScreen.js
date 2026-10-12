import React,{useState} from 'react';
import {View,Text,Pressable} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {Screen,H,Btn,Field,Chips,Muted} from '../components/ui';
import PasswordField from '../components/PasswordField';
import {supabase} from '../lib/supabase';
import {signInWithGoogle,suggestPassword} from '../lib/auth';
import {pwChecks,pwScore,pwOk} from '../lib/password';
import {notify} from '../lib/dialog';
import {useApp} from '../store';
import {useC} from '../theme';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
const COL=['#e3e6ea','#d11a24','#e08a00','#3aa76d','#1f8a4c'],LBL=['','Weak','Fair','Good','Strong'];
const Seg=({value,onChange})=>{const C=useC();return(<View style={{flexDirection:'row',backgroundColor:C.soft,borderRadius:14,padding:4,marginBottom:14}}>
 {[['login','Log in'],['signup','Sign up']].map(([v,l])=><Pressable key={v} onPress={()=>onChange(v)} accessibilityRole="tab" accessibilityState={{selected:value===v}}
  style={{flex:1,paddingVertical:10,borderRadius:11,alignItems:'center',backgroundColor:value===v?C.card:'transparent'}}>
  <Text style={{color:value===v?C.red2:C.mute,fontWeight:'700'}}>{l}</Text></Pressable>)}</View>)};
const PwHelp=({p,onSuggest,note})=>{const C=useC(),sc=pwScore(p);
 return(<View style={{marginTop:-2,marginBottom:10}}>
  <View style={{flexDirection:'row',gap:4}}>{[1,2,3,4].map(i=><View key={i} style={{flex:1,height:4,borderRadius:2,backgroundColor:i<=sc?COL[sc]:C.line}}/>)}</View>
  <Text style={{color:p?COL[sc]:C.mute,fontSize:12,marginTop:4,fontWeight:'600'}}>{p?LBL[sc]:'Use 8+ characters with letters, numbers and a symbol'}</Text>
  {!!p&&pwChecks(p).map(([l,ok])=><Text key={l} style={{color:ok?'#1f8a4c':C.mute,fontSize:12}}>{ok?'✓':'○'} {l}</Text>)}
  {!!note&&<Text style={{color:C.mute,fontSize:12,marginTop:4}}>Suggested password filled in. Save it somewhere safe.</Text>}
  <Pressable onPress={onSuggest} hitSlop={8} style={{alignSelf:'flex-start',marginTop:6}}><Text style={{color:C.red2,fontWeight:'600'}}>Suggest a strong password</Text></Pressable></View>)};
export default function AccountScreen({navigation}){
 const C=useC(),{user,role}=useApp(),[tab,setTab]=useState('login'),[mode,setMode]=useState('main'),[name,setName]=useState(''),[e,setE]=useState(''),[p,setP]=useState(''),
  [show,setShow]=useState(false),[acct,setAcct]=useState('user'),[code,setCode]=useState(''),[np,setNp]=useState(''),[sug,setSug]=useState(''),[busy,setBusy]=useState(false);
 const run=async fn=>{if(busy)return;setBusy(true);try{await fn()}finally{setBusy(false)}};
 const okMail=()=>/^\S+@\S+\.\S+$/.test(e.trim())||(notify('Check email','Enter a valid email address.'),false);
 const suggest=set=>()=>{const x=suggestPassword();set(x);setSug(x);setShow(true)};
 const google=()=>run(async()=>{const err=await signInWithGoogle();if(err&&err!=='cancelled')notify('Google sign in failed',err)});
 const login=()=>okMail()&&run(async()=>{const {error}=await supabase.auth.signInWithPassword({email:e.trim(),password:p});
  if(error)notify('Login failed',/invalid login/i.test(error.message)?'Wrong email or password.':/not confirmed/i.test(error.message)?'Please confirm your email first.':error.message)});
 const signup=()=>{
  if(name.trim().length<2)return notify('Name needed','Enter your full name.');
  if(!okMail())return;
  if(!pwOk(p))return notify('Password too weak','Use 8+ characters with upper and lower case, a number or a symbol. You can tap "Suggest a strong password".');
  run(async()=>{const {data,error}=await supabase.auth.signUp({email:e.trim(),password:p,options:{data:{full_name:name.trim(),account_type:acct}}});
   if(error)return notify('Sign up failed',error.message);
   if(data.user&&data.user.identities&&data.user.identities.length===0)return notify('Already registered','This email already has an account. Log in, or use Google.');
   if(!data.session)notify('Check your email','Confirm your account, then log in.')})};
 const sendCode=()=>okMail()&&run(async()=>{const {error}=await supabase.auth.resetPasswordForEmail(e.trim());
  if(error)return notify('Could not send code',error.message);setMode('code');notify('Check your email','We sent you a code.')});
 const reset=()=>!pwOk(np)?notify('Password too weak','Use 8+ characters with upper and lower case, a number or a symbol.'):run(async()=>{
  const {error}=await supabase.auth.verifyOtp({email:e.trim(),token:code.trim(),type:'recovery'});
  if(error)return notify('Wrong or expired code',error.message);
  const {error:e2}=await supabase.auth.updateUser({password:np});
  if(e2)return notify('Could not change password',e2.message);
  setMode('main');setTab('login');setCode('');setNp('');notify('Done','Your password is changed.')});
 if(user)return(<Screen tab><H>Account</H>
  <View style={{flexDirection:'row',alignItems:'center',gap:14,padding:16,marginBottom:6,borderRadius:22,borderWidth:1,borderColor:C.line,backgroundColor:C.card,...C.shadow}}>
   <View style={{width:56,height:56,borderRadius:28,alignItems:'center',justifyContent:'center',backgroundColor:C.tint}}><Icon name="account" size={30} color={C.red2}/></View>
   <View style={{flex:1}}><Text style={{color:C.tx,fontWeight:'700',fontSize:17}}>{user.user_metadata?.full_name||user.user_metadata?.name||'Welcome'}</Text><Muted>{user.email}</Muted></View></View>
  {user.user_metadata?.account_type==='agent'&&role!=='admin'&&<Muted style={{marginTop:8}}>Agent account requested. SAIR will verify you.</Muted>}
  {role==='admin'&&<Btn title="Admin dashboard" icon="view-dashboard-outline" onPress={()=>navigation.navigate('Admin')}/>}
  <Btn ghost icon="heart-outline" title="Saved homes" onPress={()=>navigation.navigate('Saved')}/>
  <Btn ghost icon="flash-outline" title="My offers" onPress={()=>navigation.navigate('MyOffers')}/>
  <Btn ghost icon="crown-outline" title="SAIR Pro plan" onPress={()=>navigation.navigate('Plans')}/>
  <Btn ghost icon="bell-outline" title="Notifications" onPress={()=>navigation.navigate('Notifications')}/>
  <H>Appearance</H><ThemeToggle/><View style={{height:6}}/>
  <Btn ghost icon="logout" title="Log out" onPress={()=>supabase.auth.signOut()}/></Screen>);
 if(mode==='forgot')return(<Screen tab><H>Forgot password?</H><Muted>Enter your email and we will send you a code.</Muted>
  <View style={{height:12}}/><Field placeholder="Email" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" keyboardType="email-address" value={e} onChangeText={setE}/>
  <Btn title="Send code" onPress={sendCode} disabled={busy}/><Btn ghost title="Back to log in" onPress={()=>setMode('main')}/></Screen>);
 if(mode==='code')return(<Screen tab><H>Reset password</H><Muted>Enter the code we emailed to {e}.</Muted><View style={{height:12}}/>
  <Field placeholder="Code" keyboardType="number-pad" value={code} onChangeText={setCode}/>
  <PasswordField show={show} onToggle={()=>setShow(s=>!s)} placeholder="New password" autoComplete="new-password" textContentType="newPassword" value={np} onChangeText={setNp}/>
  <PwHelp p={np} onSuggest={suggest(setNp)} note={sug&&np===sug}/>
  <Btn title="Change password" onPress={reset} disabled={busy}/><Btn ghost title="Back" onPress={()=>setMode('main')}/></Screen>);
 const su=tab==='signup';
 return(<Screen tab><View style={{alignItems:'center',marginTop:6}}><Logo size={96}/></View><H>{su?'Create your account':'Welcome back'}</H>
  <Muted>{su?'Join SAIR to save homes and get in touch faster.':'Log in to see your saved homes.'}</Muted><View style={{height:14}}/>
  <Pressable onPress={google} disabled={busy} accessibilityRole="button" style={{height:48,borderRadius:24,borderWidth:1,borderColor:C.line,backgroundColor:C.card,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,opacity:busy?.5:1}}>
   <Icon name="google" size={20} color="#4285F4"/><Text style={{color:C.tx,fontWeight:'600',fontSize:15}}>Continue with Google</Text></Pressable>
  <View style={{flexDirection:'row',alignItems:'center',gap:10,marginVertical:16}}><View style={{flex:1,height:1,backgroundColor:C.line}}/><Muted>or use email</Muted><View style={{flex:1,height:1,backgroundColor:C.line}}/></View>
  <Seg value={tab} onChange={setTab}/>
  {su&&<><Muted style={{marginBottom:6}}>I am a</Muted><Chips options={[['user','Buyer / Seller'],['agent','Agent / Builder']]} value={acct} onChange={setAcct}/>
   <Field placeholder="Full name" autoComplete="name" textContentType="name" value={name} onChangeText={setName}/></>}
  <Field placeholder="Email" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" keyboardType="email-address" value={e} onChangeText={setE}/>
  <PasswordField show={show} onToggle={()=>setShow(s=>!s)} placeholder="Password" autoComplete={su?'new-password':'current-password'} textContentType={su?'newPassword':'password'}
   value={p} onChangeText={setP} onSubmitEditing={su?signup:login}/>
  {su?<PwHelp p={p} onSuggest={suggest(setP)} note={sug&&p===sug}/>
   :<Pressable onPress={()=>setMode('forgot')} hitSlop={8} style={{alignSelf:'flex-end',marginBottom:4}}><Text style={{color:C.red2,fontWeight:'600'}}>Forgot password?</Text></Pressable>}
  <Btn title={su?'Create account':'Log in'} onPress={su?signup:login} disabled={busy}/></Screen>)}