// izin.js – telefon onayı ve plaka kilidi (sofor.js'den sonra yüklenir)
var CIHAZ='',CKOD='',IZ={d:'bilinmiyor',plaka:'',istek:''},CLIST={},KIL=null,KILDIN=null,KILHB=null,KILBEK=false,CLDIN=null,ADMKAYIT=false;
(function(){
 try{CIHAZ=localStorage.getItem('cihaz')||'';if(!CIHAZ){CIHAZ='c'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);localStorage.setItem('cihaz',CIHAZ)}
  CKOD=localStorage.getItem('ckod')||'';if(!CKOD){CKOD=String(1000+Math.floor(Math.random()*9000));localStorage.setItem('ckod',CKOD)}
  if(localStorage.getItem('onayli')=='1')IZ.d='onay';IZ.plaka=localStorage.getItem('cplaka')||''}catch(e){CIHAZ=CIHAZ||'gecici';CKOD=CKOD||'0000'}
})();
function izinli(){return ADMIN||IZ.d=='onay'}
function cModel(){const u=navigator.userAgent;return /iPhone/.test(u)?'iPhone':/iPad/.test(u)?'iPad':/Android/.test(u)?'Android':'Bilgisayar'}

// --- açılışta sofor.js'nin kendiliğinden başlattığı takibi durdur, izin gelince yeniden başlar
function gpsDur(){if(GPS!==null){try{navigator.geolocation.clearWatch(GPS)}catch(e){}GPS=null}}
if(takipT){clearInterval(takipT);takipT=null;gpsDur();const s=document.getElementById('sayac');if(s)s.innerHTML=''}

// --- kapı ekranı
function kapiCiz(){
 let k=document.getElementById('kapi');
 if(izinli()){if(k)k.remove();document.body.style.overflow='';return}
 if(!k){k=document.createElement('div');k.id='kapi';k.style.cssText='position:fixed;inset:0;z-index:9999;background:linear-gradient(150deg,#0f8a57 0%,#1fa36a 45%,#16507e 100%);color:#fff;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;font-family:-apple-system,"Segoe UI",Helvetica,Arial,sans-serif';document.body.appendChild(k)}
 document.body.style.overflow='hidden';
 const logo='<img src="sofor-ikon.svg" width="76" height="76" style="display:block;margin:0 auto 18px;filter:drop-shadow(0 6px 14px rgba(0,0,0,.25))" onerror="this.remove()">';
 const kod='<div style="font-size:15px;font-weight:700;opacity:.85;margin-top:18px">Telefon kodu</div><div style="font-size:64px;font-weight:900;letter-spacing:10px;background:#ffcf33;color:#10202e;border-radius:18px;padding:6px 10px 6px 20px;display:inline-block;margin-top:8px">'+CKOD+'</div>';
 let ic='';
 if(IZ.d=='bilinmiyor')ic='<h2 style="font-size:28px;margin:0">Kontrol ediliyor…</h2><p style="opacity:.9">İnternet bağlantını kontrol et.</p>';
 else if(IZ.d=='bekliyor')ic='<h2 style="font-size:28px;margin:0">Onay bekleniyor</h2>'+(IZ.istek?'<p style="font-size:20px;font-weight:800;margin:10px 0 0">İstenen plaka: '+IZ.istek+'</p>':'')+'<p style="opacity:.92;font-size:17px;line-height:1.45">İsteğin gönderildi. Yöneticiye bu kodu söyle. Onaylayınca uygulama kendiliğinden açılır.</p>'+kod;
 else ic='<h2 style="font-size:28px;margin:0">Bu telefon kayıtlı değil</h2><p style="opacity:.92;font-size:17px;line-height:1.45">Şoför uygulamasını sadece yöneticinin onayladığı telefonlar kullanabilir.</p><input id="istekPl" inputmode="numeric" placeholder="Plakan (örn. 72)" style="font-family:inherit;font-size:24px;font-weight:800;text-align:center;border:0;border-radius:14px;padding:14px;width:100%;box-sizing:border-box;color:#10202e;margin-top:6px"><button onclick="onayIste()" style="font-family:inherit;font-size:20px;font-weight:800;border:0;border-radius:14px;padding:16px 22px;background:#fff;color:#0f8a57;width:100%;margin-top:8px">Onay iste</button>'+kod;
 k.innerHTML='<div style="max-width:380px;width:100%;text-align:center">'+logo+ic+'<div style="margin-top:28px"><button onclick="adminGir()" style="font-family:inherit;background:none;border:0;color:#fff;opacity:.7;font-size:15px;text-decoration:underline">Yönetici girişi</button></div><div style="margin-top:22px;font-size:12px;opacity:.6">Seyithan Niksarlı tarafından geliştirildi · BL-105</div></div>';
}
function onayIste(){
 if(!FB){alert('İnternet yok, tekrar dene.');return}
 const ip=document.getElementById('istekPl'),ist=((ip&&ip.value)||'').trim().toUpperCase();
 if(!ist){alert('Önce plakanı yaz.');if(ip)ip.focus();return}
 FB.collection('cihazlar').doc(CIHAZ).set({kod:CKOD,onay:false,plaka:'',istek:ist,model:cModel(),z:Date.now()}).then(()=>{IZ.d='bekliyor';IZ.istek=ist;kapiCiz()}).catch(e=>alert('Gönderilemedi: '+e.code));
}
function izinDegisti(eski){
 try{localStorage.setItem('onayli',IZ.d=='onay'?'1':'0');localStorage.setItem('cplaka',IZ.plaka||'')}catch(e){}
 kapiCiz();
 if(izinli()){benimDoldur();if(!takipT)setTimeout(otoTakip,0)}
 else if(takipT||KIL)takipDurdur('Bu telefonun izni kaldırıldı.');
}
function benimDoldur(){const b=document.getElementById('benim');if(b&&!b.value&&IZ.plaka)b.value=IZ.plaka}
if(FB)FB.collection('cihazlar').doc(CIHAZ).onSnapshot(d=>{
 const x=d.data(),e=IZ.d;
 if(!x)IZ.d='yok';else if(x.onay){IZ.d='onay';IZ.plaka=x.plaka||''}else{IZ.d='bekliyor';IZ.istek=x.istek||''}
 izinDegisti(e);
},e=>{if(IZ.d=='bilinmiyor'){IZ.d='yok';kapiCiz()}});

