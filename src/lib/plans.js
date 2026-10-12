// Plan rules in one place. Price is NOT hard-coded: set PLAN_PRICE_TEXT when you decide it (null → "Ask SAIR for current price").
export const PLAN_PRICE_TEXT=null;
export const FREE_NOTIF_LIMIT=3;          // free accounts see only the 3 newest lead notifications
export const LISTING_DAYS=[15,20,25,30];  // allowed listing lifetime (min 15, max 30 days)
export const OFFER_VALIDITY=[['1','24 hours'],['3','3 days'],['7','7 days'],['15','15 days']];   // days
export const ADVANCE_PCT=[['10','10%'],['20','20%'],['30','30%'],['50','50%']];
export const ADVANCE_DUE=[['1','1 day'],['3','3 days'],['7','7 days'],['15','15 days']];       // after acceptance
export const FINAL_DUE=[['15','15 days'],['30','30 days'],['45','45 days'],['60','60 days']];  // after acceptance = deal close
export const DISPUTE_REASONS=[['no_response','Seller not responding'],['terms_changed','Terms changed'],['payment','Payment problem'],['other','Other']];
export const daysLeft=t=>t?Math.ceil((new Date(t).getTime()-Date.now())/864e5):null;
export const isLive=l=>l.status==='published'&&(!l.expires_at||new Date(l.expires_at).getTime()>Date.now());
