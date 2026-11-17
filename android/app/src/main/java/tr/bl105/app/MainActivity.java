package tr.bl105.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.GeolocationPermissions;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.FrameLayout;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class MainActivity extends Activity {

    // WebView icinde kalmasina izin verilen alan adlari (ve alt alan adlari).
    // Baslangic adresinin alan adi her zaman serbesttir. Digerleri sistem tarayicisinda acilir.
    private static final String[] ALLOWED_HOSTS = {
            "github.io",
            "firebaseapp.com",
            "firebaseio.com",
            "web.app",
            "googleapis.com",
            "gstatic.com",
            "workers.dev",
            "tomtom.com",
            "arcgisonline.com",
            "unpkg.com",
            "cdnjs.cloudflare.com",
            "ibb.gov.tr"
    };

    private static final String RETRY_SCHEME = "bl105retry";
    private static final int REQ_PERMS = 105;

    private WebView webView;
    private boolean showingError = false;
    private boolean permRequestInFlight = false;
    private boolean serviceStarted = false;

    private GeolocationPermissions.Callback pendingGeoCallback;
    private String pendingGeoOrigin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        webView = new WebView(this);
        FrameLayout root = new FrameLayout(this);
        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        setupWebView();

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(BuildConfig.START_URL);
        }

        if (BuildConfig.BACKGROUND_SERVICE) {
            // Sofor: acilista konum + bildirim izinlerini iste
            requestNeededPermissions(true);
            startServiceIfPossible();
        }
    }

    private void setupWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setGeolocationEnabled(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setSupportMultipleWindows(false);
        s.setLoadWithOverviewMode(false);
        s.setUseWideViewPort(true);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setTextZoom(100);

        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setBackgroundColor(0xFFEEF2F5);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!request.isForMainFrame()) {
                    return false; // alt cerceveler/kaynaklara karisma
                }
                return handleTopLevel(request.getUrl());
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                if (url != null && url.startsWith("http")) {
                    showingError = false;
                }
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    showOfflinePage();
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                if (hasLocationPermission()) {
                    callback.invoke(origin, true, false);
                    return;
                }
                if (pendingGeoCallback != null) {
                    pendingGeoCallback.invoke(pendingGeoOrigin, false, false);
                }
                pendingGeoCallback = callback;
                pendingGeoOrigin = origin;
                requestNeededPermissions(false);
            }

            @Override
            public boolean onJsAlert(WebView view, String url, String message, final JsResult result) {
                new AlertDialog.Builder(MainActivity.this)
                        .setMessage(message)
                        .setPositiveButton(android.R.string.ok, (d, w) -> result.confirm())
                        .setOnCancelListener(d -> result.cancel())
                        .show();
                return true;
            }

            @Override
            public boolean onJsConfirm(WebView view, String url, String message, final JsResult result) {
                new AlertDialog.Builder(MainActivity.this)
                        .setMessage(message)
                        .setPositiveButton(android.R.string.ok, (d, w) -> result.confirm())
                        .setNegativeButton(android.R.string.cancel, (d, w) -> result.cancel())
                        .setOnCancelListener(d -> result.cancel())
                        .show();
                return true;
            }

            @Override
            public boolean onJsPrompt(WebView view, String url, String message, String defaultValue,
                                      final JsPromptResult result) {
                final EditText input = new EditText(MainActivity.this);
                if (defaultValue != null) {
                    input.setText(defaultValue);
                }
                new AlertDialog.Builder(MainActivity.this)
                        .setMessage(message)
                        .setView(input)
                        .setPositiveButton(android.R.string.ok, (d, w) -> result.confirm(input.getText().toString()))
                        .setNegativeButton(android.R.string.cancel, (d, w) -> result.cancel())
                        .setOnCancelListener(d -> result.cancel())
                        .show();
                return true;
            }
        });
    }

    /** true dondurursa navigasyonu biz ele aldik (WebView yuklemesin). */
    private boolean handleTopLevel(Uri uri) {
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
        if (RETRY_SCHEME.equals(scheme)) {
            showingError = false;
            webView.loadUrl(BuildConfig.START_URL);
            return true;
        }
        if (scheme.equals("about") || scheme.equals("data") || scheme.equals("blob") || scheme.equals("javascript")) {
            return false;
        }
        if (scheme.equals("http") || scheme.equals("https")) {
            if (isAllowedHost(uri.getHost())) {
                return false;
            }
        }
        openExternal(uri);
        return true;
    }

    private boolean isAllowedHost(String host) {
        if (host == null) {
            return false;
        }
        host = host.toLowerCase(Locale.ROOT);
        Uri start = Uri.parse(BuildConfig.START_URL);
        String startHost = start.getHost();
        if (startHost != null && host.equals(startHost.toLowerCase(Locale.ROOT))) {
            return true;
        }
        for (String a : ALLOWED_HOSTS) {
            if (host.equals(a) || host.endsWith("." + a)) {
                return true;
            }
        }
        return false;
    }

    private void openExternal(Uri uri) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, uri);
            i.addCategory(Intent.CATEGORY_BROWSABLE);
            startActivity(i);
        } catch (ActivityNotFoundException | SecurityException e) {
            // acacak uygulama yok; sessizce gec
        }
    }

    private void showOfflinePage() {
        showingError = true;
        String html = "<!doctype html><html lang=\"tr\"><head><meta charset=\"utf-8\">"
                + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
                + "<style>body{margin:0;min-height:100vh;display:flex;flex-direction:column;"
                + "align-items:center;justify-content:center;background:#eef2f5;color:#1c2b36;"
                + "font-family:sans-serif;text-align:center;padding:24px;box-sizing:border-box}"
                + "h1{font-size:22px;margin:0 0 8px}p{margin:0 0 24px;color:#51606b}"
                + "a{display:inline-block;background:#0f8a57;color:#fff;text-decoration:none;"
                + "padding:14px 32px;border-radius:12px;font-size:17px;font-weight:bold}</style></head>"
                + "<body><h1>Bağlantı yok</h1><p>İnternet bağlantını kontrol edip tekrar dene.</p>"
                + "<a href=\"" + RETRY_SCHEME + "://yenile\">Yeniden dene</a></body></html>";
        webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
    }

    // ---------------------------------------------------------------- izinler

    private boolean hasLocationPermission() {
        return checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    private void requestNeededPermissions(boolean withNotification) {
        if (permRequestInFlight) {
            return;
        }
        List<String> need = new ArrayList<>();
        if (!hasLocationPermission()) {
            need.add(Manifest.permission.ACCESS_FINE_LOCATION);
            need.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }
        if (withNotification && Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            need.add(Manifest.permission.POST_NOTIFICATIONS);
        }
        if (need.isEmpty()) {
            return;
        }
        permRequestInFlight = true;
        requestPermissions(need.toArray(new String[0]), REQ_PERMS);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != REQ_PERMS) {
            return;
        }
        permRequestInFlight = false;
        boolean granted = hasLocationPermission();
        if (pendingGeoCallback != null) {
            pendingGeoCallback.invoke(pendingGeoOrigin, granted, false);
            pendingGeoCallback = null;
            pendingGeoOrigin = null;
        }
        if (granted) {
            startServiceIfPossible();
        }
    }

    // ----------------------------------------------------------------- servis

    private void startServiceIfPossible() {
        if (!BuildConfig.BACKGROUND_SERVICE || serviceStarted || !hasLocationPermission()) {
            return;
        }
        try {
            Intent i = new Intent(this, LocationForegroundService.class);
            if (Build.VERSION.SDK_INT >= 26) {
                startForegroundService(i);
            } else {
                startService(i);
            }
            serviceStarted = true;
        } catch (RuntimeException e) {
            // sistem on plan servisine izin vermedi; uygulama yine de calisir
        }
    }

    private void stopServiceIfStarted() {
        if (serviceStarted) {
            stopService(new Intent(this, LocationForegroundService.class));
            serviceStarted = false;
        }
    }

    // -------------------------------------------------------------- yasam dongusu

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
        if (showingError) {
            webView.loadUrl(BuildConfig.START_URL);
        }
        startServiceIfPossible();
    }

    @Override
    protected void onPause() {
        super.onPause();
        // Arka planda zamanlayicilar/JS durmasin: WebView'i duraklatma, pauseTimers() cagirma.
        if (BuildConfig.BACKGROUND_SERVICE) {
            webView.onResume();
        } else {
            webView.onPause();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack() && !showingError) {
            webView.goBack();
        } else {
            moveTaskToBack(true);
        }
    }

    @Override
    protected void onDestroy() {
        stopServiceIfStarted();
        if (webView != null) {
            ViewGroup parent = (ViewGroup) webView.getParent();
            if (parent != null) {
                parent.removeView(webView);
            }
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
