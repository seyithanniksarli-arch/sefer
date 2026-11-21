// sekme.js – alt sekme çubuğu, plaka karoları ve takip düğmesi (sofor.js ve izin.js'den sonra yüklenir)
// Her açılışta "Aracım" sekmesiyle başlar; son sekme hatırlanmaz.
var TAKIP_EL_DURDU=false;
(function(){
 var SEK=['aracim','sira','seferler','daha'];
 var kok=document.documentElement;
 function $(i){return document.getElementById(i)}
 function esc(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

 // --- alt boşluk: sekme çubuğu (+ Aracım'da sabit düğmeler) yüksekliği. ekle.js şeridi ve içerik padding'i bunu kullanır.
 function olc(){
  try{
   var nav=$('alt'),ak=$('aksiyon');if(!nav)return;
   var nh=nav.offsetHeight||78;
   kok.style.setProperty('--tab-yuk',nh+'px');
   var aracim=document.body.getAttribute('data-sekme')==='aracim';
   kok.style.setProperty('--alt-boslugu',(nh+(aracim&&ak?ak.offsetHeight:0))+'px');
  }catch(e){}
 }
 window.altSekme=function(k){
  if(SEK.indexOf(k)<0)k='aracim';
  document.body.setAttribute('data-sekme',k);
  SEK.forEach(function(x){var b=$('t_'+x);if(!b)return;if(x===k)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  olc();
  try{window.scrollTo(0,0)}catch(e){}
  if(k==='sira')siraKaro(true);
  if(k==='daha'&&typeof HARITA!=='undefined'&&HARITA){setTimeout(function(){try{HARITA.invalidateSize()}catch(e){}},80)}
 };

 // --- alt sekmeler: Sıra (Sıra / Her aracın son seferi / Tüm seferler) ve Daha fazla (Sıra ve araçlar / Sıra ayarları / Sefer saatleri / Telefonlar / Diğer)
 var SIRA_ALT=['sira','son','tum'],DAHA_ALT=['sira','ayar','saat','tel','diger'],DAHA_ADMIN=['saat','tel'];
 function altIsaret(onek,liste,k){liste.forEach(function(x){var b=$(onek+x);if(b)b.setAttribute('aria-current',x===k?'true':'false')})}
 window.siraAlt=function(k){
  if(SIRA_ALT.indexOf(k)<0)k='sira';
  var s=$('sek_sira');if(s)s.setAttribute('data-alt',k);
  altIsaret('sa_',SIRA_ALT,k);
  if(k==='sira')siraKaro(true);
 };
 window.dahaAlt=function(k){
  if(DAHA_ALT.indexOf(k)<0)k='sira';
  var adm=false;try{adm=!!ADMIN}catch(e){}
  if(!adm&&DAHA_ADMIN.indexOf(k)>=0)k='sira';
  var s=$('sek_daha');if(s)s.setAttribute('data-alt',k);
  altIsaret('dt_',DAHA_ALT,k);
  if(k==='tel'&&typeof telGoruldu==='function')telGoruldu();
  if(k==='diger'&&typeof HARITA!=='undefined'&&HARITA){setTimeout(function(){try{HARITA.invalidateSize()}catch(e){}},80)}
  try{window.scrollTo(0,0)}catch(e){}
 };
 function adminAltKontrol(){
  try{var s=$('sek_daha');if(s&&!ADMIN&&DAHA_ADMIN.indexOf(s.getAttribute('data-alt'))>=0)dahaAlt('sira')}catch(e){}
 }

 // --- Aracım: durak otomatik bulunur, elle de değiştirilebilir
 var HAT_AD={mim:'Mimarsinan',mur:'Muratçeşme'};
 window.durakEl=function(h){
  var b=$('benim'),v=b?b.value.trim():'';
  DURAK_EL=v?{n:plakaNorm(v),h:h}:null;
  if(h!==simdi)sekme(h);else hatButon();
  durakYaz();
 };
 function durakYaz(){
  try{
   var e=$('durakNot');if(!e)return;
   var v=(($('benim')||{}).value||'').trim(),m,uy=false;
   if(!v)m='Plakanı yazınca durağın kendiliğinden bulunur. İstersen elle değiştir.';
   else{
    var r=plakaBul(v),n=plakaNorm(v),el=DURAK_EL&&DURAK_EL.n===n;
    if(!r.length){m='Plaka bu günün listesinde bulunamadı. Plakayı ve tarihi kontrol et.';uy=true}
    else if(el){var q=r.filter(function(x){return x.hat===DURAK_EL.h})[0];if(q)m='Durak elle seçildi: '+HAT_AD[q.hat];else{m='Plakan '+HAT_AD[DURAK_EL.h]+' listesinde yok. Durağı değiştir.';uy=true}}
    else if(r.length>1)m='Plaka iki durakta da var. Durağı seç.';
    else if(r[0].hat===simdi)m='Durak otomatik bulundu: '+HAT_AD[r[0].hat]+'. Yanlışsa değiştirebilirsin.';
    else m='Plaka '+HAT_AD[r[0].hat]+' listesinde. Takibi başlatınca oraya geçilir; istersen şimdi seç.';
   }
   if(e.textContent!==m)e.textContent=m;
   e.className='durak-not'+(uy?' uyari':'');
  }catch(x){}
 }
 var pTimer=null;
 document.addEventListener('input',function(ev){
  if(ev.target&&ev.target.id==='benim'){clearTimeout(pTimer);durakYaz();pTimer=setTimeout(function(){try{plakaCoz(false)}catch(e){}durakYaz()},600)}
 });

 // --- Sıra sekmesi: plaka karoları
 var sonKaro='';
 function siraKaro(zorla){
  try{
   var e=$('plakaKaro');if(!e||typeof plakaListesi!=='function'||typeof durum==='undefined')return;
   var d=durum[simdi]||{},L=plakaListesi(),ariza=d.ariza||{},tur=d.tur||{},ort=d.ortak||{};
   var ben=(($('benim')||{}).value||'').trim();
   var hat=simdi=='mim'?MIM:MUR,ad=hat.ad;
   var n=ND(),bugun=tarih===gunStr(new Date()),ns=bugun?n.getHours()*3600+n.getMinutes()*60+n.getSeconds():-1;
   var sirada=null,eb=1e12;
   if(typeof PLAN==='object'&&PLAN)for(var p in PLAN){if(ariza[p])continue;var a=PLAN[p]||[];for(var i=0;i<a.length;i++){if(a[i]>=ns){if(a[i]<eb){eb=a[i];sirada=p}break}}}
   var h='';
   L.forEach(function(p,i){
    var etk='';
    var t=hat.turler.indexOf(tur[p])>=0?tur[p]:'nobetci';
    if(ariza[p])etk+='<span class="et ariza">Arızalı</span>';
    if(p===sirada)etk+='<span class="et sirada">Sıradaki</span>';
    if(p===ben&&ben)etk+='<span class="et sen">Senin aracın</span>';
    if(!ariza[p]&&t=='takviye')etk+='<span class="et tur">Takviye</span>';
    else if(!ariza[p]&&t=='dokuzcu')etk+='<span class="et tur">9\'cu</span>';
    if(ort[p]&&!ariza[p])etk+='<span class="et tur">Ortak</span>';
    h+='<div class="kr'+(p===ben&&ben?' ben':'')+(ariza[p]?' ariza-k':'')+'"><span class="kn">'+(i+1)+'. sıra</span><span class="kp">'+esc(p)+'</span><span class="kt">'+etk+'</span></div>';
   });
   if(!L.length)h='<p class="kucuk" style="grid-column:1/-1;margin:0">Bu hat için plaka listesi henüz girilmedi. Yönetici “Daha fazla” sekmesinden girer.</p>';
   var bas=ad+' sırası',say=L.length?L.length+' araç':'';
   var imza=bas+'|'+say+'|'+h+'|'+tarih+'|'+gun+'|'+mevsim;
   if(!zorla&&imza===sonKaro)return;
   sonKaro=imza;
   try{var gm=(typeof GUNAD!=='undefined'?GUNAD[gun]:'')+(typeof mevsim!=='undefined'?' · '+(mevsim=='yaz'?'Yaz':'Kış'):''),tt=$('siraTarih');if(tt)tt.textContent=tarih.split('-').reverse().join('.')+' · '+gm+' (değiştirmek için Daha fazla > Sıra ayarları)';
    var hg=document.querySelectorAll('.hat-gun');for(var q=0;q<hg.length;q++)hg[q].textContent=ad+' – '+GUNAD[gun]}catch(z){}
   e.innerHTML=h;var b=$('siraBaslik');if(b)b.textContent=bas;var s=$('siraSay');if(s)s.textContent=say;
  }catch(x){}
 }
 window.siraKaro=siraKaro;

 // --- Aracım: takip düğmesi + durum satırı
 function takipAcik(){
  try{return !!takipT&&Math.abs(ND().getTime()/1000-TIKSN)<3}catch(e){return false}
 }
 function durumYaz(){
  try{
   var ac=takipAcik(),dz=$('takipDurum'),dg=$('takipDugme'),yz=$('takipYazi');
   if(dz){var m=ac?(BENKONUM?'Takip açık, konum paylaşılıyor':'Takip açık, konum bekleniyor'):'Takip kapalı';var sp=dz.querySelector('span');if(sp&&sp.textContent!==m)sp.textContent=m;dz.className='durum'+(ac?' acik':'')}
   if(dg){dg.className='takip-dugme'+(ac?' acik':'')}
   if(yz){var t=ac?'Takibi durdur':'Takibi başlat';if(yz.textContent!==t)yz.textContent=t}
  }catch(e){}
 }
 window.takipDugme=function(){
  if(takipAcik()){
   TAKIP_EL_DURDU=true;
   var p=(($('benim')||{}).value||'').trim();
   try{if(typeof kilitBirak==='function'&&typeof KIL!=='undefined'&&KIL)kilitBirak(KIL)}catch(e){}
   try{if(typeof takipDurdur==='function')takipDurdur('');else{clearInterval(takipT);takipT=null;TP=null;if(typeof gpsDur==='function')gpsDur()}}catch(e){}
   try{if(navigator.vibrate)navigator.vibrate(0)}catch(e){}
   try{AKT=null;var s=$('sayac');if(s)s.innerHTML='';if(FB&&p)FB.collection('canli').doc(p).delete().catch(function(){})}catch(e){}
   durumYaz();return;
  }
  TAKIP_EL_DURDU=false;
  try{var r=takip();if(r&&r.then)r.then(durumYaz,durumYaz)}catch(e){}
  setTimeout(durumYaz,150);
 };
 // elle durdurulduysa sayfa yeniden çizilince takip kendiliğinden geri başlamasın
 try{if(typeof otoTakip==='function'){var oto0=otoTakip;otoTakip=function(){if(TAKIP_EL_DURDU)return;return oto0.apply(this,arguments)}}}catch(e){}

 // sayfa yeniden çizilince / plan yeniden hesaplanınca karolar hemen güncellensin
 try{var ciz1=ciz;ciz=function(){var r=ciz1.apply(this,arguments);siraKaro();adminAltKontrol();return r}}catch(e){}
 try{var hes1=hesapla;hesapla=function(){var r=hes1.apply(this,arguments);siraKaro();return r}}catch(e){}
 // plaka değişince karolar ve durum yenilensin
 function yenile(){siraKaro();durumYaz();durakYaz()}
 document.addEventListener('input',function(){setTimeout(yenile,0)});
 document.addEventListener('change',function(){setTimeout(yenile,0)});
 setInterval(yenile,1000);
 window.addEventListener('resize',olc);
 try{if(window.ResizeObserver){var ro=new ResizeObserver(olc);var a=$('alt'),b=$('aksiyon');if(a)ro.observe(a);if(b)ro.observe(b)}}catch(e){}
 window.addEventListener('load',olc);
 try{if(document.fonts&&document.fonts.ready)document.fonts.ready.then(olc)}catch(e){}

 altSekme('aracim');
 yenile();
})();
