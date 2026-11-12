package com.qwenton.bandlabs;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    public class AndroidNativeBridge {
        @JavascriptInterface
        public void exitApp() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    finish();
                }
            });
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
        if (webView != null) {
            // Enable low-latency Web Audio & media playback without requiring initial touch gesture
            WebSettings settings = webView.getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);

            // Expose native bridge interface to web runtime
            webView.addJavascriptInterface(new AndroidNativeBridge(), "AndroidNativeBridge");
        }

        // Modern OnBackPressedCallback for hardware back button & Android predictive gesture back
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView wv = getBridge().getWebView();
                if (wv != null) {
                    wv.evaluateJavascript(
                        "window.dispatchEvent(new CustomEvent('androidBackButton'));",
                        null
                    );
                }
            }
        });
    }
}
