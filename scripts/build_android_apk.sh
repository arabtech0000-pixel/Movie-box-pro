#!/usr/bin/env bash
# MovieBox Pro Android APK Builder Script
set -e

echo "========================================="
echo "Building MovieBox Pro Android Native APK"
echo "========================================="

echo "1. Generating PWA Icons..."
node scripts/generate_pwa_icons.js

echo "2. Compiling Web Dist Bundle..."
npm run build

echo "3. Packaging with Capacitor Native Container..."
if [ ! -d "android" ]; then
  npx @capacitor/cli init "MovieBox Pro" "com.moviebox.pro.app" --web-dir dist
  npx @capacitor/cli add android
fi

npx @capacitor/cli copy android
npx @capacitor/cli sync android

echo "4. Building Gradle APK Output..."
cd android
./gradlew assembleDebug

echo "========================================="
echo "SUCCESS! Android APK built at:"
echo "android/app/build/outputs/apk/debug/app-debug.apk"
echo "========================================="
