var TT_KEY=localStorage.getItem('ttkey')||'',TT={dep:null,z:0,v:null,yuk:false,hata:'',dene:0},GUNLUK=600,TAKIP_ORAN=0.5,MINARA=90,MAXARA=900,DURDUR=1.15*GUNLUK,TTN=0,TTG='',TTU=null;
function ttKaydet(){const v=document.getElementById('ttKey').value.trim();TT_KEY=v;localStorage.setItem('ttkey',v);if(FB)FB.collection('ayar').doc('tomtom').set({k:v,z:Date.now()}).then(()=>alert('Anahtar kaydedildi, bütün cihazlar kullanacak')).catch(e=>alert('Kaydedilemedi: '+e.code));else alert('Bu cihaza kaydedildi')}
function dkYaz(sn){return Math.max(0,Math.round(sn/60))+' dk'}
function ttSayac(){const g=gunStr(new Date());if(g===TTG)return;TTG=g;TTN=0;if(TTU){try{TTU()}catch(e){}TTU=null}if(FB)TTU=FB.collection('ayar').doc('ttn_'+g).onSnapshot(d=>{const x=d.data();if(x&&typeof x.n==='number')TTN=Math.max(TTN,x.n)},e=>{})}
function ttKalan(){const n=ND(),s=n.getHours()*3600+n.getMinutes()*60+n.getSeconds();let c=0,v=0;for(const b of ['mim','mur']){const a=GSD[b];if(a&&a.length){v=1;for(const x of a)if(x>=s-300)c++}}return v?c:(GUNSEFER>0?GUNSEFER:100)}
function trafikAralik(D,n,kl){if(n===undefined)n=TTN;if(kl===undefined)kl=ttKalan();const T=D[D.length-1][1]*60,Q=Math.max(1,Math.floor(Math.max(0,GUNLUK-n)/Math.max(1,kl*TAKIP_ORAN)));return Math.min(MAXARA,Math.max(MINARA,T/Q))}
function trafikSorgu(dep,D,ad){if(TT.yuk||TTN>=DURDUR)return;const n=Date.now();if(TT.dep===dep&&n-TT.dene<trafikAralik(D)*1000)return;const i=Math.max(0,D.findIndex(x=>x[0]===ad)),L=D.slice(i).filter(x=>KONUM[x[0]]);if(!L.length)return;if(TT.dep!==dep)TT={dep:dep,z:0,v:null,yuk:false,hata:'',dene:0};TT.yuk=true;TT.dene=n;const A=BENKONUM;TTN++;try{if(FB)FB.collection('ayar').doc('ttn_'+TTG).set({n:firebase.firestore.FieldValue.increment(1)},{merge:true}).catch(()=>{})}catch(e){}
 fetch('https://api.tomtom.com/routing/1/calculateRoute/'+A[0]+','+A[1]+L.map(x=>':'+KONUM[x[0]][0]+','+KONUM[x[0]][1]).join('')+'/json?traffic=true&key='+encodeURIComponent(TT_KEY)).then(r=>r.json()).then(j=>{const g=j&&j.routes&&j.routes[0]&&j.routes[0].legs;if(g&&g.length){let c=0;const v={};g.forEach((x,m)=>{c+=x.summary.travelTimeInSeconds;if(L[m])v[L[m][0]]=c});TT.v=v;TT.z=Date.now();TT.hata=''}else TT.hata=(j&&j.detailedError&&j.detailedError.message)||'Yanıt yok';TT.yuk=false}).catch(()=>{TT.hata='İnternet yok';TT.yuk=false})}
function trafikKalan(a,dep,D,B){try{if(typeof ogrenKalan==='function'){const r=ogrenKalan(a,dep,D,B);if(r!==null&&r!==undefined)return r}}catch(e){}if(TT.dep===dep&&TT.v&&TT.v[a]!==undefined)return Math.max(0,TT.v[a]-Math.floor((Date.now()-TT.z)/1000));return null}
function trafikEk(ad,dep,D,B,st){
 const ia=D.findIndex(x=>x[0]===ad),L=B=='mim'?['Metrobüs','TÜYAP']:(B=='mur'&&D.length?[D[D.length-1][0]]:[]),n=ND(),ns=n.getHours()*3600+n.getMinutes()*60+n.getSeconds();let h='';
 L.forEach(a=>{const ix=D.findIndex(x=>x[0]===a),d=D[ix];if(!d||ix<=ia)return;const kt=trafikKalan(a,dep,D,B);if(kt===null)return;const f=kt-(dep+d[1]*60-ns);h+='<div class="sat sat-'+(f<=0?'ok':(f<=120?'uy':'kt'))+'">'+SVG_TRAFIK+'<span class="sat-ad">'+a+'</span><b>varış '+dkYaz(kt)+'</b></div>'});
 return h}
function trafikSatir(ad,k,dep,D,B){
 const st='';
 let og=null;try{if(typeof ogrenKalan==='function')og=ogrenKalan(ad,dep,D,B)}catch(e){}
 const tt=TT_KEY&&KONUM[ad]&&BENKONUM;
 if(og===null){
 if(!TT_KEY)return '';
 if(!KONUM[ad])return '<p class="kucuk" style="'+st+'">'+ad+' haritada işaretli değil, trafik gösterilemiyor</p>';
 if(!BENKONUM)return '<p class="kucuk" style="'+st+'">Konum bekleniyor... (konum iznini aç)</p>'}
 if(tt){ttSayac();trafikSorgu(dep,D,ad)}
 if(og===null&&(TT.dep!==dep||!TT.v||TT.v[ad]===undefined)){if(TT.hata&&!TT.yuk&&TT.dep===dep&&!TT.v)return '<p class="kucuk" style="'+st+'">Trafik alınamadı: '+TT.hata+'</p>';return '<p class="kucuk" style="'+st+'">'+(TTN>=DURDUR?'Günlük trafik sorgu hakkı doldu':'Trafik hesaplanıyor...')+'</p>'}
 const kalanTr=og!==null?og:Math.max(0,TT.v[ad]-Math.floor((Date.now()-TT.z)/1000));
 const fark=kalanTr-k;GEC=fark;GECZ=Date.now();const r=fark<=0?'ok':(fark<=120?'uy':'kt');
 return '<div class="sat sat-'+r+'">'+SVG_TRAFIK+'<span class="sat-ad">Canlı trafik</span><b>Varış '+dkYaz(kalanTr)+'</b></div>'+trafikEk(ad,dep,D,B,st)+'<p class="kucuk" style="'+st+'">'+(og!==null?'öğrenilmiş süre ('+ogrenOrnek(ad,dep,D,B)+' segment)'+(tt?' · ':''):'')+(!tt&&og!==null?'':(TTN>=DURDUR?'Günlük trafik sorgu hakkı doldu':'Trafik '+Math.round(trafikAralik(D)/60)+" dk'da bir güncelleniyor · bugün "+TTN+'/'+GUNLUK))+'</p>';
}
if(FB)FB.collection('ayar').doc('tomtom').onSnapshot(d=>{const x=d.data();if(x&&x.k){TT_KEY=x.k;localStorage.setItem('ttkey',x.k);const i=document.getElementById('ttKey');if(i&&!i.value)i.value=x.k}},e=>{});