// --- plaka kilidi: bir plakayı aynı anda tek telefon takip eder, plakanın sahibine öncelik
async function kilitAl(p,oto){
 if(!FB)return true;
 const ref=FB.collection('takip').doc(p),sahip=!!IZ.plaka&&IZ.plaka==p;
 try{
  const d=await ref.get(),x=d.data();
  if(x&&x.cihaz!==CIHAZ&&Date.now()-(x.z||0)<90000&&(!sahip||oto))return x.sahip?'sahip':'dolu';
  await ref.set({cihaz:CIHAZ,kod:CKOD,sahip:sahip,z:Date.now()});return true;
 }catch(e){return true}
}
function kilitBirak(p){if(!FB||!p)return;const ref=FB.collection('takip').doc(p);ref.get().then(d=>{const x=d.data();if(x&&x.cihaz===CIHAZ)ref.delete()}).catch(()=>{})}
function kilitDinle(p){
 if(KILDIN)KILDIN();KILDIN=null;clearInterval(KILHB);if(!FB)return;
 const ref=FB.collection('takip').doc(p);
 KILDIN=ref.onSnapshot(d=>{const x=d.data();if(x&&x.cihaz!==CIHAZ&&KIL===p)takipDurdur(p+' plakasını artık '+(x.sahip?'aracın sahibi':'başka bir telefon')+' takip ediyor. Senin takibin kapatıldı.')},()=>{});
 KILHB=setInterval(()=>{if(KIL===p)ref.update({z:Date.now()}).catch(()=>{})},30000);
}
function takipDurdur(m){
 clearInterval(takipT);takipT=null;TP=null;gpsDur();
 if(KILDIN)KILDIN();KILDIN=null;clearInterval(KILHB);KIL=null;
 sayacUyari(m);try{if(navigator.vibrate)navigator.vibrate([300,150,300])}catch(e){}
}
function sayacUyari(m){const s=document.getElementById('sayac');if(s)s.innerHTML='<div style="background:#fdecea;color:#8a1f17;border-radius:14px;padding:14px 16px;font-size:18px;font-weight:700;line-height:1.35">⚠ '+m+'</div>';const d=s&&s.closest('details');if(d&&!d.open){d.open=true}}
const takip0=takip;
takip=async function(){
 const p=document.getElementById('benim').value.trim(),oto=OTO;
 if(!izinli()){kapiCiz();return}
 if(!PLAN[p]){if(!oto)takip0();return}
 if(KILBEK)return;KILBEK=true;
 const r=await kilitAl(p,oto);KILBEK=false;
 if(r!==true){const m=p+' plakasını şu an '+(r=='sahip'?'aracın sahibi':'başka bir telefon')+' takip ediyor. Bir plakayı aynı anda tek telefon takip edebilir.';if(oto)sayacUyari(m+(IZ.plaka==p?' Kendin takip etmek için Takibi başlat tuşuna bas.':''));else alert(m);return}
 if(KIL&&KIL!==p)kilitBirak(KIL);
 gpsDur();KIL=p;takip0();kilitDinle(p);
};

