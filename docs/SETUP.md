# Renzu - Setup and Deployment Guide

## What's Been Set Up

### 1. Documentation Site (`docs/` folder)

A modern, responsive static site built with React and Vite featuring:

- Clean gradient design with purple theme
- Description of Renzu (AWS ECS Desktop Client)
- Download buttons for Windows, macOS, and Linux
- GitHub repository link
- Screenshot placeholders (3 images)

### 2. GitHub Actions Workflow (`.github/workflows/release.yml`)

Automated CI/CD pipeline that:

- Builds Electron app for all platforms (Windows, macOS, Linux)
- Creates GitHub releases with downloadable binaries
- Builds and deploys documentation site to GitHub Pages

## Setup Steps

### Step 1: Update GitHub Repository Info

1. In `docs/src/App.tsx`, replace `YOUR_USERNAME` with your GitHub username:

   ```typescript
   href = 'https://github.com/YOUR_USERNAME/renzu'
   ```

2. In `electron-builder.yml`, replace `YOUR_USERNAME` with your GitHub username:

   ```yaml
   publish:
     provider: github
     owner: YOUR_USERNAME
     repo: renzu
   ```

3. In `docs/vite.config.ts`, update the `base` path if your repo name is different:
   ```typescript
   base: '/renzu/', // Change if repo name differs
   ```

### Step 2: Add Screenshots

Place 3 screenshot images in `docs/public/` with these names:

- `screenshot-1.png`
- `screenshot-2.png`
- `screenshot-3.png`

The site will automatically display them when present, or show placeholders if missing.

### Step 3: Install Dependencies

```bash
# Install main app dependencies (if not already done)
npm install

# Install docs site dependencies
cd docs
npm install
cd ..
```

### Step 4: Test Locally

Test the documentation site:

```bash
cd docs
npm run dev
```

Visit http://localhost:5173 to preview the site.

### Step 5: Enable GitHub Pages

1. Go to your GitHub repository settings
2. Navigate to **Pages** section
3. Under **Source**, select **GitHub Actions**
4. Save the settings

### Step 6: Configure Code Signing (Optional but Recommended)

#### For macOS:

Add these secrets to your GitHub repository:

- `CSC_LINK`: Base64-encoded .p12 certificate
- `CSC_KEY_PASSWORD`: Certificate password
- `APPLE_ID`: Your Apple ID email
- `APPLE_APP_SPECIFIC_PASSWORD`: App-specific password
- `APPLE_TEAM_ID`: Your Apple Developer Team ID

#### For Windows:

Add these secrets (if you have a code signing certificate):

- `CSC_LINK`: Base64-encoded .pfx certificate
- `CSC_KEY_PASSWORD`: Certificate password

_Note: The workflow will still work without code signing, but binaries won't be signed._

### Step 7: Create a Release

**Quick Setup**: You can run `scripts/setup.bat YOUR_GITHUB_USERNAME` (Windows) or `./scripts/setup.sh YOUR_GITHUB_USERNAME` (Mac/Linux) to automate steps 1-3.

#### Option A: Create a Git Tag (Recommended)

```bash
git tag v1.0.0
git push origin v1.0.0
```

#### Option B: Manual Workflow Trigger

1. Go to **Actions** tab in your GitHub repository
2. Select "Build and Release" workflow
3. Click "Run workflow"

## What Happens During Release

1. **Build Phase**: Electron app is built for all 3 platforms simultaneously
2. **Release Phase**: All builds are uploaded to GitHub Releases
3. **Docs Build Phase**: Documentation site is built
4. **Deploy Phase**: Docs site is deployed to GitHub Pages

## Download Links

After the first release, your downloads will be available at:

- Windows: `https://github.com/YOUR_USERNAME/renzu/releases/latest/download/renzu-VERSION-setup.exe`
- macOS: `https://github.com/YOUR_USERNAME/renzu/releases/latest/download/renzu-VERSION.dmg`
- Linux: `https://github.com/YOUR_USERNAME/renzu/releases/latest/download/renzu-VERSION.AppImage`

The documentation site will be available at:
`https://YOUR_USERNAME.github.io/renzu/`

## Troubleshooting

### Workflow Fails on macOS Build

- Check if code signing secrets are correct
- Consider setting `notarize: false` in `electron-builder.yml` for testing

### GitHub Pages Not Deploying

- Ensure GitHub Pages is enabled in repository settings
- Check that workflow has `pages: write` permission
- Verify the workflow completed successfully

### Download Buttons Don't Work

- Update the GitHub username in `App.tsx`
- Ensure at least one release has been created
- Check that artifact names match in workflow and button links

## Maintenance

### Update Version

Update version in `package.json`, then create a new tag:

```bash
npm version patch  # or minor, or major
git push origin main --tags
```

### Update Documentation

1. Edit files in `docs/src/`
2. Test locally: `cd docs && npm run dev`
3. Commit and push changes
4. Documentation will be rebuilt on next release

## File Structure

```
renzu/
├── docs/                       # Documentation site
│   ├── public/                 # Static assets (screenshots go here)
│   ├── src/
│   │   ├── App.tsx            # Main documentation page
│   │   ├── App.css            # Styles
│   │   └── main.tsx           # Entry point
│   ├── vite.config.ts         # Vite configuration
│   └── package.json           # Docs dependencies
├── .github/
│   └── workflows/
│       └── release.yml        # CI/CD workflow
├── electron-builder.yml       # Electron build config
└── package.json               # Main app dependencies
```
