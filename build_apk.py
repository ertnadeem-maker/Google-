import os
import shutil
import subprocess
import urllib.request

def run_cmd(cmd, cwd=None):
    print(f"Running: {cmd}")
    res = subprocess.run(cmd, shell=True, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"STDERR:\n{res.stderr}")
        print(f"STDOUT:\n{res.stdout}")
        raise RuntimeError(f"Command failed: {cmd}")
    return res.stdout

def main():
    build_dir = "/tmp/apk_build"
    if os.path.exists(build_dir):
        shutil.rmtree(build_dir)
        
    os.makedirs(f"{build_dir}/gen", exist_ok=True)
    os.makedirs(f"{build_dir}/obj", exist_ok=True)
    os.makedirs(f"{build_dir}/bin", exist_ok=True)
    os.makedirs(f"{build_dir}/res/values", exist_ok=True)
    os.makedirs(f"{build_dir}/res/xml", exist_ok=True)
    os.makedirs(f"{build_dir}/res/drawable-hdpi", exist_ok=True)
    os.makedirs(f"{build_dir}/res/drawable-xxhdpi", exist_ok=True)
    os.makedirs(f"{build_dir}/src/com/vyapar/khata", exist_ok=True)
    os.makedirs(f"{build_dir}/assets/www", exist_ok=True)

    # 1. Download android-34 (Android 14) android.jar
    android_jar = "/tmp/android-34.jar"
    if not os.path.exists(android_jar) or os.path.getsize(android_jar) < 1000000:
        print("Downloading official Android 14 (API 34) android.jar...")
        url = "https://raw.githubusercontent.com/Sable/android-platforms/master/android-34/android.jar"
        urllib.request.urlretrieve(url, android_jar)
        print(f"Downloaded android-34.jar ({os.path.getsize(android_jar) / (1024*1024):.1f} MB)")

    # 1b. Download Google Android D8 compiler (r8.jar) if not cached
    r8_jar = "/tmp/r8.jar"
    if not os.path.exists(r8_jar) or os.path.getsize(r8_jar) < 1000000:
        print("Downloading official Google D8 dex compiler...")
        d8_url = "https://maven.google.com/com/android/tools/r8/8.2.42/r8-8.2.42.jar"
        urllib.request.urlretrieve(d8_url, r8_jar)
        print(f"Downloaded r8.jar ({os.path.getsize(r8_jar) / (1024*1024):.1f} MB)")

    # 2. Copy web dist to assets/www (excluding any zip files)
    if os.path.exists("dist"):
        for item in os.listdir("dist"):
            if item.endswith(".zip") or item.endswith(".apk"):
                continue
            s = os.path.join("dist", item)
            d = os.path.join(f"{build_dir}/assets/www", item)
            if os.path.isdir(s):
                shutil.copytree(s, d)
            else:
                shutil.copy2(s, d)
    print("Copied clean web assets to assets/www")

    # 3. Copy icons
    if os.path.exists("public/pwa-192x192.png"):
        shutil.copy2("public/pwa-192x192.png", f"{build_dir}/res/drawable-hdpi/icon.png")
        shutil.copy2("public/pwa-512x512.png", f"{build_dir}/res/drawable-xxhdpi/icon.png")

    # 4. AndroidManifest.xml for Android 14 / OxygenOS 14 compliance
    manifest_xml = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.vyapar.khata"
    android:versionCode="2"
    android:versionName="1.0.1">

    <uses-sdk android:minSdkVersion="26" android:targetSdkVersion="34" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:label="@string/app_name"
        android:icon="@drawable/icon"
        android:theme="@style/AppTheme"
        android:hasCode="true"
        android:usesCleartextTraffic="true"
        android:hardwareAccelerated="true"
        android:enableOnBackInvokedCallback="true">
        <activity
            android:name="com.vyapar.khata.MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:configChanges="orientation|screenSize|keyboardHidden|screenLayout|smallestScreenSize"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"""
    with open(f"{build_dir}/AndroidManifest.xml", "w") as f:
        f.write(manifest_xml)

    # 5. Resources: strings.xml & styles.xml
    strings_xml = """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Vyapar Khata</string>
</resources>
"""
    with open(f"{build_dir}/res/values/strings.xml", "w") as f:
        f.write(strings_xml)

    styles_xml = """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="@android:style/Theme.DeviceDefault.NoActionBar">
        <item name="android:windowBackground">@android:color/white</item>
        <item name="android:statusBarColor">#059669</item>
        <item name="android:navigationBarColor">#059669</item>
    </style>
</resources>
"""
    with open(f"{build_dir}/res/values/styles.xml", "w") as f:
        f.write(styles_xml)

    # 6. MainActivity.java for Android 14
    main_activity_java = """package com.vyapar.khata;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.view.KeyEvent;
import android.graphics.Color;
import android.view.Window;
import android.view.WindowManager;
import android.os.Build;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String ONLINE_URL = "https://ais-pre-xzwzshrjob7uc3anfjaepz-420782902307.asia-east1.run.app";
    private static final String LOCAL_URL = "file:///android_asset/www/index.html";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Status bar emerald color
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.parseColor("#059669"));
        }

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                if (failingUrl != null && !failingUrl.startsWith("file:")) {
                    view.loadUrl(LOCAL_URL);
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient());

        // Load app
        webView.loadUrl(ONLINE_URL);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView != null && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
"""
    with open(f"{build_dir}/src/com/vyapar/khata/MainActivity.java", "w") as f:
        f.write(main_activity_java)

    # 7. Generate R.java with aapt
    run_cmd(f"aapt package -m -J {build_dir}/gen -M {build_dir}/AndroidManifest.xml -S {build_dir}/res -I {android_jar}")
    print("Generated R.java")

    # 8. Compile Java to class files
    java_files = f"{build_dir}/gen/com/vyapar/khata/R.java {build_dir}/src/com/vyapar/khata/MainActivity.java"
    run_cmd(f"javac -source 1.8 -target 1.8 -cp {android_jar} -d {build_dir}/obj {java_files}")
    print("Compiled Java classes")

    # 9. Convert class files to classes.dex using D8 with --min-api 26 (generates modern DEX 038/039 for Android 14)
    run_cmd(f"java -cp {r8_jar} com.android.tools.r8.D8 --min-api 26 --lib {android_jar} --output {build_dir}/bin {build_dir}/obj/com/vyapar/khata/*.class")
    print("Created classes.dex for Android 14")

    # 10. Package APK with aapt
    run_cmd(f"aapt package -f -M {build_dir}/AndroidManifest.xml -S {build_dir}/res -A {build_dir}/assets -I {android_jar} -F {build_dir}/bin/unaligned.apk")
    
    # Add classes.dex into unaligned.apk
    run_cmd(f"cd {build_dir}/bin && aapt add unaligned.apk classes.dex")
    print("Packaged unaligned.apk")

    # 11. Zipalign APK with 4-byte alignment
    run_cmd(f"zipalign -f -p 4 {build_dir}/bin/unaligned.apk {build_dir}/bin/aligned.apk")
    print("Zipaligned aligned.apk with 4-byte boundaries")

    # 12. Create release keystore if needed
    keystore = "/tmp/release.keystore"
    if not os.path.exists(keystore):
        run_cmd(f"keytool -genkeypair -v -keystore {keystore} -storepass vyaparkhata -keypass vyaparkhata -alias vyapar -keyalg RSA -keysize 2048 -validity 10000 -dname 'CN=Vyapar Khata, O=Business, C=IN'")
        print("Generated signing keystore")

    # 13. Sign APK with apksigner with v1, v2, v3 schemes for Android 14
    os.makedirs("public", exist_ok=True)
    target_apk = "public/vyapar-khata.apk"
    run_cmd(f"apksigner sign --ks {keystore} --ks-pass pass:vyaparkhata --min-sdk-version 26 --out {target_apk} {build_dir}/bin/aligned.apk")
    print(f"Signed APK saved to {target_apk}")

    # Copy to root as well
    shutil.copy2(target_apk, "./vyapar-khata.apk")

    # 14. Verify APK signature
    verify_output = run_cmd(f"apksigner verify -v {target_apk}")
    print("Verification result:\n" + verify_output)

    apk_size_kb = os.path.getsize(target_apk) / 1024
    print(f"\n==========================================")
    print(f"SUCCESS! Android 14 APK generated: {target_apk} ({apk_size_kb:.1f} KB)")
    print(f"==========================================")

if __name__ == "__main__":
    main()
