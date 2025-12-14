# Quick Start Guide

## 🎯 TL;DR - Get Started in 5 Steps

### 1️⃣ Run Setup Script

```bash
# Windows
scripts\setup.bat YOUR_GITHUB_USERNAME

# Mac/Linux
chmod +x scripts/setup.sh
./scripts/setup.sh YOUR_GITHUB_USERNAME
```

### 2️⃣ Add Screenshots

Copy your 3 screenshots to `docs/public/`:

- screenshot-1.png
- screenshot-2.png
- screenshot-3.png

### 3️⃣ Enable GitHub Pages

- Go to repository **Settings → Pages**
- Set source to **GitHub Actions**

### 4️⃣ Commit & Create Release

```bash
git add .
git commit -m "Add documentation site and release workflow"
git push

git tag v1.0.0
git push origin v1.0.0
```

### 5️⃣ Wait for Build

- Check **Actions** tab for build progress
- Download links will be active once complete
- Docs site will be live at: `https://YOUR_USERNAME.github.io/renzu/`

## 📦 What You Get

✅ Modern documentation site with React + Vite  
✅ Automated builds for Windows, Mac, and Linux  
✅ GitHub Releases with download links  
✅ Auto-deployed to GitHub Pages  
✅ Professional download buttons on docs site

## 🎨 Screenshot Locations

Place your images here (they'll show on the docs site):

```
docs/public/
├── screenshot-1.png  ← Cluster/Service view
├── screenshot-2.png  ← Container details view
└── screenshot-3.png  ← Logs view
```

## 🔗 URLs After First Release

- **Docs Site**: `https://YOUR_USERNAME.github.io/renzu/`
- **Windows**: `https://github.com/YOUR_USERNAME/renzu/releases/latest`
- **macOS**: `https://github.com/YOUR_USERNAME/renzu/releases/latest`
- **Linux**: `https://github.com/YOUR_USERNAME/renzu/releases/latest`

## ⚙️ Test Locally First

```bash
# Test docs site
cd docs
npm run dev
# Visit http://localhost:5173

# Test electron app
npm run dev
```

---

📖 For detailed instructions, see [SETUP.md](SETUP.md)
