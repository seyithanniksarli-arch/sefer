// iett.js – İETT 448 canlı otobüs satırı (sofor.js'den sonra yüklenir)
var IETT_URL=localStorage.getItem('iettUrl')||'',IETT={z:0,v:null,yuk:false,dene:0,hata:''},IETT_HIZ=22;
function iettKaydet(){const v=document.getElementById('iettUrl').value.trim().replace(/\/+$/,'');IETT_URL=v;localStorage.setItem('iettUrl',v);if(FB)FB.collection('ayar').doc('iett').set({u:v,z:Date.now()}).then(()=>alert('Adres kaydedildi, bütün cihazlar kullanacak')).catch(e=>alert('Kaydedilemedi: '+e.code));else alert('Bu cihaza kaydedildi')}
function ietEnrich(){try{if(!IETT_URL||IETT.yuk)return;const n=Date.now();if(n-IETT.dene<60000)return;IETT.yuk=true;IETT.dene=n;fetch(IETT_URL+'/?hat=448',{signal:AbortSignal.timeout(15000)}).then(r=>r.json()).then(j=>{if(j&&j.ok&&Array.isArray(j.araclar)){IETT.v=j.araclar;IETT.z=j.z||Date.now();IETT.hata=''}else IETT.hata='Yanıt yok';IETT.yuk=false}).catch(()=>{IETT.hata='İnternet yok';IETT.yuk=false})}catch(e){IETT.yuk=false}}
function ietYakin(v,d,bati,now){const o=[];(v||[]).forEach(b=>{const la=parseFloat(b.enlem),ln=parseFloat(b.boylam);if(isNaN(la)||isNaN(ln))return;const y=String(b.yon).toLocaleUpperCase('tr');if(!y.includes(bati?'GÜZELCE':'HARAM'))return;if(bati?ln<d[1]-0.0003:ln>d[1]+0.0003)return;const t=new Date(String(b.son_konum_zamani).replace(' ','T')).getTime();if(!isNaN(t)&&now-t>300000)return;const km=mesafe([la,ln],d)/1000;o.push({k:b.kapino,km:km,dk:Math.max(1,Math.round(km*1.3/IETT_HIZ*60))})});return o.sort((a,b)=>a.km-b.km).slice(0,2)}
function ietSatir(){
 if(!IETT_URL)return '';ietEnrich();
 const st='text-align:center;margin:6px 0;';
 if(!IETT.v)return IETT.hata?'<p class="kucuk" style="'+st+'color:#888">İETT alınamadı</p>':'';
 const now=Date.now();let h='';
 [['448 Haramidere yönü → Fatih Mah.',KONUM['Fatih Mahallesi']||KONUM['Fatih Market'],0],['448 Güzelce yönü → TÜYAP',KONUM['TÜYAP'],1]].forEach(r=>{if(!r[1])return;const L=ietYakin(IETT.v,r[1],r[2],now);h+='<div style="'+st+'font-size:18px"><b>'+r[0]+'</b>'+(L.length?L.map(x=>'<div>'+x.k+' · '+x.km.toFixed(1).replace('.',',')+' km · ~'+x.dk+' dk</div>').join(''):'<div>yaklaşan otobüs yok</div>')+'</div>'});
 return h?h+'<p class="kucuk" style="'+st+'color:#888;font-size:12px">İETT canlı · '+new Date(IETT.z).toTimeString().slice(0,8)+'</p>':''}
if(FB)FB.collection('ayar').doc('iett').onSnapshot(d=>{const x=d.data();if(x&&typeof x.u==='string'){IETT_URL=x.u;localStorage.setItem('iettUrl',x.u);const i=document.getElementById('iettUrl');if(i&&!i.value)i.value=x.u}},e=>{});
