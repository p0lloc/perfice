package dev.adoe.perfice;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import androidx.annotation.Nullable;

public class PermissionsRationaleActivity extends Activity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = new WebView(getApplicationContext());
        setContentView(webView);
        webView.loadUrl("https://developer.android.com/training/health/permissions");
    }
}
