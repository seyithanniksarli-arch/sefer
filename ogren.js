// ogren.js – trafik öğrenen sistem: şoförlerin gerçek durak-arası süreleri ortak havuzda (ayar/sureler), ortanca ile tahmin (trafik.js'den sonra yüklenir)
var OGR={tab:{},gon:{},key:'',S:null,P:null,e:{},son:-1,gt:{},dep:0,m0:0},OGR_YAK=120,OGR_UZK=150,OGR_PEN=1800000;
function ogrenGrup(ms){const d=new Date(ms).getDay();return d===0||d===6?'hs':'hi'}
function ogrenId(a,b){return (a+'__'+b).replace(/\//g,'-')}
function ogrenOrt(a){a=a.slice().sort((x,y)=>x-y);const n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2}
function ogrenGunBasi(ms){const d=new Date(ms);return new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()}
function ogrenDizi(dep,D,B){const S=[B=='mur'?'Muratçeşme':'Fatih Market'].concat(D.map(x=>x[0])),P=[0].concat(D.map(x=>x[1]));return {S:S,P:P}}
function ogrenYaz(id,s){try{if(!FB)return;const kk=id+'|'+s.p+'|'+s.z;if(OGR.gon[kk])return;OGR.gon[kk]=1;const o=OGR.tab[id];if(o&&o.some(x=>x.p===s.p&&x.z===s.z))return;const r=FB.collection('ayar').doc('sureler');FB.runTransaction(tx=>tx.get(r).then(d=>{const m=(d.exists&&d.data().s)||{};const a=Array.isArray(m[id])?m[id]:[];if(a.some(x=>x.p===s.p&&x.z===s.z))return;m[id]=a.concat([s]).sort((x,y)=>x.z-y.z).slice(-30);tx.set(r,{s:m})})).catch(()=>{})}catch(e){}}
function ogrenKes(j){try{const e=OGR.e[j];if(!e||e.f)return;e.f=1;if(j<=OGR.son)return;if(Math.abs(e.t-(OGR.m0+OGR.dep*1000+OGR.P[j]*60000))>=OGR_PEN)return;OGR.son=j;OGR.gt[j]=e.t;const a=OGR.gt[j-1];if(j<1||a===undefined)return;const s=(e.t-a)/1000;if(s<20||s>1200)return;let p='';try{p=localStorage.getItem('benim')||''}catch(x){}ogrenYaz(ogrenId(OGR.S[j-1],OGR.S[j]),{s:Math.round(s),z:e.t,g:ogrenGrup(e.t),p:p})}catch(x){}}
function ogrenKonum(la,ln){try{
 if(typeof AKT==='undefined'||AKT===null||typeof KONUM==='undefined')return;
 const B=TB||simdi,dep=AKT,n=ND().getTime(),m0=ogrenGunBasi(n),key=dep+'|'+B+'|'+m0;
 if(OGR.key!==key){const q=ogrenDizi(dep,dur2(dep,B),B);OGR.key=key;OGR.S=q.S;OGR.P=q.P;OGR.e={};OGR.son=-1;OGR.gt={};OGR.dep=dep;OGR.m0=m0}
 const S=OGR.S;
 for(let j=0;j<S.length;j++){const p=KONUM[S[j]];if(!p||isNaN(p[0])||isNaN(p[1]))continue;const d=mesafe([la,ln],p),e=OGR.e[j]||(OGR.e[j]={m:1e12,t:0,f:0,i:0});if(e.f)continue;
  if(d<=OGR_YAK){for(let q=0;q<j;q++){const f=OGR.e[q];if(f&&f.i&&!f.f)ogrenKes(q)}e.i=1;if(j===0||d<e.m){e.m=d;e.t=n}}
  else if(e.i&&d>OGR_UZK)ogrenKes(j)}
}catch(e){}}
function ogrenMed(id,g,pl){const o=(OGR.tab[id]||[]).filter(x=>x&&x.g===g&&x.s>0).map(x=>x.s);if(o.length<5)return null;const m0=ogrenOrt(o),L=o.filter(x=>x>=m0*0.5&&x<=m0*2);if(L.length<4)return null;const m=ogrenOrt(L);if(pl>0&&(m<pl*0.6||m>pl*1.8))return null;return m}
function ogrenKum(S,P,g){const cum=[0],ogr=[false],seg=[false];for(let i=1;i<S.length;i++){const pl=(P[i]-P[i-1])*60,m=ogrenMed(ogrenId(S[i-1],S[i]),g,pl);seg[i]=m!==null;cum[i]=cum[i-1]+(m!==null?m:pl);ogr[i]=ogr[i-1]||seg[i]}return {cum:cum,ogr:ogr,seg:seg}}
function ogrenOrnek(ad,dep,D,B){try{const q=ogrenDizi(dep,D,B),i=q.S.indexOf(ad);if(i<0)return 0;const K=ogrenKum(q.S,q.P,ogrenGrup(ND().getTime()));let c=0;for(let x=1;x<=i;x++)if(K.seg[x])c++;return c}catch(e){return 0}}
function ogrenKalan(ad,dep,D,B){try{const q=ogrenDizi(dep,D,B),i=q.S.indexOf(ad);if(i<1)return null;const n=ND(),nt=n.getTime(),ns=n.getHours()*3600+n.getMinutes()*60+n.getSeconds(),K=ogrenKum(q.S,q.P,ogrenGrup(nt));
 let j=-1;if(OGR.S&&OGR.dep===dep&&OGR.m0===ogrenGunBasi(nt)&&OGR.S.join('|')===q.S.join('|')&&OGR.son>=0&&OGR.gt[OGR.son]!==undefined)j=OGR.son;
 const lo=j>=0&&j<i?j:0;let ok=false;for(let x=lo+1;x<=i;x++)if(K.seg[x])ok=true;if(!ok)return null;
 const v=j>=0?(OGR.gt[j]-OGR.m0)/1000+(K.cum[i]-K.cum[j]):dep+K.cum[i];return Math.max(0,Math.round(v-ns))}catch(e){return null}}
try{if(FB)FB.collection('ayar').doc('sureler').onSnapshot(d=>{const x=d.data();OGR.tab=(x&&x.s&&typeof x.s==='object')?x.s:{}},e=>{})}catch(e){}
