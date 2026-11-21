const t=(h,m,s=0)=>h*3600+m*60+s;
const fmt=x=>{const h=Math.floor(x/3600),m=Math.floor(x%3600/60),s=x%60;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+(s?':'+String(s).padStart(2,'0'):'')};
const ADLAR={nobetci:'Nöbetçi',dokuzcu:'Dokuzcu',takviye:'Takviye'};
const GUNAD={hi:'Hafta içi',cmt:'Cumartesi',paz:'Pazar'};
const stdUz=()=>(simdi=='mim'?gun:gunOf('mim'))=='hi'&&!(durum.mim&&durum.mim.uzatYok);
const mimTur=s=>(stdUz()&&((s>=t(7,24)&&s<t(8,30))||(s>=t(15,0)&&s<t(19,0))))?71*60:65*60;
const MIM={ad:'Mimarsinan',son:t(23,0),tur:s=>mimTur(s)+uzEk(s,99,'mim')*60,turler:['nobetci','dokuzcu','takviye'],sinir:{nobetci:t(23,0),dokuzcu:t(20,45),takviye:t(19,30)}};
const MUR={ad:'Muratçeşme',son:t(22,0),tur:s=>45*60+uzEk(s,99,'mur')*60,turler:['nobetci','takviye'],sinir:{nobetci:t(22,0),takviye:t(19,30)}};
const GUN={
 hi:{
  mim:{sabah:[[5,54],[6,2],[6,10],[6,17],[6,25],[6,32,30],[6,40],[6,48],[6,54],[7,0],[7,6],[7,12],[7,18],[7,24],[7,30]],
   bant:[[t(7,30),t(8,30),300],[t(8,30),t(15,0),450],[t(15,0),t(19,0),360],[t(19,0),t(20,15),450],[t(20,15),t(21,45),600],[t(21,45),t(23,0),900]]},
  mur:{sabah:[[6,15],[6,30],[6,45],[7,0],[7,10],[7,20],[7,30]],
   bant:[[t(7,30),t(8,30),450],[t(8,30),t(19,0),600],[t(19,0),t(22,0),900]]}},
 cmt:{
  mim:{sabah:[[6,5],[6,15],[6,25],[6,35],[6,45],[6,52,30],[7,0],[7,7,30],[7,15],[7,22,30],[7,30],[7,37,30],[7,45],[7,52,30],[8,0]],
   bant:[[t(8,0),t(20,15),450],[t(20,15),t(21,45),600],[t(21,45),t(23,0),900]]},
  mur:{sabah:[[6,30],[6,45],[7,0],[7,10],[7,20],[7,30],[7,40]],
   bant:[[t(7,40),t(9,0),600],[t(9,0),t(22,0),900]]}},
 paz:{
  mim:{sabah:[[6,10],[6,20],[6,30],[6,40],[6,50],[7,0],[7,10],[7,20],[7,30],[7,40],[7,50],[8,0],[8,10],[8,20],[8,30],[8,40]],
   bant:[[t(8,40),t(10,0),600],[t(10,0),t(20,15),450],[t(20,15),t(21,45),600],[t(21,45),t(23,0),900]]},
  mur:{sabah:[[6,30],[6,45],[7,0],[7,15],[7,30],[7,45]],
   bant:[[t(7,45),t(22,0),900]]}}
};
function sabahOv(d,o){const L=((d||{}).sabah||[]).map(x=>String(x).trim().split(':').map(Number)).filter(q=>q.length>=2&&q.every(n=>!isNaN(n))).sort((x,y)=>t(...x)-t(...y));if(L.length)o.sabah=L;return o}
function ayar(){return sabahOv(durum[simdi],Object.assign({},simdi=='mim'?MIM:MUR,GUN[gun][simdi],{gb:(durum[simdi]||{}).bant}))}
function bantKat(taban,gb){
 const sv=x=>{const q=String(x||'').split(':');return q.length<2?NaN:t(+q[0],+q[1])};
 const G=(gb||[]).map(b=>[sv(b.b),sv(b.s),(+b.a)*60]).filter(b=>!isNaN(b[0])&&!isNaN(b[1])&&b[1]>b[0]&&b[2]>0);
 let L=taban.map(b=>b.slice());
 for(const g of G){const Y=[];for(const b of L){if(b[1]<=g[0]||b[0]>=g[1]){Y.push(b);continue}if(b[0]<g[0])Y.push([b[0],g[0],b[2]]);if(b[1]>g[1])Y.push([g[1],b[1],b[2]])}L=Y}
 return L.concat(G).sort((x,y)=>x[0]-y[0]);
}
function seferler(a){
 const o=a.sabah.map(x=>t(...x));let c=o[o.length-1];
 for(const b of bantKat(a.bant,a.gb)){if(c<b[0]-b[2]){c=b[0];o.push(c)}for(;;){const n=c+b[2];if(n>b[1]+0.5)break;o.push(n);c=n}}
 return [...new Set(o.map(x=>Math.round(x)))].sort((x,y)=>x-y).filter(x=>x<=a.son);
}
const bugun=new Date().getDay();
let gun=bugun==6?'cmt':(bugun==0?'paz':'hi');
let simdi='mim';
let mevsim=(new Date().getMonth()>=4&&new Date().getMonth()<=8)?'yaz':'kis';
let kilit=false;
const durum={mim:{plakalar:'',tur:{},ariza:{}},mur:{plakalar:'',tur:{},ariza:{}}};
function oku(){
 if(kilit)return;
 const d=durum[simdi];const e=document.getElementById('liste');
 if(document.querySelector('[data-sb]')){const L=[...document.querySelectorAll('[data-sb]')].map(x=>x.value.trim().replace('.',':')).filter(x=>/^\d{1,2}:\d{2}(:\d{2})?$/.test(x)).map(x=>t(...x.split(':').map(Number))).sort((x,y)=>x-y).map(fmt);d.sabah=L.join()==GUN[gun][simdi].sabah.map(x=>fmt(t(...x))).join()?[]:L}
 if(document.querySelector('[data-bi]')){d.bant=[];document.querySelectorAll('[data-bi]').forEach(r=>{const g=k=>r.querySelector('[data-b="'+k+'"]').value;if(g('b')&&g('s')&&+g('a')>0)d.bant.push({b:g('b'),s:g('s'),a:+g('a')})})}
 if(e)d.plakalar=e.value;
 document.querySelectorAll('[data-tur]').forEach(x=>{d.tur[x.dataset.tur]=x.value});
 document.querySelectorAll('[data-ariza]').forEach(x=>{d.ariza[x.dataset.ariza]=x.checked});
 if(!d.ortak)d.ortak={};document.querySelectorAll('[data-ortak]').forEach(x=>{d.ortak[x.dataset.ortak]=x.checked});
 {const c=document.getElementById('uzYok');if(c)durum.mim.uzatYok=c.checked}
 if(document.querySelector('[data-uzi]')){d.uzat=[];document.querySelectorAll('[data-uzi]').forEach(r=>{const g=x=>r.querySelector('[data-u="'+x+'"]').value;const e=[...r.querySelectorAll('[data-ue]')].map(x=>+x.value||0);if(g('b')&&g('s')&&e.some(x=>x))d.uzat.push({b:g('b'),s:g('s'),e:e})})}
 {const ar=document.getElementById('araclar');if(ar&&ar.dataset.hat==simdi){d.yokEk={};document.querySelectorAll('[data-yer]').forEach(r=>{const p=r.dataset.yer;(d.yokEk[p]=d.yokEk[p]||[]).push({b:r.querySelector('[data-yeb]').value,s:r.querySelector('[data-yes]').value})})}}
 if(!d.yok)d.yok={};document.querySelectorAll('[data-yokb]').forEach(x=>{const p=x.dataset.yokb;d.yok[p]=d.yok[p]||{};d.yok[p].b=x.value});document.querySelectorAll('[data-yoks]').forEach(x=>{const p=x.dataset.yoks;d.yok[p]=d.yok[p]||{};d.yok[p].s=x.value});
}
function plakaListesi(){return durum[simdi].plakalar.split(/[\s,;]+/).filter(x=>x)}
function gunButon(){for(const k of ['yaz','kis'])document.getElementById('m_'+k).className=k==mevsim?'aktif':'';for(const k of ['hi','cmt','paz'])document.getElementById('g_'+k).className=k==gun?'aktif':''}
function otoAta(){
 const d=durum.mim;const N=mevsim=='yaz'?8:7;
 const pl=plakaListesi().filter(p=>!d.ariza[p]&&d.tur[p]!='takviye');
 pl.forEach((p,i)=>{d.tur[p]=(pl.length-i)<=N?'nobetci':'dokuzcu'});
}
function turDegisti(el){
 const d=durum[simdi];const once=d.tur[el.dataset.tur]||'nobetci';
 oku();
 if(simdi=='mim'&&(el.value=='takviye'||once=='takviye')){otoAta();kilit=true;araclariCiz();kilit=false}
}
function mevsimSec(k){oku();mevsim=k;gunButon();if(simdi=='mim'&&plakaListesi().some(p=>durum.mim.tur[p]=='takviye'))otoAta();ciz()}
function gunSec(k){oku();gun=k;if(ADMIN){if(k==tarihGun())delete durum[simdi].gun;else durum[simdi].gun=k;kaydet()}gunButon();ciz()}
function sekme(k){
 oku();simdi=k;gun=gunOf(k);gunButon();
 document.getElementById('bMim').className=k=='mim'?'aktif':'';
 document.getElementById('bMur').className=k=='mur'?'aktif':'';
 ciz();
}
function araclariCiz(){
 const a=ayar(),d=durum[simdi];
 oku();
 let h='';
 for(const p of plakaListesi()){
  const secili=a.turler.includes(d.tur[p])?d.tur[p]:'nobetci';
  h+='<div class="arac"><b style="width:34px;color:#9fb0c3">'+(plakaListesi().length-plakaListesi().indexOf(p))+'</b><span>'+p+'</span><select data-tur="'+p+'" onchange="turDegisti(this)">'+a.turler.map(k=>'<option value="'+k+'"'+(k==secili?' selected':'')+'>'+ADLAR[k]+'</option>').join('')+'</select>'+
   '<label class="kucuk" style="margin:0">Arızalı</label><input type="checkbox" data-ariza="'+p+'"'+(d.ariza[p]?' checked':'')+'><label class="kucuk" style="margin:0">Ortak↓</label><input type="checkbox" data-ortak="'+p+'"'+(d.ortak&&d.ortak[p]?' checked':'')+'></div><div class="arac" style="margin-left:24px;flex-wrap:nowrap"><span class="kucuk" style="width:auto;font-size:15px">Yok</span><input type="time" data-yokb="'+p+'" value="'+((d.yok&&d.yok[p]&&d.yok[p].b)||'')+'" style="flex:1;min-width:0;width:auto;height:auto;font-size:15px;padding:6px"><span class="kucuk" style="width:auto;font-size:15px">–</span><input type="time" data-yoks="'+p+'" value="'+((d.yok&&d.yok[p]&&d.yok[p].s)||'')+'" style="flex:1;min-width:0;width:auto;height:auto;font-size:15px;padding:6px"><button onclick="yokTemizle(\''+p+'\')" style="flex:none;width:auto;padding:6px 12px;font-size:20px;border-radius:8px;border:0;background:#c0392b;color:#fff">−</button><button onclick="yokEkle(\''+p+'\')" style="flex:none;width:auto;padding:6px 12px;font-size:20px;border-radius:8px;border:0;background:#2f6fd6;color:#fff">+</button></div>'+yokEkHtml(d,p)+'';
 }
 document.getElementById('araclar').innerHTML=h;document.getElementById('araclar').dataset.hat=simdi;siraKilit();
}
function hesapla(){
 oku();
 const a=ayar(),d=durum[simdi];
 const sonuc=document.getElementById('sonuc');
 const canli=plakaListesi().filter(p=>!d.ariza[p]).map(p=>({p:p,k:a.turler.includes(d.tur[p])?d.tur[p]:'nobetci'}));
 if(canli.length==0){sonuc.innerHTML='<p>Plaka gir.</p>';return}
 const sf=seferler(a);
 const sonCikis={},say={};PLAN={};
 let idx=0,satirlar='';
 const YK={};const ykE=(p,y)=>{if(y&&y.b&&y.s){const q=y.b.split(':'),r=y.s.split(':');(YK[p]=YK[p]||[]).push([t(+q[0],+q[1]),t(+r[0],+r[1])])}};for(const c of canli){ykE(c.p,d.yok&&d.yok[c.p]);((d.yokEk&&d.yokEk[c.p])||[]).forEach(y=>ykE(c.p,y))}
 const yokMu=(p,s)=>!!YK[p]&&YK[p].some(x=>s>=x[0]&&s<x[1]);
 const BK={};const bekle=c=>{BK[c.p]={c:c,n:0}};
 const YPEN=simdi=='mur'?1:5;const yokSec=s=>{let r=null;for(const p in BK){const b=BK[p];if(!r&&!yokMu(p,s)&&b.n<=YPEN&&s<=a.sinir[b.c.k]){r=b.c;delete BK[p];continue}b.n++;if(b.n>YPEN)delete BK[p]}return r};
 sf.forEach(s=>{
  let secilen=yokSec(s);if(!secilen)
  for(let j=0;j<canli.length;j++){
   const c=canli[(idx+j)%canli.length];
   if(s<=a.sinir[c.k]){if(yokMu(c.p,s)){bekle(c);continue}secilen=c;idx=(idx+j+1)%canli.length;break}
  }
  if(!secilen){satirlar+='<tr class="bos"><td>'+fmt(s)+'</td><td>Araç yok</td><td></td><td></td></tr>';return}
  const p=secilen.p;
  say[p]=(say[p]||0)+1;
  let uyari='';
  if(sonCikis[p]!==undefined){
   const donus=sonCikis[p]+a.tur(sonCikis[p]);
   if(donus>s)uyari='Hızlanmalı, '+Math.ceil((donus-s)/60)+' dk geç';
  }
  sonCikis[p]=s;(PLAN[p]=PLAN[p]||[]).push(s);
  satirlar+='<tr'+(uyari?' class="uyari"':'')+'><td>'+fmt(s)+'</td><td>'+p+'</td><td>'+say[p]+'</td><td>'+uyari+'</td></tr>';
 });
 let ozet='<h3>Her aracın son seferi</h3><table><tr><th>Araç</th><th>Tür</th><th>Son sefer</th><th>Toplam</th></tr>';
 for(const c of canli){ozet+='<tr><td>'+c.p+'</td><td>'+ADLAR[c.k]+'</td><td>'+(sonCikis[c.p]!==undefined?fmt(sonCikis[c.p]):'-')+'</td><td>'+(say[c.p]||0)+'</td></tr>'}
 ozet+='</table>';
 sonuc.innerHTML=ozet+'<h3>Tüm seferler</h3><table><tr><th>Saat</th><th>Araç</th><th>Servis</th><th>Uyarı</th></tr>'+satirlar+'</table>';{let g=0;const gd=[];for(const q in PLAN){g+=PLAN[q].length;for(const x of PLAN[q])gd.push(x)}GSL[simdi]=g;GSD[simdi]=gd.sort((p,q)=>p-q);GUNSEFER=(GSL.mim||0)+(GSL.mur||0)}planYayinla();
}
function excel(){
 const r=[];
 const tb=document.querySelectorAll('#sonuc table');const son=tb[tb.length-1];const m={},sira=[];
 if(son)[...son.rows].slice(1).forEach(tr=>{const s=tr.cells[0].innerText,p=tr.cells[1].innerText;if(p=='Araç yok')return;if(!m[p]){m[p]=[];sira.push(p)}m[p].push(s)});
 let en=0;sira.forEach(p=>{en=Math.max(en,m[p].length)});
 if(sira.length){const bas=['Plaka'];for(let i=1;i<=en;i++)bas.push(i+'. servis');r.push(bas.join(';'))}
 sira.forEach(p=>r.push([p,...m[p]].join(';')));
 if(!r.length){alert('Önce Hesapla tuşuna bas');return}
 const b=new Blob(['\ufeff'+r.join('\r\n')],{type:'text/csv;charset=utf-8'});
 const a=document.createElement('a');
 a.href=URL.createObjectURL(b);
 a.download='sefer_'+simdi+'_'+gun+'.csv';
 document.body.appendChild(a);a.click();a.remove();
}
function pdf(){
 const tb=document.querySelectorAll('#sonuc table');const son=tb[tb.length-1];
 if(!son){alert('Önce Hesapla tuşuna bas');return}
 const m={},sira=[];
 [...son.rows].slice(1).forEach(tr=>{const s=tr.cells[0].innerText,p=tr.cells[1].innerText;if(p=='Araç yok')return;if(!m[p]){m[p]=[];sira.push(p)}m[p].push(s)});
 let en=0;sira.forEach(p=>{en=Math.max(en,m[p].length)});
 let h='<tr><th>Plaka</th>';for(let i=1;i<=en;i++)h+='<th>'+i+'. servis</th>';h+='</tr>';
 sira.forEach((p,k)=>{h+='<tr'+(k%2?' class="z"':'')+'><td class="p">'+p+'</td>';for(let i=0;i<en;i++)h+='<td>'+(m[p][i]||'')+'</td>';h+='</tr>'});
 const baslik=ayar().ad+' – '+GUNAD[gun]+' – '+new Date().toLocaleDateString('tr-TR');
 const w=window.open('','_blank');
 if(!w){alert('Açılır pencereye izin ver');return}
 w.document.write('<html><head><meta charset="utf-8"><title>'+baslik+'</title><style>@page{size:A4 landscape;margin:8mm}body{font-family:Arial,sans-serif;margin:8px}h2{margin:4px 0 8px;font-size:18px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #444;padding:4px 3px;text-align:center}th{background:#1fa36a;color:#fff}td.p{font-weight:bold;font-size:14px;background:#e7f1fb}tr.z td{background:#f2f2f2}tr.z td.p{background:#e7f1fb}</style></head><body><h2>'+baslik+'</h2><table>'+h+'</table></body></html>');
 w.document.close();w.focus();setTimeout(()=>w.print(),400);
}
function yeniFormat(x){
 if(!/B\s*Ç\s*G\s*D/.test(x))return x;
 const AD='(Fatih|Do[ğg]an\\s*G[ıi]da|Do[ğg]an\\s*G|Macro2|Macro|TaksiDura[ğg][ıi]2|TaksiDura[ğg][ıi]|TaksiDu\\S*|Moro[ğg]lu|Bal[ıi]k[çc][ıi]|Metrob[üu]s?|T[üu]yap2|Atirus2|Eczane2|Atrium)';
 x=x.replace(/S[üu]re:\s*\d\d:\d\d:\d\d/g,' ');
 x=x.replace(/İ?B\s*Ç\s*G\s*D\s+(\d+)\s+(?:\S+\s+)?(?:(\d\d:\d\d:\d\d)\s+)?(\d\d:\d\d:\d\d)/g,' #$1 BS: $3 ');
 x=x.replace(new RegExp(AD+'\\s+(\\d\\d:\\d\\d:\\d\\d)\\s+(\\d\\d:\\d\\d:\\d\\d)(?:\\s+\\d\\d:\\d\\d:\\d\\d)?(?:\\s+-?\\d+\\s*dk)?(?:\\s*X)?(?:\\s*-\\s*\\d\\d:\\d\\d:\\d\\d)?','g'),' $1 $3 ');
 return x;
}
async function pdfOku(f){return yeniFormat(await pdfOku0(f))}
async function pdfOku0(f){
 if(!window.pdfjsLib){
  await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)});
  pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 }
 const doc=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;
 let txt='';
 for(let i=1;i<=doc.numPages;i++){const c=await (await doc.getPage(i)).getTextContent();txt+=c.items.map(x=>x.str).join(' ')+' '}
 return txt;
}
const DURAK_RX='(Fatih|Do[ğg]an\\s*G|Macro2|Macro|TaksiDu|Moro[ğg]lu|Bal[ıi]k[çc][ıi]|Metrob[üu]|T[üu]yap2|Atirus2|Eczane2|Atrium)\\s*(\\d\\d):(\\d\\d):(\\d\\d)';
const OFS={g:{doang:[4,4],macro:[7,7],taksidu:[12,12],morolu:[16,16],balk:[18,18],metrob:[30,32]},
 d:{tyap2:[35,36],atirus2:[43,44],eczane2:[49,52],taksidu:[55,60],macro2:[60,65],atrium:[65,71]}};
