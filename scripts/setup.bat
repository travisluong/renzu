@echo off
REM Renzu Setup Helper Script for Windows
echo 🚀 Renzu Setup Helper
echo ====================
echo.

if "%1"=="" (
    echo Usage: setup.bat YOUR_GITHUB_USERNAME
    echo.
    echo Example: setup.bat johndoe
    exit /b 1
)

set GITHUB_USERNAME=%1

echo Setting up Renzu with GitHub username: %GITHUB_USERNAME%
echo.

REM Update App.tsx
echo 📝 Updating docs/src/App.tsx...
powershell -Command "(Get-Content docs\src\App.tsx) -replace 'YOUR_USERNAME', '%GITHUB_USERNAME%' | Set-Content docs\src\App.tsx"

REM Update electron-builder.yml
echo 📝 Updating electron-builder.yml...
powershell -Command "(Get-Content electron-builder.yml) -replace 'YOUR_USERNAME', '%GITHUB_USERNAME%' | Set-Content electron-builder.yml"

REM Install dependencies
echo 📦 Installing main app dependencies...
call npm install

echo 📦 Installing docs dependencies...
cd docs
call npm install
cd ..

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Add your screenshots to docs\public\ (screenshot-1.png, screenshot-2.png, screenshot-3.png)
echo 2. Test the docs site: cd docs ^&^& npm run dev
echo 3. Enable GitHub Pages in your repository settings
echo 4. Create a release: git tag v1.0.0 ^&^& git push origin v1.0.0
echo.
echo For more details, see SETUP.md