// --- yönetici: telefonlar listesi
function cihazListesiDinle(){
 if(CLDIN||!FB)return;
 CLDIN=FB.collection('cihazlar').onSnapshot(sn=>{CLIST={};sn.forEach(d=>{CLIST[d.id]=d.data()});telBolumYenile()},()=>{});
}
function adminCihazKaydet(){
 if(ADMKAYIT||!FB)return;ADMKAYIT=true;
 const ref=FB.collection('cihazlar').doc(CIHAZ);
 ref.get().then(d=>{const x=d.data();if(!x||!x.onay)ref.set({kod:CKOD,onay:true,plaka:(x&&x.plaka)||'',model:cModel(),ad:'Yönetici',z:Date.now()},{merge:true})}).catch(()=>{ADMKAYIT=false});
}
function zaman(z){if(!z)return '';const d=new Date(z);return d.toLocaleDateString('tr-TR')+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
function telHtml(){
 const L=Object.entries(CLIST).sort((a,b)=>(b[1].z||0)-(a[1].z||0));
 const bek=L.filter(x=>!x[1].onay),ony=L.filter(x=>x[1].onay);
 const inp='style="width:110px;font-size:18px;padding:9px;border-radius:10px;border:1.5px solid #d5dde5;font-family:inherit"';
 const bt=(r,t,f)=>'<button onclick="'+f+'" style="font-family:inherit;font-size:16px;font-weight:800;border:0;border-radius:10px;padding:10px 14px;background:'+r+';color:#fff">'+t+'</button>';
 const sat=(id,x,yeni)=>'<div style="border-top:1px solid #edf0f3;padding:12px 0"><div style="display:flex;justify-content:space-between;align-items:center"><div><b style="font-size:24px;letter-spacing:3px">'+(x.kod||'----')+'</b> <span class="kucuk">'+(x.model||'')+(x.ad?' · '+x.ad:'')+(id===CIHAZ?' · bu telefon':'')+'</span>'+(yeni&&x.istek?'<div style="font-weight:800;color:#0f8a57">İstediği plaka: '+x.istek+'</div>':'')+'<div class="kucuk">'+zaman(x.z)+'</div></div></div><div style="display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap"><input id="tp_'+id+'" '+inp+' placeholder="Plaka" value="'+(x.plaka||x.istek||'')+'">'+(yeni?bt('#1fa36a','Onayla',"telOnay('"+id+"')"):bt('#16507e','Kaydet',"telOnay('"+id+"')"))+bt('#d33b34','Sil',"telSil('"+id+"')")+'</div></div>';
 let h='<p class="kucuk">Şoförün istediği plaka kutuya kendiliğinden yazılır. Kodu şoförün ekranındakiyle karşılaştır, doğruysa onayla. Silinen telefon uygulamayı açamaz.</p>';
 h+='<h3>Onay bekleyenler ('+bek.length+')</h3>'+(bek.length?bek.map(x=>sat(x[0],x[1],true)).join(''):'<p class="kucuk">Bekleyen yok.</p>');
 h+='<h3>Onaylı telefonlar ('+ony.length+')</h3>'+(ony.length?ony.map(x=>sat(x[0],x[1],false)).join(''):'<p class="kucuk">Henüz yok.</p>');
 return h;
}
function telBolumYenile(){
 if(!ADMIN)return;
 const al=document.getElementById('alan');if(!al)return;
 let b=al.querySelector('details[data-k="tel"]');
 const n=Object.values(CLIST).filter(x=>!x.onay).length;
 if(!b){b=document.createElement('details');b.className='bolum';b.dataset.k='tel';if(ac('tel'))b.open=true;const s=al.querySelector('details[data-k="sira"]');if(s)s.after(b);else al.prepend(b)}
 const ae=document.activeElement;if(ae&&b.contains(ae)&&ae.tagName=='INPUT'){setTimeout(telBolumYenile,1500);return}
 b.innerHTML='<summary>📱 Telefonlar'+(n?' <span style="background:#d33b34;color:#fff;border-radius:20px;font-size:15px;padding:2px 10px;margin-left:6px">'+n+' bekliyor</span>':'')+'</summary>'+telHtml();
}
function telOnay(id){
 const p=(document.getElementById('tp_'+id).value||'').trim();
 if(!p&&id!==CIHAZ){alert('Önce plakayı yaz.');return}
 FB.collection('cihazlar').doc(id).update({onay:true,plaka:p}).catch(e=>alert('Kaydedilemedi: '+e.code));
}
function telSil(id){
 const x=CLIST[id]||{};
 if(id===CIHAZ){alert('Kendi telefonunu silemezsin.');return}
 if(!confirm((x.kod||'')+' kodlu telefon'+(x.plaka?' ('+x.plaka+')':'')+' silinsin mi? Uygulamayı bir daha açamaz.'))return;
 FB.collection('cihazlar').doc(id).delete().catch(e=>alert('Silinemedi: '+e.code));
}

// --- ekran her çizildiğinde
const ciz0=ciz;
ciz=function(){ciz0();if(ADMIN){adminCihazKaydet();cihazListesiDinle();telBolumYenile()}benimDoldur();kapiCiz()};
if(ADMIN){adminCihazKaydet();cihazListesiDinle();telBolumYenile()}
kapiCiz();
if(ADMIN||IZ.d=='onay'){benimDoldur();setTimeout(otoTakip,0)}
