# BL-105 Android uygulamaları (APK)

Bu klasör, BL-105 web uygulamalarını adres çubuğu olmayan, telefonda gerçek uygulama gibi açılan iki ayrı Android uygulamasına çevirir:

| Uygulama | Dosya | Paket | Açtığı sayfa |
|---|---|---|---|
| Sefer Sırası (şoför) | `Sefer-Sirasi.apk` | `tr.bl105.sofor` | `index.html` |
| Minibüs Nerede? (yolcu) | `Minibus-Nerede.apk` | `tr.bl105.yolcu` | `yolcu.html` |

Uygulama tam ekran bir WebView'dir; içerik web sitesinden (GitHub Pages) yüklenir. Web dosyalarını güncellediğinde APK'yı yeniden yapmana gerek yoktur.

**Bu uygulamalar Play Store için değil, kendi kullanımım içindir.**

## Kurulum (kısa)

1. Bu depoyu (`android/` klasörü ve `.github/workflows/apk.yml` dahil) GitHub'a yükle.
2. GitHub'da depoda **Actions** sekmesine gir, **Android APK** iş akışını seç, **Run workflow** de. (`android/` altında bir değişiklik push edince de kendiliğinden çalışır.) İlk derleme birkaç dakika sürer.
3. Bitince depoda sağdaki **Releases** bölümünde **latest** sürümünü aç, `Sefer-Sirasi.apk` ve `Minibus-Nerede.apk` dosyalarını telefondan indir. (Aynı dosyalar Actions çalışmasının "Artifacts" kısmında da vardır.)
4. Telefonda APK'ya dokun, istenirse "bilinmeyen kaynaklardan yüklemeye izin ver" de ve yükle. PWABuilder ile yüklenen eski sürümü önce kaldır.
5. Açılışta konum ve bildirim izinlerini ver. Konum için "Uygulama kullanılırken izin ver" yeterlidir.

İmza anahtarı (`android/bl105.jks`, şifre `bl105bl105`, alias `bl105`) depoda sabit durur; böylece sonraki sürümler eskisinin üstüne güncelleme olarak yüklenir. Depoyu herkese açık yapma; anahtar kişisel kullanım içindir.

## Adresi değiştirmek

`android/app/build.gradle` dosyasının başındaki `BASE_URL` değerini değiştir. Sürümü yükseltmek için aynı dosyada `versionCode` değerini artır.

## Nasıl çalışır

- Adres çubuğu ve ActionBar yok, tam ekran, ekran açık kalır.
- Konum izni uygulama içinden istenir, web sayfasının `navigator.geolocation` isteği buna bağlanır.
- Geri tuşu önce sayfa geçmişinde geri gider, geçmiş yoksa uygulamayı arka plana alır.
- Başka alan adlarına giden bağlantılar sistem tarayıcısında açılır (WebView içinde sadece github.io, firebase, tomtom, workers.dev, harita/CDN alan adları kalır; liste `MainActivity.java` içindeki `ALLOWED_HOSTS`). Sadece üst düzey gezinmeler denetlenir, sayfanın kendi kaynak istekleri karışılmaz.
- İnternet yoksa "Bağlantı yok / Yeniden dene" sayfası görünür.
- Şoför sürümü: uygulama açıkken kalıcı "Sefer Sırası çalışıyor" bildirimiyle bir ön plan servisi (konum türünde) ve WakeLock çalışır; uygulama kapanınca servis durur. Arka plana geçince WebView duraklatılmaz.

## Bilinen sınırlar

- Arka planda konum garantili değildir. WebView'in `navigator.geolocation` özelliği uygulama arka plandayken veya ekran kilitliyken bazı telefonlarda güncelleme vermeyebilir. Şu an sadece ön plan servisi + WakeLock kullanılıyor; konumu servis içinden alıp sayfaya aktaran bir köprü yok. Sorun olursa bir sonraki adım bu köprüdür.
- Üreticiye özel pil tasarrufu (Xiaomi, Huawei, Samsung vb.) uygulamayı yine kapatabilir. Telefonda uygulama için pil kısıtlamasını "Kısıtlama yok" yap.
- Web sayfasındaki `Notification` API ve titreşim WebView'de çalışmayabilir; bildirim olarak sadece servisin kalıcı bildirimi vardır.
- Yönetici işlevlerinden CSV indirme (blob) ve `window.open` ile PDF/yazdırma WebView'de çalışmaz; bunlar için sayfayı tarayıcıda aç.
- Ekran dikey kilitlidir (web manifestleriyle aynı).
- Derleme bu ortamda denenemedi; ilk GitHub Actions çalışmasında hata çıkarsa log'u paylaş.
