import React from 'react';
import {Screen} from '../components/ui';
import InquiryForm from '../components/InquiryForm';
export default function BuySellScreen(){
 return <Screen top={false}><InquiryForm button="Send request" types={[['buy','Buy'],['sell','Sell'],['rent','Rent']]}/></Screen>}
