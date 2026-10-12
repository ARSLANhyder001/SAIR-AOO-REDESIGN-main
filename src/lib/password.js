// Password rules + strong password generator (pure code, no Expo imports).
export const pwChecks=p=>[['8+ characters',p.length>=8],['Upper and lower case',/[a-z]/.test(p)&&/[A-Z]/.test(p)],['A number',/\d/.test(p)],['A symbol (!@#$)',/[^A-Za-z0-9]/.test(p)]];
export const pwScore=p=>pwChecks(p).filter(c=>c[1]).length;
export const pwOk=p=>p.length>=8&&pwScore(p)>=3;
export function makePassword(getBytes,len=16){
 const U='ABCDEFGHJKLMNPQRSTUVWXYZ',L='abcdefghijkmnopqrstuvwxyz',N='23456789',S='!@#$%&*?',all=U+L+N+S,b=getBytes(len*2),pick=(set,i)=>set[b[i]%set.length];
 const c=[pick(U,0),pick(L,1),pick(N,2),pick(S,3)];
 for(let i=4;i<len;i++)c.push(pick(all,i));
 for(let i=len-1;i>0;i--){const j=b[len+i]%(i+1);[c[i],c[j]]=[c[j],c[i]]}
 return c.join('');
}