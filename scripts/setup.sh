#!/bin/bash

# Renzu Setup Helper Script
echo "🚀 Renzu Setup Helper"
echo "===================="
echo ""

# Check if GitHub username is provided
if [ -z "$1" ]; then
    echo "Usage: ./setup.sh YOUR_GITHUB_USERNAME"
    echo ""
    echo "Example: ./setup.sh johndoe"
    exit 1
fi

GITHUB_USERNAME=$1

echo "Setting up Renzu with GitHub username: $GITHUB_USERNAME"
echo ""

# Update App.tsx
echo "📝 Updating docs/src/App.tsx..."
sed -i.bak "s/YOUR_USERNAME/$GITHUB_USERNAME/g" docs/src/App.tsx

# Update electron-builder.yml
echo "📝 Updating electron-builder.yml..."
sed -i.bak "s/YOUR_USERNAME/$GITHUB_USERNAME/g" electron-builder.yml

# Install dependencies
echo "📦 Installing main app dependencies..."
npm install

echo "📦 Installing docs dependencies..."
cd docs && npm install && cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your screenshots to docs/public/ (screenshot-1.png, screenshot-2.png, screenshot-3.png)"
echo "2. Test the docs site: cd docs && npm run dev"
echo "3. Enable GitHub Pages in your repository settings"
echo "4. Create a release: git tag v1.0.0 && git push origin v1.0.0"
echo ""
echo "For more details, see SETUP.md"
