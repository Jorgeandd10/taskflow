#!/bin/bash
# TaskFlow — Android build script
set -e

echo "🔨 Building web assets..."
npm run build

echo "📱 Syncing to Android platform..."
npx cap sync android

echo "✅ Done. Open Android Studio to generate APK:"
echo "   npx cap open android"
echo "   Then: Build → Generate Signed Bundle/APK"
