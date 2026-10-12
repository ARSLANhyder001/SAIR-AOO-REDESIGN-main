import React,{useMemo} from 'react';
import {Text,View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {NavigationContainer,DefaultTheme,DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useFonts} from 'expo-font';
import {PlusJakartaSans_400Regular,PlusJakartaSans_600SemiBold,PlusJakartaSans_700Bold} from '@expo-google-fonts/plus-jakarta-sans';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {AppProvider} from './src/store';
import {configured} from './src/lib/supabase';
import {ThemeProvider,useTheme,useC,font} from './src/theme';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import HomeScreen from './src/screens/HomeScreen';
import ListScreen from './src/screens/ListScreen';
import SavedScreen from './src/screens/SavedScreen';
import AccountScreen from './src/screens/AccountScreen';
import MenuScreen from './src/screens/MenuScreen';
import DetailScreen from './src/screens/DetailScreen';
import BuySellScreen from './src/screens/BuySellScreen';
import ContactScreen from './src/screens/ContactScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AddListingScreen from './src/screens/AddListingScreen';
import MyListingsScreen from './src/screens/MyListingsScreen';
import InboxScreen from './src/screens/InboxScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import MyOffersScreen from './src/screens/MyOffersScreen';
import PlansScreen from './src/screens/PlansScreen';
import DisputesScreen from './src/screens/DisputesScreen';
import SubscribersScreen from './src/screens/SubscribersScreen';
import AgentRequestScreen from './src/screens/AgentRequestScreen';
import AgentOffersScreen from './src/screens/AgentOffersScreen';
import AgentsAdminScreen from './src/screens/AgentsAdminScreen';
import FloatingTabBar from './src/components/FloatingTabBar';
const Tab=createBottomTabNavigator(),Stack=createNativeStackNavigator();
function Tabs(){return(<Tab.Navigator tabBar={p=><FloatingTabBar {...p}/>} screenOptions={{headerShown:false}}>
 <Tab.Screen name="Home" component={HomeScreen}/><Tab.Screen name="List" component={ListScreen}/><Tab.Screen name="Saved" component={SavedScreen}/>
 <Tab.Screen name="Account" component={AccountScreen}/><Tab.Screen name="Menu" component={MenuScreen}/></Tab.Navigator>)}
function Root(){
 const {C,dark}=useTheme();
 const theme=useMemo(()=>({...(dark?DarkTheme:DefaultTheme),colors:{...(dark?DarkTheme:DefaultTheme).colors,background:C.bg,card:C.card,border:C.line,primary:C.red2,text:C.tx}}),[C,dark]);
 if(!configured)return <View style={{flex:1,backgroundColor:C.bg,justifyContent:'center',padding:24}}><Text style={{color:C.tx,fontSize:20,fontFamily:font.bold}}>Setup needed</Text><Text style={{color:C.mute,marginTop:8}}>Copy .env.example to .env, add your Supabase URL and anon key, then restart with: npx expo start -c</Text></View>;
 return(<SafeAreaProvider><AppProvider><NavigationContainer theme={theme}><StatusBar style={dark?'light':'dark'}/>
  <Stack.Navigator screenOptions={{headerStyle:{backgroundColor:C.bg},headerTintColor:C.tx,headerTitleStyle:{fontFamily:font.bold,fontSize:18},headerShadowVisible:false,contentStyle:{backgroundColor:C.bg}}}>
   <Stack.Screen name="Tabs" component={Tabs} options={{headerShown:false}}/>
   <Stack.Screen name="Detail" component={DetailScreen} options={{title:'Details'}}/>
   <Stack.Screen name="BuySell" component={BuySellScreen} options={{title:'Buy, sell or rent'}}/>
   <Stack.Screen name="Contact" component={ContactScreen} options={{title:'Contact SAIR'}}/>
   <Stack.Screen name="Admin" component={DashboardScreen} options={{title:'Dashboard'}}/>
   <Stack.Screen name="AddListing" component={AddListingScreen} options={({route})=>({title:route.params?.id?'Edit listing':'Add property'})}/>
   <Stack.Screen name="MyListings" component={MyListingsScreen} options={{title:'My listings'}}/>
   <Stack.Screen name="Inbox" component={InboxScreen} options={{title:'Offers & messages'}}/>
   <Stack.Screen name="Notifications" component={NotificationsScreen} options={{title:'Notifications'}}/>
   <Stack.Screen name="MyOffers" component={MyOffersScreen} options={{title:'My offers'}}/>
   <Stack.Screen name="Plans" component={PlansScreen} options={{title:'SAIR Pro'}}/>
   <Stack.Screen name="Disputes" component={DisputesScreen} options={{title:'Disputes'}}/>
   <Stack.Screen name="AgentRequest" component={AgentRequestScreen} options={{title:'Agent account'}}/>
   <Stack.Screen name="AgentOffers" component={AgentOffersScreen} options={{title:'Offers on my listings'}}/>
   <Stack.Screen name="AgentsAdmin" component={AgentsAdminScreen} options={{title:'Agents'}}/>
   <Stack.Screen name="Subscribers" component={SubscribersScreen} options={{title:'Subscribers'}}/></Stack.Navigator></NavigationContainer></AppProvider></SafeAreaProvider>)}
export default function App(){
 const [ok]=useFonts({PlusJakartaSans_400Regular,PlusJakartaSans_600SemiBold,PlusJakartaSans_700Bold});
 if(!ok)return null;
 return <GestureHandlerRootView style={{flex:1}}><ThemeProvider><Root/></ThemeProvider></GestureHandlerRootView>}