const ara=(s,a,b)=>s>=a&&s<b;
function gec(varis,plan){const d=varis-plan;return d<60?0:Math.floor(d/30)/2}
function cumaEk(o,yon,n,c){if(!c)return o;const e=yon=='g'?{taksidu:1,balk:1,morolu:1}:{macro2:1,atrium:1};return e[n]?[o[0]+1,o[1]+1]:o}
async function carpiHesap(f){
 let el=document.getElementById('carpi');if(!f&&!SON_TXT)return;
 let txt;
 if(f){el.innerHTML='<p>PDF okunuyor...</p>';try{txt=await pdfOku(f)}catch(e){el.innerHTML='<p>PDF okunamadı. İnternet bağlantısı gerekli.</p>';return}SON_TXT=txt;HARIC={}}else txt=SON_TXT;
 {const dm=txt.match(/[İI]hlal:\s*\d+\s*\/\s*\d+\s*(\d\d)\.(\d\d)\.(\d{4})/);if(dm){const pt=dm[3]+'-'+dm[2]+'-'+dm[1];if(pt!==tarih){if(dbOku()[pt]){tarihSec(pt);el=document.getElementById('carpi')}else{alert(pt+' tarihli kayıtlı liste yok. Önce o günü seçip plakaları gir.');el.innerHTML='';return}}}}
 if(/Akbelde/.test(txt)){carpiMur(txt,el);return}
 const {IS,SIRA}=ilkSeferler();
 const dt=txt.match(/[İI]hlal:\s*\d+\s*\/\s*\d+\s*(\d\d)\.(\d\d)\.(\d{4})/)||txt.match(/(\d\d)\.(\d\d)\.(\d{4})/);const CUMA=dt?new Date(+dt[3],+dt[2]-1,+dt[1]).getDay()==5:false;
 const d0=durum.mim;const ORT={};for(const p in (d0.ortak||{}))if(d0.ortak[p]&&!d0.ariza[p])ORT[p.replace(/\D/g,'')]=1;
 const EV={},AD={},TK={};OKU=[];
 const SLOT={};{const A=[];for(const p of txt.split(/Hat\s*No\s*:\s*/).slice(1)){const pm=p.match(/^\s*(\S+?)\s*Gidi/);if(!pm)continue;const k=pm[1].replace(/\D/g,'');for(const s of p.split(/#\s*\d+/).slice(1)){const q=s.replace(/BS:\s*\d\d:\d\d:\d\d/,'').replace(/[ÇİI]:/g,'').match(/^\s*Fatih\s+(\d\d):(\d\d):(\d\d)/);if(!q)continue;{const sx=s.replace(/BS:\s*\d\d:\d\d:\d\d/,'').replace(/TS:\s*\d\d:\d\d:\d\d/,'');const nz=(sx.match(/\d\d:\d\d:\d\d/g)||[]).filter(z=>z!='00:00:00').length;if(nz<6)continue}const tm=(+q[1])*3600+(+q[2])*60+(+q[3]);if(tm)A.push([tm,k])}}A.sort((x,y)=>x[0]-y[0]);const SF=seferler(sabahOv(durum.mim,Object.assign({},MIM,GUN[gunOf('mim')].mim,{gb:durum.mim.bant})));A.forEach((x,i)=>{if(i<SF.length)SLOT[x[1]+'@'+x[0]]=SF[i]})}
 for(const p of txt.split(/Hat\s*No\s*:\s*/).slice(1)){
  const pm=p.match(/^\s*(\S+?)\s*Gidi/);if(!pm)continue;
  const plk=pm[1].replace(/\D/g,'');AD[plk]=pm[1];const ev=EV[plk]=[];TK[plk]=[0,0];
  let base=null,ilkYok=true;
  for(const s of p.split(/#\s*\d+/).slice(1)){TK[plk][0]++;
   const d=[];let m;const rx=new RegExp(DURAK_RX,'g');
   const ts=s.replace(/TS:\s*\d\d:\d\d:\d\d/,'').replace(/BS:\s*\d\d:\d\d:\d\d/,'');let adl=ts.match(/Fatih|Do[ğg]an\s*G|Macro2|Macro|TaksiDu|Moro[ğg]lu|Bal[ıi]k[çc][ıi]|Metrob[üu]|T[üu]yap2|Atirus2|Eczane2|Atrium/g)||[];const sa=ts.match(/\d\d:\d\d:\d\d/g)||[];
   const kk=adl[0]&&/^Fat/.test(adl[0])?8:7;adl=adl.slice(0,kk);
   if(adl.length===kk&&sa.length>=kk)adl.forEach((n,k)=>{const q=sa[k].split(':');const tm=(+q[0])*3600+(+q[1])*60+(+q[2]);if(tm)d.push([n.toLowerCase().replace(/[^a-z0-9]/g,''),tm])});
   else while((m=rx.exec(s))){const tm=(+m[2])*3600+(+m[3])*60+(+m[4]);if(tm)d.push([m[1].toLowerCase().replace(/[^a-z0-9]/g,''),tm])}
   const bs=s.match(/BS:\s*(\d\d):(\d\d):(\d\d)/);
   if(!d.length||!bs)continue;
   const b=(+bs[1])*3600+(+bs[2])*60+(+bs[3]);
   const yon=d[0][0]=='fatih'?'g':(d[0][0]=='tyap2'?'d':null);
   if(!yon)continue;
   let ilkTek=false;
   if(yon=='g'){if(ilkYok&&IS[plk]!==undefined){base=IS[plk];ilkTek=true;ilkYok=false}else{const fd=d[0][1];const sl=SLOT[plk+'@'+fd];ilkYok=false;if(sl!==undefined)base=sl;else{base=null;continue}}}
   if(base===null)continue;if(yon=='g'&&ORT[plk]){const B=SIRA[SIRA.indexOf(plk)+1];const LB=B&&IS['_'+B];if(LB){const nb=LB.find(x=>x>base);if(nb!==undefined&&nb-base<=1200)base=nb}}TK[plk][1]++;
   const uz=(stdUz()&&(ara(base,t(7,24),t(8,30))||ara(base,t(15,0),t(19,0))))?1:0;
   const mor=!(durum.mim&&durum.mim.uzatYok)&&(ara(base,t(8,0),t(9,0))||ara(base,t(15,30),t(16,30)));
   let enb=0;
   for(const [n,tm] of d){const o0=OFS[yon][n];if(!o0)continue;const o=cumaEk(o0,yon,n,CUMA&&base>=t(12,0));if(n=='morolu'&&!mor)continue;if(n=='balk'&&mor)continue;if(tm<base||tm-base>3*3600)continue;enb=Math.max(enb,gec(tm,base+(o[uz]+uzEk(base,SIX[n+yon],'mim'))*60))}
   const sk=base+(yon=='d'?1:0),gs=yon=='g'?base:b;
   if(yon=='d')base=null;
   const hk=plk+'@'+sk;OKU.push({k:hk,p:plk,g:gs,enb:enb,yon:yon,ilk:ilkTek});if(HARIC[hk])continue;if(enb>60||enb<=0)continue;
   ev.push({tm:sk,g:gs,enb:enb,ilk:ilkTek,yon:yon,p:plk});
  }
 }
 const birim=[];let i=0;
 while(i<SIRA.length){const a=SIRA[i];if(ORT[a]&&i+1<SIRA.length){birim.push([a,SIRA[i+1]]);i+=2}else{birim.push([a]);i++}}
 for(const k in EV)if(!SIRA.includes(k))birim.push([k]);
 let h='<table><tr><th>Araç</th><th>Tolerans</th><th>Çarpı</th><th>Tutar</th><th>Geç kalınan tekler</th></tr>';
 let top=0,topTL=0;const kimKime=[];
 for(const u of birim){
  if(!u.some(x=>EV[x]))continue;
  const evs=[].concat(...u.map(x=>EV[x]||[])).sort((x,y)=>x.tm-y.tm);
  let kul=0,carpi=0,ilkC=0;const det=[];
  for(const e of evs){
   const on=u.length>1?(AD[e.p]||e.p)+' – ':'';
   if(e.ilk){ilkC++;kul=Math.min(10,kul+e.enb);det.push(on+'İlk servis '+fmt(e.g)+': '+e.enb+' dk – ÇARPI 700 TL');continue}
   let c=false;if(kul+e.enb<=10)kul+=e.enb;else{kul=10;carpi++;c=true}
   det.push(on+(e.yon=='g'?'Gidiş ':'Dönüş ')+fmt(e.g)+': '+e.enb+' dk'+(c?' – ÇARPI':''));
  }
  const tl=carpi*500+ilkC*700;top+=carpi+ilkC;topTL+=tl;
  const ai=SIRA.indexOf(u[u.length-1]);
  const arka=ai>=0&&SIRA.length>u.length?SIRA[(ai+1)%SIRA.length]:'';
  const ad=u.map(x=>AD[x]||x).join(' + ');const ar=AD[arka]||arka;
  if(tl&&arka)kimKime.push(ad+' → '+ar+': '+(carpi+ilkC)+' çarpı, '+tl+' TL');
  h+='<tr'+(tl?' class="uyari"':'')+'><td>'+ad+(u.length>1?' (ortak)':'')+'<br><span class="kucuk">okunan tek: '+u.map(x=>TK[x]?TK[x][1]+'/'+TK[x][0]:'-').join(', ')+'</span></td><td>'+kul+' / 10 dk</td><td>'+(carpi+ilkC)+(ilkC?' ('+ilkC+' ilk servis)':'')+'</td><td>'+tl+' TL'+(arka&&tl?' → '+ar:'')+'</td><td class="kucuk">'+det.join('<br>')+'</td></tr>';
 }
 el.innerHTML=h+'</table>'+okunanHtml(AD)+'<p>Toplam: '+top+' çarpı, '+topTL+' TL. Sıkışma cezası henüz hesaba katılmıyor.</p><details><summary>PDF metni (kontrol)</summary><pre style="white-space:pre-wrap;font-size:11px">'+txt.slice(0,1500).replace(/</g,'&lt;')+'</pre></details>'+(kimKime.length?'<h3>Kim kime veriyor</h3><p>'+kimKime.join('<br>')+'</p>':'')+'<button class="ana" style="background:#c0392b" onclick="carpiPdf()">Çarpıları PDF olarak al</button>';
}
async function carpiHesapEski(f){
 const el=document.getElementById('carpi');if(!f)return;
 el.innerHTML='<p>PDF okunuyor...</p>';
 let txt;
 try{txt=await pdfOku(f)}catch(e){el.innerHTML='<p>PDF okunamadı. İnternet bağlantısı gerekli.</p>';return}
 const parcalar=txt.split(/Hat\s*No\s*:\s*/).slice(1);
 let h='<table><tr><th>Araç</th><th>Tolerans</th><th>Çarpı</th><th>Tutar</th><th>Geç kalınan tekler</th></tr>';
 let toplam=0,ilkT=0;const kimKime=[];const {IS,SIRA}=ilkSeferler();
 for(const p of parcalar){
  const pm=p.match(/^\s*(\S+?)\s*Gidi/);if(!pm)continue;
  let base=null,kul=0,carpi=0,ilkC=0,ilkYok=true;const det=[];const plk=pm[1].replace(/\D/g,'');
  for(const s of p.split(/#\d+\s/).slice(1)){
   const d=[];let m;const rx=new RegExp(DURAK_RX,'g');
   while((m=rx.exec(s))){const tm=(+m[2])*3600+(+m[3])*60+(+m[4]);if(tm)d.push([m[1].toLowerCase().replace(/[^a-z0-9]/g,''),tm])}
   const bs=s.match(/BS:\s*(\d\d):(\d\d):(\d\d)/);
   if(!d.length||!bs)continue;
   const b=(+bs[1])*3600+(+bs[2])*60+(+bs[3]);
   const yon=d[0][0]=='fatih'?'g':(d[0][0]=='tyap2'?'d':null);
   if(!yon)continue;
   let ilkTek=false;
   if(yon=='g'){if(ilkYok&&IS[plk]!==undefined){base=IS[plk];ilkTek=true;ilkYok=false}else{if(!b||b>=t(23,59)){base=null;continue}base=b;ilkYok=false}}
   if(base===null)continue;
   const uz=(ara(base,t(7,24),t(8,30))||ara(base,t(15,0),t(19,0)))?1:0;
   const mor=!(durum.mim&&durum.mim.uzatYok)&&(ara(base,t(8,0),t(9,0))||ara(base,t(15,30),t(16,30)));
   let enb=0;
   for(const [n,tm] of d){
    const o=OFS[yon][n];if(!o)continue;
    if(n=='morolu'&&!mor)continue;
    if(n=='balk'&&mor)continue;
    if(tm<base||tm-base>3*3600)continue;
    enb=Math.max(enb,gec(tm,base+o[uz]*60));
   }
   if(yon=='d')base=null;
   if(enb>60)continue;
   if(ilkTek){if(enb>0){ilkC=1;kul=Math.min(10,kul+enb);det.push('İlk servis '+fmt(base)+': '+enb+' dk – ÇARPI 700 TL')}continue}
   if(enb>0){
    let c=false;
    if(kul+enb<=10)kul+=enb;else{kul=10;carpi++;c=true}
    det.push((yon=='g'?'Gidiş ':'Dönüş ')+fmt(b)+': '+enb+' dk'+(c?' – ÇARPI':''));
   }
  }
  toplam+=carpi;ilkT+=ilkC;const tl=carpi*500+ilkC*700;const ai=SIRA.indexOf(plk);const arka=ai>=0&&SIRA.length>1?SIRA[(ai+1)%SIRA.length]:'';if(tl&&arka)kimKime.push(pm[1]+' → '+arka+': '+(carpi+ilkC)+' çarpı, '+tl+' TL');
  h+='<tr'+(tl?' class="uyari"':'')+'><td>'+pm[1]+'</td><td>'+kul+' / 10 dk</td><td>'+(carpi+ilkC)+(ilkC?' (1 ilk servis)':'')+'</td><td>'+tl+' TL'+(arka&&tl?' → '+arka:'')+'</td><td class="kucuk">'+det.join('<br>')+'</td></tr>';
 }
 el.innerHTML=h+'</table><p>Toplam: '+(toplam+ilkT)+' çarpı, '+(toplam*500+ilkT*700)+' TL. Sıkışma cezası henüz hesaba katılmıyor.</p>'+(kimKime.length?'<h3>Kim kime veriyor</h3><p>'+kimKime.join('<br>')+'</p>':'')+'<button class="ana" style="background:#c0392b" onclick="carpiPdf()">Çarpıları PDF olarak al</button>';
}
function ilkSeferler(){
 if(simdi=='mim')oku();
 const a=Object.assign({},MIM,GUN[gunOf('mim')].mim),d=durum.mim;
 const canli=d.plakalar.split(/[\s,;]+/).filter(x=>x&&!d.ariza[x]).map(p=>({p:p,k:a.turler.includes(d.tur[p])?d.tur[p]:'nobetci'}));
 const IS={},SIRA=canli.map(c=>c.p.replace(/\D/g,''));
 if(!canli.length)return {IS,SIRA};
 let idx=0;
 for(const s of seferler(a)){for(let j=0;j<canli.length;j++){const c=canli[(idx+j)%canli.length];if(s<=a.sinir[c.k]){const k=c.p.replace(/\D/g,'');if(IS[k]===undefined)IS[k]=s;(IS['_'+k]=IS['_'+k]||[]).push(s);idx=(idx+j+1)%canli.length;break}}}
 return {IS,SIRA};
}
function carpiPdf(){
 const tb=document.querySelector('#carpi table');
 if(!tb){alert('Önce PDF yükle');return}
 const ozet=document.querySelector('#carpi p');
 const baslik='Çarpı Raporu – '+new Date().toLocaleDateString('tr-TR');
 const w=window.open('','_blank');
 if(!w){alert('Açılır pencereye izin ver');return}
 w.document.write('<html><head><meta charset="utf-8"><title>'+baslik+'</title><style>@page{size:A4 portrait;margin:10mm}body{font-family:Arial,sans-serif}h2{font-size:18px;margin:4px 0 10px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #444;padding:5px;text-align:left;vertical-align:top}th{background:#1fa36a;color:#fff}tr.uyari td{background:#fbebeb}td:first-child{font-weight:bold;font-size:14px}p{font-weight:bold;margin-top:10px}</style></head><body><h2>'+baslik+'</h2>'+tb.outerHTML+[...document.querySelectorAll('#carpi h3,#carpi p')].map(x=>x.outerHTML).join('')+'</body></html>');
 w.document.close();w.focus();setTimeout(()=>w.print(),400);
}
var TIKSN=0;const ND=()=>typeof simdiD==='function'?simdiD():new Date();var GSL={},GSD={},GUNSEFER=0;let PLAN={},takipT=null,uyarildi={},ctx=null;
let AKT=null,GEC=null,GECZ=0,CG=0,OTO=false;
function otoTakip(){if(OTO||takipT)return;try{const p=localStorage.getItem('benim'),h=localStorage.getItem('benimHat');if(!p)return;if(h&&h!==simdi&&durum[h]&&(durum[h].plakalar||'').split(/[\s,;]+/).includes(p)){OTO=true;sekme(h);OTO=false}if(!PLAN[p])return;OTO=true;const d=document.querySelector('details[data-k=takip]');if(d)d.open=true;document.getElementById('benim').value=p;takip();OTO=false}catch(e){OTO=false}}
document.addEventListener('pointerdown',()=>{try{if(ctx)ctx.resume();if(navigator.wakeLock&&takipT)navigator.wakeLock.request('screen').catch(()=>{})}catch(e){}});const PY={};
function ikiHat(){if(kilit||tarih!==gunStr(new Date()))return;const o=simdi,og=gun;try{oku();kilit=true;for(const b of ['mim','mur']){if(b===o||!durum[b].plakalar)continue;simdi=b;gun=gunOf(b);hesapla()}}catch(e){}simdi=o;gun=og;if(durum[o].plakalar)hesapla();else PLAN={};kilit=false}
function planYayinla(){try{if(!FB||tarih!==gunStr(new Date()))return;const Lp=[];for(const p in PLAN)for(const s of PLAN[p])Lp.push([s,p,dur2(s,simdi).map(x=>[x[0],x[1]])]);Lp.sort((a,b)=>a[0]-b[0]);const v=JSON.stringify(Lp);if(PY[simdi]===v)return;PY[simdi]=v;const o={z:Date.now()};o[simdi]=v;FB.collection('plan').doc(tarih).set(o,{merge:true}).catch(()=>{delete PY[simdi]})}catch(e){}}
function canliPencere(p){const n=ND(),s=n.getHours()*3600+n.getMinutes()*60+n.getSeconds(),B=TB||simdi;return (TP||PLAN[p]||[]).some(x=>{const D=dur2(x,B);return s>=x-300&&s<=x+D[D.length-1][1]*60})}let CPAY=false;
function canliGonder(p){if(FB&&!canliPencere(p)){if(CPAY){CPAY=false;FB.collection('canli').doc(p).delete().catch(()=>{})}return}CPAY=true;if(!FB||!BENKONUM||Date.now()-CG<15000)return;CG=Date.now();FB.collection('canli').doc(p).set({lat:BENKONUM[0],lng:BENKONUM[1],z:Date.now(),hat:TB||simdi,dep:AKT,gec:(Date.now()-GECZ<120000)?GEC:null}).catch(()=>{})}
let TP=null,TB=null;
function dur2(x,B){return B=='mur'?[['Göbek',3],['Kiptaş',5],['Akbelde',8],['Metrobüs',27],['TÜYAP',32],['Çekmece',40],['Hastane',45+uzEk(x,99,'mur')]]:duraklar(x)}
function tokatUyari(p,s){if(TB!='mur')return;let e=document.getElementById('tokatUyari');if(!e){const c=document.getElementById('sayac');if(!c)return;e=document.createElement('div');e.id='tokatUyari';c.parentNode.insertBefore(e,c)}const x=TP.find(x=>{const r=x%3600,t=x-r;return(r==600||r==900)&&x>=32400+r&&x<=64800+r&&s>=t-300&&s<=t+60});if(x===undefined){e.innerHTML='';return}const t=x-x%3600,m="Tokat Mahallesi'ne git! Kalkış "+fmt(t).slice(0,5)+" · sefer "+fmt(x).slice(0,5);e.innerHTML='<div style="background:#c62828;color:#fff;font-weight:700;text-align:center;padding:12px;margin:8px 0;border-radius:8px">'+m+'</div>';if(!uyarildi['T'+x]){uyarildi['T'+x]=1;bip(880,0.6);setTimeout(()=>bip(880,0.6),800);if(navigator.vibrate)navigator.vibrate([500,200,500]);if(window.Notification&&Notification.permission=='granted')new Notification("Tokat Mahallesi'ne git",{body:m})}}
function bip(f,d){try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=f;o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+d)}catch(e){}}
function duraklar(dep){const c=new Date().getDay()==5&&dep>=t(12,0);const r=duraklar0(dep);return c?r.map(x=>[x[0],x[1]+({'Denizgören':1,'Moroğlu':1,'Balıkçı':1,'Makro':1,'Atrium':1}[x[0]]||0)]):r}
function duraklar0(dep){
 const uz=(stdUz()&&(ara(dep,t(7,24),t(8,30))||ara(dep,t(15,0),t(19,0))))?1:0;
 const mor=!(durum.mim&&durum.mim.uzatYok)&&(ara(dep,t(8,0),t(9,0))||ara(dep,t(15,30),t(16,30)));
 return [['Doğan Gıda',4,4],['Makro Çarşı',7,7],['Denizgören',12,12],mor?['Moroğlu',16,16]:['Balıkçı',18,18],['Metrobüs',30,32],['TÜYAP',35,36],['Çekmece',43,44],['Mimar Sinan',49,52],['Meydan',55,60],['Makro',60,65],['Atrium',65,71]].map((x,i)=>[x[0],x[uz?2:1]+uzEk(dep,i,'mim')]);
}
const SVG_TRAFIK='<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--turuncu)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>';
const SVG_OTOBUS='<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mavi-yazi)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="14" rx="2.5"/><path d="M4 11h16M8 17v3M16 17v3"/></svg>';
const SVG_TIK='<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--yesil-yazi)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const sure2=n=>{n=Math.max(0,Math.round(n));const h=Math.floor(n/3600),m=Math.floor(n%3600/60),sn=n%60;return (h?h+':'+String(m).padStart(2,'0'):String(m).padStart(2,'0'))+':'+String(sn).padStart(2,'0')};
function aktKart(baslik,sag,sure,ad,plan,neg,kirmizi){
 return '<section class="akt" aria-label="'+baslik+'"><div class="akt-bas"><span>'+baslik+'</span><span>'+sag+'</span></div><div class="akt-gov"><div class="akt-sure'+(neg?' neg':'')+(kirmizi?' kirmizi':'')+'">'+sure+'</div>'+(ad?'<div class="akt-ad">'+ad+'</div>':'')+(plan?'<p class="akt-plan">'+plan+'</p>':'')+'</div></section>';
}
function durakListe(dep,D,hi,B){
 const L=[[B=='mur'?'Muratçeşme':'Fatih Market',0]].concat(D);
 let h='<section aria-label="Duraklar"><div class="dur-bas"><h2>Duraklar</h2><span>'+fmt(dep).slice(0,5)+' seferi</span></div><div class="dur-kart">';
 L.forEach((x,i)=>{
  const ik=i<hi?SVG_TIK:(i==hi?'<span class="ik-simdi"></span>':'<span class="ik-sonra"></span>');
  const dk=Math.round(x[1]*10)/10;
  h+='<div class="dur-sat"'+(i==hi?' aria-current="step"':'')+'>'+ik+'<span class="dn">'+x[0]+'</span><span class="dz">'+fmt(Math.round(dep+x[1]*60)).slice(0,5)+'</span><span class="dd">'+String(dk).replace('.',',')+' dk</span></div>';
 });
 return h+'</div></section>';
}
const SAATY=()=>typeof saatYazi==='function'?saatYazi():'';
function aktifGoster(p,s,el){
 const B=TB||simdi;
 let dep=null;
 for(const x of (TP||PLAN[p]||[])){const D=dur2(x,B);const LP=TP||PLAN[p]||[];const nx=LP[LP.indexOf(x)+1];const son=Math.min(x+D[D.length-1][1]*60+600,nx!==undefined?nx-300:1e9);if(s>=x-15&&s<son&&!VARDI[x]){dep=x;break}}
 if(dep===null){AKT=null;return false}{const Dt=dur2(dep,TB||simdi),tr=Dt[Dt.length-1][1]*60;if(s-dep>=tr){AKT=null;const m=Math.floor(tr/60),sn=Math.round(tr%60);el.innerHTML=aktKart('AKTİF SEFER',fmt(dep).slice(0,5)+' kalkış',String(m).padStart(2,'0')+':'+String(sn).padStart(2,'0'),'Sefer tamamlandı',fmt(dep)+' seferi')+SAATY();return true}}AKT=dep;
 const D=dur2(dep,B),e=s-dep;
 let ad=B=='mur'?'Muratçeşme – kalkış':'Fatih Market – kalkış',hedef=dep;
 if(e>=0){const h=D.find(x=>(Math.floor(x[1])+1)*60>e)||D[D.length-1];ad=h[0];hedef=dep+h[1]*60}
 const a=Math.abs(e),sw=(e<0?'-':'')+String(Math.floor(a/60)).padStart(2,'0')+':'+String(a%60).padStart(2,'0');
 const k=hedef-s;
 const hi=e>=0?Math.max(1,D.findIndex(x=>x[0]===ad)+1):0;
 el.innerHTML=aktKart('AKTİF SEFER',fmt(dep).slice(0,5)+' kalkış',sw,ad,'Plan: '+fmt(hedef)+(k>=0?' · kalan '+Math.floor(k/60)+':'+String(k%60).padStart(2,'0'):' · '+Math.floor(-k/60)+':'+String(-k%60).padStart(2,'0')+' geç'),e<0)+
  '<div class="ekler">'+(e>=0?(typeof trafikSatir==='function'?trafikSatir(ad,k,dep,D,B):''):'')+(e>=-120?(typeof ietSatir==='function'?ietSatir(D,D.findIndex(x=>x[0]===ad),e):''):'')+'</div>'+durakListe(dep,D,hi,B)+SAATY();
 if(e===0)bip(1500,0.8);
 return true;
}
function takip(){
 const p=document.getElementById('benim').value.trim();
 if(!PLAN[p]){alert('Önce Hesapla tuşuna bas, plakanı listedeki gibi yaz');return}try{localStorage.setItem('benim',p);localStorage.setItem('benimHat',simdi)}catch(e){}TP=PLAN[p].slice();TB=simdi;
 try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();ctx.resume()}catch(e){}
 if(window.Notification&&Notification.permission=='default')Notification.requestPermission();
 if(navigator.wakeLock)navigator.wakeLock.request('screen').catch(()=>{});
 clearInterval(takipT);uyarildi={};gpsBaslat(p);
 takipT=setInterval(()=>{
  const n=ND(),sn=Math.floor(n.getTime()/1000);if(sn===TIKSN)return;TIKSN=sn;const s=n.getHours()*3600+n.getMinutes()*60+n.getSeconds();
  try{tokatUyari(p,s)}catch(e){}
  if(CPAY&&!canliPencere(p))canliGonder(p);if(aktifGoster(p,s,document.getElementById('sayac')))return;
  const sonraki=TP.find(x=>x>=s);
  const el=document.getElementById('sayac');
  if(sonraki===undefined){el.innerHTML='<section class="akt"><div class="akt-gov"><p class="akt-plan">Bugün başka seferin yok.</p></div></section>'+SAATY();clearInterval(takipT);return}
  const kalan=sonraki-s;
  if(kalan<=300&&!uyarildi[sonraki]){uyarildi[sonraki]=1;bip(880,0.6);setTimeout(()=>bip(880,0.6),800);if(navigator.vibrate)navigator.vibrate([500,200,500]);if(window.Notification&&Notification.permission=='granted')new Notification('5 dakika kaldı',{body:p+' – '+fmt(sonraki)+' seferi'})}
  if(kalan<=15){el.innerHTML=aktKart('SIRADAKİ SEFER',fmt(sonraki).slice(0,5)+' kalkış',String(kalan),'Hazır ol',fmt(sonraki)+' seferi',false,true)+SAATY();if(kalan>0)bip(kalan<=3?1200:700,0.12);else{bip(1500,1);if(navigator.vibrate)navigator.vibrate(1000)}}
  else el.innerHTML=aktKart('SIRADAKİ SEFER',fmt(sonraki).slice(0,5)+' kalkış',sure2(kalan),'Sıradaki sefer: '+fmt(sonraki).slice(0,5),'Kalan: '+Math.floor(kalan/60)+' dk '+(kalan%60)+' sn')+SAATY();
 },100);
}
function gunStr(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
let tarih=gunStr(new Date());
function tarihGun(){const g=new Date(tarih+'T12:00').getDay();return g==6?'cmt':(g==0?'paz':'hi')}
function gunOf(b){return (durum[b]&&durum[b].gun)||tarihGun()}
function dbOku(){try{return JSON.parse(localStorage.getItem('sefer_db')||'{}')}catch(e){return {}}}
function kaydet(){try{oku();const db=dbOku();db[tarih]={mim:durum.mim,mur:durum.mur,mevsim:mevsim};const s='0000';for(const k in db)if(k<s)delete db[k];localStorage.setItem('sefer_db',JSON.stringify(db))}catch(e){}}
function tarihSec(v,ilk){if(!v)return;if(!ilk)kaydet();tarih=v;const k=gunNormal(dbOku()[v]);for(const b of ['mim','mur'])durum[b]=k&&k[b]?k[b]:{plakalar:'',tur:{},ariza:{},ortak:{}};if(k&&k.mevsim)mevsim=k.mevsim;gun=gunOf(simdi);gunButon();{const ti=document.getElementById('tarih');if(ti)ti.value=v}ciz()}
function veriKopyala(){
 kaydet();const s=JSON.stringify(dbOku());
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(s).then(()=>alert('Kopyalandı. WhatsApp ile kendine gönder, telefonda Verileri yapıştır de.')).catch(()=>prompt('Bu yazının hepsini kopyala:',s))}
 else prompt('Bu yazının hepsini kopyala:',s);
}
// Bir günün kaydını (elle, WhatsApp'tan, ChatGPT'den ya da buluttan gelmiş olabilir) uygulamanın beklediği biçime getirir.
// Eksik/yanlış tipli alanları varsayılanla doldurur; onarılamayacak girişte null döner.
function gunNormal(g){
 if(typeof g==='string'){try{g=JSON.parse(g)}catch(e){return null}}
 if(!g||typeof g!=='object'||Array.isArray(g))return null;
 const o={};
 if(g.mevsim==='yaz'||g.mevsim==='kis')o.mevsim=g.mevsim;
 if(g.gun==='hi'||g.gun==='cmt'||g.gun==='paz')o.gun=g.gun;
 const nesne=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
 const harita=(x,deger)=>{if(Array.isArray(x)){const r={};x.forEach(p=>{if(p!==null&&p!==undefined&&String(p).trim())r[String(p).trim()]=deger});return r}return Object.assign({},nesne(x))};
 for(const b of ['mim','mur']){
  const h=nesne(g[b]);let pl=h.plakalar;
  if(Array.isArray(pl))pl=pl.map(x=>String(x==null?'':x).trim()).filter(x=>x).join(' ');
  else if(typeof pl==='number')pl=String(pl);
  else if(typeof pl!=='string')pl='';
  const r=Object.assign({},h,{plakalar:pl,tur:harita(h.tur,'nobetci'),ariza:harita(h.ariza,true),ortak:harita(h.ortak,true),yok:nesne(h.yok)});
  for(const k in r.tur)if(typeof r.tur[k]!=='string')delete r.tur[k];
  if(h.yokEk!==undefined)r.yokEk=nesne(h.yokEk);
  for(const k of ['sabah','bant','uzat'])if(r[k]!==undefined&&!Array.isArray(r[k]))delete r[k];
  o[b]=r;
 }
 for(const k in g)if(!(k in o)&&k!=='mim'&&k!=='mur'&&k!=='mevsim'&&k!=='gun')o[k]=g[k];
 if(typeof g.uzatYok==='boolean')o.uzatYok=g.uzatYok;
 return o;
}
function veriYapistir(){
 const s=prompt('Kopyaladığın veriyi buraya yapıştır:');if(!s)return;
 let y;try{y=JSON.parse(String(s).trim().replace(/^```[a-z]*\s*/i,'').replace(/```\s*$/,'').trim())}catch(e){alert('Veri okunamadı, tamamını kopyaladığından emin ol.');return}
 if(y&&typeof y==='object'){for(const w of ['sefer_db','gunler','db'])if(y[w]&&typeof y[w]==='object'&&!Array.isArray(y[w])){y=y[w];break}}
 if(!y||typeof y!=='object'||Array.isArray(y)){alert('Veri okunamadı: gün kayıtları bulunamadı.');return}
 if(y.mim||y.mur){const t0={};t0[tarih]=y;y=t0}
 const db=dbOku();let say=0,atla=[];
 for(const k in y){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(k)){atla.push(k);continue}
  const g=gunNormal(y[k]);if(!g){atla.push(k);continue}
  db[k]=g;say++;
 }
 if(!say){alert('Geçerli gün kaydı bulunamadı (anahtar 2026-11-17 biçiminde olmalı).');return}
 localStorage.setItem('sefer_db',JSON.stringify(db));
 for(const k in y)if(db[k]&&/^\d{4}-\d{2}-\d{2}$/.test(k)){bekleyenEkle(k);bulutaGonder(k)}
 tarihSec(tarih,true);
 try{const d=document.querySelector('details[data-k="sira"]');if(d&&typeof ADMIN!=='undefined'&&ADMIN&&durum[simdi].plakalar){d.open=true;ACIK.sira=1;localStorage.setItem('acik',JSON.stringify(ACIK))}}catch(e){}
 alert(say+' günlük kayıt eklendi.'+(atla.length?' Atlanan: '+atla.slice(0,5).join(', ')+(atla.length>5?'…':''):''));
}
function ciz(){
 const a=ayar(),d=durum[simdi];
 const hs_=document.getElementById('alanSeferler'),hd_=document.getElementById('alanDaha');
 if(!hs_||!hd_)return;
 /* SEFERLER sekmesi: günün sefer saatleri, seferler, günün uzatması */
 /* SEFERLER sekmesi: günün uzatması (sefer tabloları Sıra sekmesinde, sefer saatleri Daha fazla'da) */
 hs_.innerHTML='<div class="bas"><h2>Seferler</h2><span>'+a.ad+' – '+GUNAD[gun]+'</span></div>'+uzatHtml2(d);
 /* DAHA FAZLA sekmesi: yönetici bölümü, durak haritası, çarpı hesabı, ayarlar */
 hd_.innerHTML=
  '<details class="bolum" data-k="sira"'+ac('sira')+'><summary>Sıra ve araçlar</summary><div class="kutu tarih-kutu" style="margin-bottom:12px"><label for="tarih">Tarih</label><input type="date" id="tarih" value="'+tarih+'" onchange="tarihSec(this.value)"></div><div class="yonetici"'+(ADMIN?'':' hidden')+'><label>Plakalar, kahyanın sırasıyla (boşluk veya virgülle)</label>'+
  '<textarea id="liste" rows="3" oninput="araclariCiz()">'+d.plakalar+'</textarea>'+
  '<h3>Araç türleri</h3><div id="araclar"></div>'+
  '<button class="ana" onclick="hesapla()">Hesapla</button></div>'+adminTus()+'</details>'+
  aralikHtml(d).replace('<details class="bolum" data-k="aralik"','<details class="bolum" data-k="aralik"'+(ADMIN?'':' hidden'))+
  '<details class="bolum" data-k="harita"'+ac('harita')+'><summary>Durak haritası</summary><p class="kucuk">Durağı seç, haritada yerine dokun. Bütün cihazlara kaydedilir.</p>'+hfSec()+'<select id="durakSec" style="width:100%;font-size:18px;padding:10px;border-radius:8px">'+durakOpts()+'</select><button class="ana" style="background:#7f8c8d;padding:10px;font-size:16px" onclick="durakSil()">Seçili durağın işaretini sil</button><div id="harita" style="height:380px;border-radius:10px"></div><p id="durakBilgi" class="kucuk"></p></details>'+
  '<details class="bolum" data-k="carpi"'+ac('carpi')+'><summary>Çarpı hesabı (GPS PDF)</summary><input type="file" accept="application/pdf" onchange="carpiHesap(this.files[0])"><div id="carpi"></div></details>'+
  '<details class="bolum" data-k="ayar"'+ac('ayar')+'><summary>Ayarlar</summary><label>TomTom trafik anahtarı</label><input id="ttKey" value="'+(typeof TT_KEY!=='undefined'?TT_KEY:'')+'" placeholder="Anahtarı buraya yapıştır" style="width:100%;font-size:16px;padding:10px;border-radius:8px"><button class="ana" style="background:#2f6fd6;padding:10px;font-size:16px" onclick="ttKaydet()">Anahtarı kaydet</button><label>İETT adresi (Cloudflare Worker)</label><input id="iettUrl" value="'+(typeof IETT_URL!=='undefined'?IETT_URL:'')+'" placeholder="https://....workers.dev" style="width:100%;font-size:16px;padding:10px;border-radius:8px"><button class="ana" style="background:#2f6fd6;padding:10px;font-size:16px" onclick="iettKaydet()">İETT adresini kaydet</button></details>';
 {const pb=window.PARBOLUM||(window.PARBOLUM=document.getElementById('parBolum'));const ar=hd_.querySelector('details[data-k="aralik"]');if(pb&&ar)ar.after(pb)}
 {const b=document.getElementById('benim');if(b&&!b.value){try{b.value=localStorage.getItem('benim')||''}catch(e){}}}
 araclariCiz();setTimeout(haritaKur,50);
 if(d.plakalar)hesapla();otoTakip();ikiHat();
}
const UZ_DURAK=['Doğan Gıda','Makro Çarşı','Denizgören','Moroğlu / Balıkçı','Metrobüs','TÜYAP','Çekmece','Mimar Sinan','Meydan','Makro','Atrium'];
const SIX={doangg:0,macrog:1,taksidug:2,morolug:3,balkg:3,metrobg:4,tyap2d:5,atirus2d:6,eczane2d:7,taksidud:8,macro2d:9,atriumd:10};
function uzEk(dep,i,b){const d=durum[b||'mim'];const L=(d&&d.uzat)||[];let e=0;for(const u of L){const q=u.b.split(':'),r=u.s.split(':');if(dep>=t(+q[0],+q[1])&&dep<t(+r[0],+r[1])){if(u.e)e+=(i==99?(u.e[10]||0):(u.e[i]||0));else if(i>=u.i)e+=u.m}}return e}
function uzatHtml(d){const L=(d.uzat||[]).slice();while(L.length<3)L.push({b:'',s:'',i:5,m:''});
 let h='<details class="bolum" data-k="uzat"'+ac('uzat')+'><summary>Günün uzatması</summary><p class="kucuk">Sadece bu gün için. Fatih\'ten kalkış saat aralığını, uzatmanın başladığı durağı ve kaç dakika eklendiğini yaz. O duraktan sonraki bütün duraklara ve tur süresine eklenir.</p>';
 L.forEach(u=>{h+='<div data-uzi class="arac" style="flex-wrap:wrap;border-bottom:1px solid #2c3a4b;padding-bottom:8px"><input type="time" data-u="b" value="'+u.b+'" style="width:auto;height:auto;font-size:16px"><span class="kucuk" style="width:auto">–</span><input type="time" data-u="s" value="'+u.s+'" style="width:auto;height:auto;font-size:16px"><select data-u="i" style="flex:1;min-width:140px">'+UZ_DURAK.map((n,k)=>'<option value="'+k+'"'+(k==u.i?' selected':'')+'>'+n+'\'dan itibaren</option>').join('')+'</select><span class="kucuk" style="width:auto">+</span><input type="number" data-u="m" value="'+u.m+'" min="0" step="0.5" style="width:70px;height:auto;font-size:18px"><span class="kucuk" style="width:auto">dk</span></div>'});
 return h+'<button class="ana" onclick="oku();kaydet();hesapla()">Uygula ve hesapla</button></details>'}
function sabahYukle(k){const L=GUN[k][simdi].sabah.map(x=>fmt(t(...x)));const B=document.getElementById('sbKutu');if(!B)return;B.innerHTML=sabahKutular(L);document.querySelectorAll('[data-sgt]').forEach(b=>b.style.background=b.dataset.sgt==k?'#10202e':'#7f8c8d')}
function sabahKutular(L){return L.concat(['','']).map(v=>'<input data-sb value="'+v+'" inputmode="numeric" placeholder="--:--" style="width:100%;box-sizing:border-box;font-size:18px;padding:8px;text-align:center">').join('')}
function sabahEkle(){document.getElementById('sbKutu').insertAdjacentHTML('beforeend','<input data-sb value="" inputmode="numeric" placeholder="--:--" style="width:100%;box-sizing:border-box;font-size:18px;padding:8px;text-align:center">')}
function aralikHtml(d){const L=(d.bant||[]).slice();while(L.length<4)L.push({b:'',s:'',a:''});
 const SL=(d.sabah&&d.sabah.length?d.sabah:GUN[gun][simdi].sabah.map(x=>fmt(t(...x))));
 const std=GUN[gun][simdi].bant.map(b=>fmt(b[0])+'–'+fmt(b[1])+': '+String(b[2]/60).replace('.',',')+' dk').join(' · ');
 const ins='style="width:auto;height:auto;font-size:16px"';
 let h='<details class="bolum" data-k="aralik"'+ac('aralik')+'><summary>Günün sefer saatleri'+((d.bant||[]).length||(d.sabah||[]).length?' <span style="background:#d33b34;color:#fff;border-radius:20px;font-size:14px;padding:2px 10px">değişti</span>':'')+'</summary><p class="kucuk">Sadece bu gün ve bu hat için. Yazdığın saat aralığında seferler kaç dakikada bir kalkacaksa onu yaz. Yazmadığın saatler normal tarifeyle devam eder.</p><h3 style="margin-bottom:4px">İlk sıralar (sabit saatler)'+(d.sabah&&d.sabah.length?' <span style="background:#d33b34;color:#fff;border-radius:20px;font-size:14px;padding:2px 10px">değişti</span>':'')+'</h3><p class="kucuk">Hazır listeyi yüklemek için gün türüne bas, sonra istediğin saati tek tek değiştir. Boş kutular sayılmaz.</p><div style="display:flex;gap:6px;margin:6px 0 10px">'+['hi','cmt','paz'].map(k=>'<button data-sgt="'+k+'" onclick="sabahYukle(\''+k+'\')" style="flex:1;padding:10px 4px;border:0;border-radius:10px;color:#fff;font-weight:800;font-size:15px;background:#7f8c8d">'+GUNAD[k]+'</button>').join('')+'</div><div id="sbKutu" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px">'+sabahKutular(SL)+'</div><button onclick="sabahEkle()" style="border:0;background:#eaf6f0;color:#0f8a57;font-weight:800;border-radius:10px;padding:8px 14px;font-size:16px">+ Saat ekle</button><h3 style="margin-bottom:4px">Sefer aralıkları</h3><p class="kucuk"><b>Normal tarife ('+GUNAD[gun]+'):</b> '+std+'</p>';
 L.forEach(u=>{h+='<div data-bi class="arac"><input type="time" data-b="b" value="'+(u.b||'')+'" '+ins+'><span class="kucuk" style="width:auto">–</span><input type="time" data-b="s" value="'+(u.s||'')+'" '+ins+'><input type="number" data-b="a" value="'+(u.a||'')+'" min="1" step="0.5" placeholder="dk" style="width:58px;height:auto;font-size:18px"></div>'});
 return h+'<div style="display:flex;gap:8px"><button class="ana" onclick="oku();kaydet();hesapla()">Uygula ve hesapla</button><button class="ana" style="background:#7f8c8d" onclick="araligiSifirla()">Normale döndür</button></div></details>'}
function araligiSifirla(){document.querySelectorAll('[data-bi] input,[data-sb]').forEach(x=>x.value='');oku();kaydet();ciz();hesapla()}
function uzatHtml2(d){const L=(d.uzat||[]).filter(u=>u.e);while(L.length<2)L.push({b:'',s:'',e:[]});
 let h='<details class="bolum" data-k="uzat"'+ac('uzat')+'><summary>Günün uzatması</summary><label style="display:flex;gap:10px;align-items:center;font-size:18px;color:#ffcf5a;margin:6px 0 10px"><input type="checkbox" id="uzYok" style="width:28px;height:28px" onchange="oku();kaydet();hesapla()"'+(durum.mim.uzatYok?' checked':'')+'>Standart uzatmaları sayma (okul tatili, normal saatler)</label><p class="kucuk">Sadece bu gün için. Fatih\'ten kalkış saat aralığını yaz, her durağın planına kaç dakika eklendiğini gir. Boş durak değişmez. Atrium\'a yazdığın dakika tur süresine de eklenir.</p>';
 L.forEach(u=>{h+='<div data-uzi style="border-bottom:1px solid #2c3a4b;padding:8px 0"><div class="arac"><input type="time" data-u="b" value="'+u.b+'" style="width:auto;height:auto;font-size:16px"><span class="kucuk" style="width:auto">–</span><input type="time" data-u="s" value="'+u.s+'" style="width:auto;height:auto;font-size:16px"></div>'+UZ_DURAK.map((n,k)=>'<div class="arac"><span class="kucuk" style="width:150px;font-size:16px">'+n+'</span><input type="number" data-ue="'+k+'" value="'+(u.e[k]||'')+'" min="0" step="0.5" placeholder="0" style="width:80px;height:auto;font-size:18px"><span class="kucuk" style="width:auto">dk</span></div>').join('')+'</div>'});
 return h+'<button class="ana" onclick="oku();kaydet();hesapla()">Uygula ve hesapla</button></details>'}
function yokEkHtml(d,p){return ((d.yokEk&&d.yokEk[p])||[]).map((y,i)=>'<div class="arac" data-yer="'+p+'" style="margin-left:24px;flex-wrap:nowrap"><span class="kucuk" style="width:auto;font-size:15px">Yok</span><input type="time" data-yeb value="'+(y.b||'')+'" style="flex:1;min-width:0;width:auto;height:auto;font-size:15px;padding:6px"><span class="kucuk" style="width:auto;font-size:15px">–</span><input type="time" data-yes value="'+(y.s||'')+'" style="flex:1;min-width:0;width:auto;height:auto;font-size:15px;padding:6px"><button onclick="yokSil(\''+p+'\','+i+')" style="flex:none;width:auto;padding:6px 12px;font-size:20px;border-radius:8px;border:0;background:#c0392b;color:#fff">×</button></div>').join('')}
function yokTemizle(p){document.querySelectorAll('[data-yokb="'+p+'"],[data-yoks="'+p+'"]').forEach(x=>x.value='');oku();const d=durum[simdi];if(d.yok)delete d.yok[p];if(d.yokEk)delete d.yokEk[p];kilit=true;araclariCiz();kilit=false;kaydet();hesapla()}
function yokEkle(p){oku();const d=durum[simdi];d.yokEk=d.yokEk||{};(d.yokEk[p]=d.yokEk[p]||[]).push({b:'',s:''});kilit=true;araclariCiz();kilit=false;kaydet()}
function yokSil(p,i){oku();const d=durum[simdi];if(d.yokEk&&d.yokEk[p])d.yokEk[p].splice(i,1);kilit=true;araclariCiz();kilit=false;kaydet();hesapla()}
function siraDurum(giris){
 const p=document.getElementById('benim').value.trim();
 oku();
 if(!plakaListesi().includes(p)){alert('Plakanı listedeki gibi yaz (örnek 03). Listede yoksa doğru sekmede olduğuna bak.');return}
 const n=new Date(),hm=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');
 const eb=document.querySelector('[data-yokb="'+p+'"]'),es=document.querySelector('[data-yoks="'+p+'"]');
 if(!eb||!es){alert('Araç satırı bulunamadı');return}
 if(giris){if(!eb.value){alert('Önce Sıradan çıktım tuşuna basmalısın');return}es.value=hm}
 else{if(!confirm(p+' saat '+hm+' itibarıyla sıradan çıkıyor. Tamam mı?'))return;if(eb.value&&es.value&&es.value!='23:59'){const dd=durum[simdi];dd.yokEk=dd.yokEk||{};(dd.yokEk[p]=dd.yokEk[p]||[]).push({b:eb.value,s:es.value})}eb.value=hm;es.value='23:59'}
 {const dd2=durum[simdi];dd2.yok=dd2.yok||{};dd2.yok[p]={b:eb.value,s:es.value}}kilit=true;araclariCiz();kilit=false;kaydet();hesapla();
 alert(giris?p+' '+hm+' itibarıyla sıraya girdi. Kendi seferi dahil '+(simdi=='mur'?'3':'7')+' sefer içinde yetiştiği ilk sefere girer.':p+' '+hm+' itibarıyla gün sonuna kadar yok sayılıyor.');
}
function carpiMur(txt,el){
 const dm=durum.mur;const SF=seferler(Object.assign({},MUR,GUN[gunOf('mur')].mur));
 const pl=(dm.plakalar||'').split(/[\s,;]+/).filter(x=>x&&!(dm.ariza||{})[x]);
 const SIRA=pl.map(p=>p.replace(/\D/g,''));
 const ORT={};for(const p in (dm.ortak||{}))if(dm.ortak[p]&&!(dm.ariza||{})[p])ORT[p.replace(/\D/g,'')]=1;
 const NK=s=>{s=s.toLowerCase();return /^me/.test(s)?'metro':/^m/.test(s)?'mc':/^p/.test(s)?'pinar':/^ki/.test(s)?'kiptas':/^ak/.test(s)?'akbelde':/^at/.test(s)?'atirus':/^t/.test(s)?'tuyap':/^h/.test(s)?'hastane':s};
 const RX=/(M[ÇC]e[şs]me|P[ıi]nar\s*S|Kipta[şs]|Akbelde|Metrob[üu]|T[üu]yap2|Atirus2|Hastane)\s*(\d\d):(\d\d):(\d\d)/g;
 const OF={g:{pinar:3,kiptas:5,akbelde:8},d:{tuyap:32,atirus:40,hastane:45}};
 const EV={},AD={},TK={},R=[];OKU=[];
 for(const p of txt.split(/Hat\s*No\s*:\s*/).slice(1)){
  const pm=p.match(/^\s*(\S+?)\s*Gidi/);if(!pm)continue;const plk=pm[1].replace(/\D/g,'');if(!plk)continue;AD[plk]=pm[1].replace(/-$/,'');EV[plk]=[];TK[plk]=[0,0];
  for(const s of p.split(/#\s*\d+/).slice(1)){const d=[];for(const m of s.matchAll(RX))d.push([NK(m[1]),(+m[2])*3600+(+m[3])*60+(+m[4])]);if(d.length)R.push({plk:plk,d:d})}
 }
 const G=R.filter(r=>r.d[0][0]=='mc'&&r.d[0][1]>0&&r.d.filter(x=>(x[0]=='pinar'||x[0]=='kiptas'||x[0]=='akbelde')&&x[1]>0).length>=2);
 G.sort((a,b)=>a.d[0][1]-b.d[0][1]);
 G.forEach((r,k)=>{if(k<SF.length&&Math.abs(SF[k]-r.d[0][1])<=1200)r.base=SF[k]});
 const VR={};R.forEach(r=>{(VR[r.plk]=VR[r.plk]||[]).push(r)});
 for(const plk in VR){let last=null,ilkYok=true;
  for(const r of VR[plk]){TK[plk][0]++;
   const yon=r.d[0][0]=='mc'?'g':(r.d[0][0]=='tuyap'?'d':null);if(!yon)continue;
   let base;if(yon=='g'){if(r.base===undefined){last=null;continue}base=r.base;last=base}else{if(last===null)continue;base=last;last=null}
   TK[plk][1]++;
   let enb=0;for(const [n,tm] of r.d){const o=OF[yon][n];if(o===undefined||!tm)continue;if(tm<base||tm-base>3*3600)continue;enb=Math.max(enb,gec(tm,base+o*60))}
   const ilk=yon=='g'&&ilkYok;if(yon=='g')ilkYok=false;
   const gs=yon=='g'?base:r.d[0][1];const sk=base+(yon=='d'?1:0);const hk=plk+'@'+sk+yon;
   OKU.push({k:hk,p:plk,g:gs,enb:enb,yon:yon,ilk:ilk});if(HARIC[hk])continue;if(enb>60||enb<=0)continue;
   EV[plk].push({tm:sk,g:gs,enb:enb,ilk:ilk,yon:yon,p:plk});
  }
 }
 const birim=[];let i=0;while(i<SIRA.length){const a=SIRA[i];if(ORT[a]&&i+1<SIRA.length){birim.push([a,SIRA[i+1]]);i+=2}else{birim.push([a]);i++}}
 for(const k in EV)if(!SIRA.includes(k)&&EV[k].length)birim.push([k]);
 let h='<table><tr><th>Araç</th><th>Tolerans</th><th>Çarpı</th><th>Tutar</th><th>Geç kalınan tekler</th></tr>';let top=0,topTL=0;const kk=[];
 for(const u of birim){if(!u.some(x=>EV[x]))continue;const evs=[].concat(...u.map(x=>EV[x]||[])).sort((a,b)=>a.tm-b.tm);let kul=0,carpi=0,ilkC=0;const det=[];
  for(const e of evs){const on=u.length>1?(AD[e.p]||e.p)+' – ':'';if(e.ilk){ilkC++;kul=Math.min(10,kul+e.enb);det.push(on+'İlk servis '+fmt(e.g)+': '+e.enb+' dk – ÇARPI 700 TL');continue}let c=false;if(kul+e.enb<=10)kul+=e.enb;else{kul=10;carpi++;c=true}det.push(on+(e.yon=='g'?'Gidiş ':'Dönüş ')+fmt(e.g)+': '+e.enb+' dk'+(c?' – ÇARPI':''))}
  const tl=carpi*500+ilkC*700;top+=carpi+ilkC;topTL+=tl;const ai=SIRA.indexOf(u[u.length-1]);const arka=ai>=0&&SIRA.length>u.length?SIRA[(ai+1)%SIRA.length]:'';const ad=u.map(x=>AD[x]||x).join(' + ');const ar=AD[arka]||arka;if(tl&&arka)kk.push(ad+' → '+ar+': '+(carpi+ilkC)+' çarpı, '+tl+' TL');
  h+='<tr'+(tl?' class="uyari"':'')+'><td>'+ad+(u.length>1?' (ortak)':'')+'<br><span class="kucuk">okunan tek: '+u.map(x=>TK[x]?TK[x][1]+'/'+TK[x][0]:'-').join(', ')+'</span></td><td>'+kul+' / 10 dk</td><td>'+(carpi+ilkC)+(ilkC?' ('+ilkC+' ilk servis)':'')+'</td><td>'+tl+' TL'+(arka&&tl?' → '+ar:'')+'</td><td class="kucuk">'+det.join('<br>')+'</td></tr>'}
 el.innerHTML='<h3>Muratçeşme</h3>'+h+'</table>'+okunanHtml(AD)+'<p>Toplam: '+top+' çarpı, '+topTL+' TL. Metrobüs çarpıya sayılmıyor.</p>'+(kk.length?'<h3>Kim kime veriyor</h3><p>'+kk.join('<br>')+'</p>':'')+'<button class="ana" style="background:#c0392b" onclick="carpiPdf()">Çarpıları PDF olarak al</button>';
}
let SON_TXT=null,HARIC={},OKU=[];
function okunanHtml(AD){if(!OKU.length)return '';const g={};OKU.forEach(o=>{(g[o.p]=g[o.p]||[]).push(o)});
 let h='<details class="bolum" open><summary>Okunan tekler – say / sayma</summary><div class="kucuk">İşaretini kaldırdığın tek hesaba girmez. Servis dışı okumaları kaldır, hesap kendiliğinden yenilenir.</div>';
 for(const p in g){h+='<div style="margin-top:10px;font-weight:bold;font-size:18px">'+((AD&&AD[p])||p)+'</div>';g[p].sort((a,b)=>a.g-b.g).forEach(o=>{h+='<label style="display:flex;gap:8px;align-items:center;margin:4px 0;font-size:16px;color:'+(HARIC[o.k]?'#6b7a8c':'#e8edf3')+'"><input type="checkbox" style="width:24px;height:24px"'+(HARIC[o.k]?'':' checked')+' onchange="tekSec(\''+o.k+'\',this.checked)">'+(o.yon=='g'?'Gidiş ':'Dönüş ')+fmt(o.g)+(o.ilk?' (ilk servis)':'')+' – '+(o.enb>60?'60+ dk, zaten sayılmıyor':(o.enb>0?o.enb+' dk geç':'zamanında'))+'</label>'})}
 return h+'</details>'}
function tekSec(k,v){if(v)delete HARIC[k];else HARIC[k]=1;carpiHesap()}
let ACIK={};try{ACIK=JSON.parse(localStorage.getItem('acik')||'{}')}catch(e){}
function ac(k){return ACIK[k]?' open':''} var SIFRE_H='';let ADMIN=false;async function hs(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('sefer:'+String(s).trim().toLowerCase()));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}hs('sefer86').then(h=>{if(!SIFRE_H){SIFRE_H=h;adminKontrol()}});function adminKontrol(){const o=ADMIN;ADMIN=!!SIFRE_H&&localStorage.getItem('admin')===SIFRE_H;if(o!==ADMIN)ciz()} function adminTus(){return ADMIN?'<button class="ana" style="background:#7f8c8d;padding:10px;font-size:16px" onclick="adminCik()">Admin çıkışı</button><button class="ana" style="background:#8e44ad;padding:10px;font-size:16px" onclick="sifreDegis()">🔑 Şifreyi değiştir</button>':'<button class="ana" style="background:#7f8c8d;padding:10px;font-size:16px" onclick="adminGir()">🔒 Admin girişi (sırayı değiştirmek için)</button>'} async function adminGir(){const s=prompt('Admin şifresi:');if(s===null)return;if(await hs(s)===SIFRE_H){localStorage.setItem('admin',SIFRE_H);ADMIN=true;ciz()}else alert('Şifre yanlış')}
async function sifreDegis(){const e=prompt('Şu anki şifre:');if(e===null)return;if(await hs(e)!==SIFRE_H){alert('Şifre yanlış');return}const y=prompt('Yeni şifre (en az 4 harf):');if(!y||y.trim().length<4){alert('Şifre en az 4 harf olmalı');return}if((prompt('Yeni şifreyi tekrar yaz:')||'').trim().toLowerCase()!==y.trim().toLowerCase()){alert('İki şifre aynı değil');return}if(!FB){alert('İnternet yok, şifre değiştirilemedi');return}const h=await hs(y);FB.collection('ayar').doc('admin').set({h:h,z:Date.now()}).then(()=>{SIFRE_H=h;localStorage.setItem('admin',h);alert('Şifre değişti. Diğer telefonlardaki admin girişleri kapandı.')}).catch(x=>alert('Kaydedilemedi: '+x.code))} function adminCik(){ADMIN=false;localStorage.removeItem('admin');ciz()} function siraKilit(){if(ADMIN)return;const S={aralik:'input,button',sira:'textarea,select,input,#araclar button',uzat:'textarea,select,input,button',harita:'select,input,button',ayar:'input,button'};for(const k in S){const b=document.querySelector('details[data-k="'+k+'"]');if(!b)continue;b.querySelectorAll(S[k]).forEach(x=>{if(!x.closest('.leaflet-control')&&x.id!='hatFilt'&&x.id!='tarih')x.disabled=true})}}
function siraDiz(){return;const al=document.getElementById('alan');if(!al)return;['sira','sonuc','takip'].forEach(k=>{const e=al.querySelector('details[data-k="'+k+'"]');const f=al.querySelector('details');if(e&&f)al.insertBefore(e,f)})}
document.addEventListener('toggle',e=>{const k=e.target&&e.target.dataset&&e.target.dataset.k;if(!k)return;ACIK[k]=e.target.open?1:0;try{localStorage.setItem('acik',JSON.stringify(ACIK))}catch(x){}if(k=='harita'&&e.target.open&&HARITA)setTimeout(()=>HARITA.invalidateSize(),60)},true);
const DURAK_ADLARI=['Fatih Market','Doğan Gıda','Makro Çarşı','Denizgören','Moroğlu','Balıkçı','Metrobüs','TÜYAP','Çekmece','Mimar Sinan','Meydan','Makro','Atrium','Muratçeşme','Göbek','Kiptaş','Akbelde','Hastane','Güzelce Yol Ağzı','Billur Caddesi','Çarmıklı Caddesi','Villalar','Sahil Tepe Villaları','Sinanoba','Mimar Sinan Konakları','Mimaroba Muhtarlık','Oba','Dr. Sadık Ahmet İlkokulu','Piri Reis Caddesi','İnönü Caddesi','Güzelsu','Doç. Dr. Burhan Bahriyeli Lisesi','Eczane','Büyükçekmece Atirus','Büyükçekmece İŞKUR','Fatih Mahallesi','Tabya 1','Tabya 2','Doğa Koleji','Mimar Sinan Karayolları','Mimar Sinan Camii','Muratçeşme Sağlık Ocağı','Hünkartepe Caddesi','Yunus Emre Caddesi','Dizdariye Caddesi','Pir Sultan Sokak','Akkent','Akçimento'];
let HF=localStorage.getItem('hf')||'hepsi';
const HATD={mim:['Fatih Market','Güzelce Yol Ağzı','Billur Caddesi','Çarmıklı Caddesi','Atrium','Doğan Gıda','Villalar','Sahil Tepe Villaları','Sinanoba','Makro Çarşı','Mimar Sinan Konakları','Mimaroba Muhtarlık','Oba','Dr. Sadık Ahmet İlkokulu','Meydan','Denizgören','Piri Reis Caddesi','Moroğlu','İnönü Caddesi','Güzelsu','Doç. Dr. Burhan Bahriyeli Lisesi','Balıkçı','Eczane','Büyükçekmece Atirus','Büyükçekmece İŞKUR','Fatih Mahallesi','Tabya 1','Tabya 2','Metrobüs','TÜYAP','Doğa Koleji','Çekmece','Mimar Sinan Karayolları','Mimar Sinan Camii','Mimar Sinan','Makro'],mur:['Muratçeşme','Muratçeşme Sağlık Ocağı','Hünkartepe Caddesi','Göbek','Yunus Emre Caddesi','Kiptaş','Dizdariye Caddesi','Pir Sultan Sokak','Akkent','Akbelde','Hastane','Balıkçı','Eczane','Büyükçekmece Atirus','Büyükçekmece İŞKUR','Fatih Mahallesi','Tabya 1','Tabya 2','Metrobüs','TÜYAP','Çekmece','Akçimento']};
function gorunur(n){return HF=='hepsi'||HATD[HF].includes(n)}
function hfSec(){return '<select id="hatFilt" onchange="hatFiltre(this.value)" style="width:100%;font-size:18px;padding:10px;border-radius:8px;margin-bottom:6px">'+[['hepsi','Tüm duraklar'],['mim','Mimarsinan durakları'],['mur','Muratçeşme durakları']].map(x=>'<option value="'+x[0]+'"'+(x[0]==HF?' selected':'')+'>'+x[1]+'</option>').join('')+'</select>'}
function durakOpts(){const G=HF=='hepsi'?['mim','mur']:[HF];let h='';for(const b of G)h+='<optgroup label="'+(b=='mim'?'Mimarsinan':'Muratçeşme')+'">'+HATD[b].map(n=>'<option value="'+n+'">'+n+(KONUM[n]?' ✓':'')+'</option>').join('')+'</optgroup>';if(HF=='hepsi'){const D=DURAK_ADLARI.filter(n=>!HATD.mim.includes(n)&&!HATD.mur.includes(n));if(D.length)h+='<optgroup label="Diğer">'+D.map(n=>'<option value="'+n+'">'+n+'</option>').join('')+'</optgroup>'}return h}
function hatFiltre(v){HF=v;try{localStorage.setItem('hf',v)}catch(e){}const s=document.getElementById('durakSec');if(s)s.innerHTML=durakOpts();imleriCiz()}
let KONUM={},HARITA=null,IMLER=[],GPS=null,BENKONUM=null;const VARDI={};
const FBC={apiKey:"AIzaSyDMcP2Sd_6Y7OukKsowNTWxwJggs3oOn8w",authDomain:"sefer-ca13e.firebaseapp.com",projectId:"sefer-ca13e",storageBucket:"sefer-ca13e.firebasestorage.app",messagingSenderId:"706047335288",appId:"1:706047335288:web:e1f1c1d838db32cad9468d"};
let FB=null,hazir=false;const GONDER={},BT={};
function bulutDurum(m){const e=document.getElementById('bulut');if(e)e.textContent=m}
// Henüz buluta gidememiş yerel düzenlemeler: {gün: düzenleme zamanı}. İlk sunucu görüntüsünde yalnızca bunlar korunur.
function bekleyenOku(){try{const x=JSON.parse(localStorage.getItem('bekleyenGunler')||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch(e){return {}}}
function bekleyenYaz(b){try{localStorage.setItem('bekleyenGunler',JSON.stringify(b))}catch(e){}}
function bekleyenEkle(k){const b=bekleyenOku();b[k]=Date.now();bekleyenYaz(b)}
function bekleyenSil(k,z){const b=bekleyenOku();if(k in b&&(z===undefined||b[k]<=z)){delete b[k];bekleyenYaz(b)}}
function gunVarMi(g){return !!(g&&((g.mim&&g.mim.plakalar)||(g.mur&&g.mur.plakalar)))}
function bulutaGonder(k){
 if(!FB||!hazir)return;const g=dbOku()[k];if(!gunVarMi(g)){bekleyenSil(k);return}
 const v=JSON.stringify(g);if(GONDER[k]===v){bekleyenSil(k);return}GONDER[k]=v;
 const bz=bekleyenOku()[k];
 FB.collection('gunler').doc(k).set({v:v,z:Date.now()}).then(()=>{if(bz!==undefined)bekleyenSil(k,bz);bulutDurum('☁ Kaydedildi, bütün cihazlar görüyor')}).catch(e=>{delete GONDER[k];bulutDurum('☁ Kaydedilemedi: '+(e.code||'hata'))});
}
const kaydet0=kaydet;
kaydet=function(){
 const k=tarih;let once='';try{once=JSON.stringify(dbOku()[k]||null)}catch(e){}
 kaydet0();
 let sonra='';try{sonra=JSON.stringify(dbOku()[k]||null)}catch(e){}
 // yalnızca gerçekten değişen ve gönderilecek içeriği olan gün "bekleyen" sayılır; sadece gezmek/açmak günü buluta basmaz
 if(once!==sonra&&gunVarMi(dbOku()[k]))bekleyenEkle(k);
 clearTimeout(BT[k]);BT[k]=setTimeout(()=>{if(k in bekleyenOku())bulutaGonder(k)},1500);
};
try{
 firebase.initializeApp(FBC);FB=firebase.firestore();bulutDurum('☁ Bağlanıyor...');
 let ilkVeri=false;
 const zamanAsimi=setTimeout(()=>{if(!ilkVeri)bulutDurum('☁ Yanıt bekleniyor…')},12000);
 FB.collection('gunler').onSnapshot({includeMetadataChanges:true},sn=>{
  // Önbellekten gelen görüntü sunucu değildir: esas alma, buluta geri basma.
  if(sn.metadata.fromCache){if(!hazir)bulutDurum('☁ Sunucu verisi bekleniyor…');return}
  ilkVeri=true;clearTimeout(zamanAsimi);
  const ilk=!hazir,eski=dbOku(),db=ilk?{}:Object.assign({},eski),gonder=[];let yenile=false;
  if(ilk){
   // İlk sunucu görüntüsü ESASTIR: Firebase'de olmayan yerel gün atılır. Tek istisna: bu cihazda yapılıp
   // buluta gidememiş (bekleyen) ve sunucudaki sürümden yeni düzenlemeler.
   const sz={};
   sn.docs.forEach(d=>{const x=d.data();if(!x||!x.v)return;try{const g=gunNormal(x.v);if(g){db[d.id]=g;sz[d.id]=x.z||0;GONDER[d.id]=x.v}}catch(e){}});
   const bek=bekleyenOku();
   for(const k in bek){
    const y=gunNormal(eski[k]);
    if(gunVarMi(y)&&(!(k in sz)||bek[k]>sz[k])){db[k]=y;gonder.push(k)}else delete bek[k];
   }
   bekleyenYaz(bek);
   yenile=JSON.stringify(eski[tarih]||null)!==JSON.stringify(db[tarih]||null);
  }else{
   const bek=bekleyenOku();
   sn.docChanges().forEach(c=>{
    const id=c.doc.id;
    if(c.type=='removed'){if(id in bek)gonder.push(id);else{delete db[id];delete GONDER[id];if(id==tarih)yenile=true}return}
    const x=c.doc.data();if(!x||!x.v||GONDER[id]===x.v)return;
    if(id in bek&&bek[id]>(x.z||0))return;
    try{const g=gunNormal(x.v);if(g){db[id]=g;GONDER[id]=x.v;bekleyenSil(id);if(id==tarih)yenile=true}}catch(e){}
   });
  }
  localStorage.setItem('sefer_db',JSON.stringify(db));
  if(ilk)hazir=true;
  gonder.forEach(k=>{delete GONDER[k];bulutaGonder(k)});
  const ae=document.activeElement;
  if(yenile&&!(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)))tarihSec(tarih,true);
  bulutDurum('☁ Bağlı – '+sn.size+' gün kayıtlı');
 },e=>{clearTimeout(zamanAsimi);bulutDurum('☁ Bağlantı hatası: '+(e.code||'bilinmeyen'))});
}catch(e){bulutDurum('☁ Bulut yüklenemedi, internet var mı?')}
function mesafe(a,b){const R=6371e3,r=Math.PI/180,dl=(b[0]-a[0])*r,dn=(b[1]-a[1])*r;const x=Math.sin(dl/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
function imleriCiz(){if(!HARITA)return;IMLER.forEach(m=>m.remove());IMLER=[];for(const n in KONUM)if(gorunur(n))IMLER.push(L.marker(KONUM[n]).addTo(HARITA).bindTooltip(n,{permanent:true,direction:'top'}));const b=document.getElementById('durakBilgi');if(b)b.textContent=Object.keys(KONUM).length+' / '+DURAK_ADLARI.length+' durak işaretli'}
function haritaKur(){if(HARITA){HARITA.remove();HARITA=null}const el=document.getElementById('harita');if(!el)return;if(!window.L){el.textContent='Harita yüklenemedi, internet var mı?';return}HARITA=L.map(el).setView([41.02,28.59],13);const kat={'Harita':L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',{maxZoom:19,subdomains:'abc',attribution:'© OpenStreetMap'}),'Harita 2':L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:20,subdomains:'abcd',attribution:'© OpenStreetMap © CARTO'}),'Uydu':L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'© Esri'})};kat['Harita'].addTo(HARITA);L.control.layers(kat).addTo(HARITA);HARITA.on('click',ev=>{if(!ADMIN)return;const n=document.getElementById('durakSec').value;if(!confirm(n+' buraya kaydedilsin mi?'))return;KONUM[n]=[ev.latlng.lat,ev.latlng.lng];durakKaydet();imleriCiz()});imleriCiz()}
function durakSil(){const n=document.getElementById('durakSec').value;if(!KONUM[n])return;if(!confirm(n+' işareti silinsin mi?'))return;delete KONUM[n];durakKaydet();imleriCiz()}
function durakKaydet(){if(FB)FB.collection('ayar').doc('duraklar').set({v:JSON.stringify(KONUM),z:Date.now()}).catch(e=>alert('Durak kaydedilemedi: '+e.code))}
if(FB)FB.collection('ayar').doc('admin').onSnapshot(d=>{const x=d.data();if(x&&x.h){SIFRE_H=x.h;adminKontrol()}},e=>{});
if(FB)FB.collection('ayar').doc('duraklar').onSnapshot(d=>{const x=d.data();if(x&&x.v){try{KONUM=JSON.parse(x.v);imleriCiz()}catch(e){}}},e=>{});
function gpsBaslat(p){if(GPS!==null||!navigator.geolocation)return;GPS=navigator.geolocation.watchPosition(pos=>{BENKONUM=[pos.coords.latitude,pos.coords.longitude];canliGonder(p);try{if(typeof ogrenKonum==='function')ogrenKonum(BENKONUM[0],BENKONUM[1])}catch(e){}const A=KONUM['Atrium'];if(!A)return;if(mesafe(BENKONUM,A)>80)return;const n=new Date(),s=n.getHours()*3600+n.getMinutes()*60+n.getSeconds();for(const x of (PLAN[p]||[]))if(s>x+40*60&&s<x+120*60)VARDI[x]=1},e=>{},{enableHighAccuracy:true,maximumAge:5000})}
tarihSec(tarih,true);
document.addEventListener('change',()=>kaydet());
document.addEventListener('input',()=>kaydet());
window.addEventListener('beforeunload',kaydet);