#!/bin/bash
# TaskFlow — iOS build script (requires macOS + Xcode)
set -e

echo "🔨 Building web assets..."
npm run build

echo "📱 Syncing to iOS platform..."
npx cap sync ios

echo "✅ Done. Open Xcode to generate IPA:"
echo "   npx cap open ios"
echo "   Then: Product → Archive → Distribute App"
