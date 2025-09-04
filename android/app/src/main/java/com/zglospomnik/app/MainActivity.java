package com.zglospomnik.app;

import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable dark theme support - using exact app colors
        getWindow().setStatusBarColor(android.graphics.Color.parseColor("#111827")); // gray-900
        getWindow().setNavigationBarColor(android.graphics.Color.parseColor("#111827")); // gray-900
        
        // Set system UI flags for dark theme
        int flags = getWindow().getDecorView().getSystemUiVisibility();
        flags &= ~android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        flags &= ~android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        getWindow().getDecorView().setSystemUiVisibility(flags);
    }
}
