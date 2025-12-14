import './App.css'
import { useState, useEffect } from 'react'

interface GithubRelease {
  tag_name: string
  assets: Array<{
    name: string
    browser_download_url: string
  }>
}

function App() {
  const [release, setRelease] = useState<GithubRelease | null>(null)

  useEffect(() => {
    fetch('https://api.github.com/repos/travisluong/renzu/releases/latest')
      .then((res) => res.json())
      .then((data) => setRelease(data))
      .catch((err) => console.error('Failed to fetch release:', err))
  }, [])

  const handleDownload = (platform: string): void => {
    if (!release) return

    let downloadUrl = ''
    const assets = release.assets

    switch (platform) {
      case 'windows':
        downloadUrl = assets.find((a) => a.name.endsWith('.exe'))?.browser_download_url || ''
        break
      case 'mac':
        downloadUrl = assets.find((a) => a.name.endsWith('.dmg'))?.browser_download_url || ''
        break
      case 'linux':
        downloadUrl = assets.find((a) => a.name.endsWith('.AppImage'))?.browser_download_url || ''
        break
    }

    if (downloadUrl) {
      window.location.href = downloadUrl
    } else {
      console.error(`No download found for ${platform}`)
      // Fallback to generic link if API fails
      const baseUrl = `https://github.com/travisluong/renzu/releases/latest/download/`
      const files: Record<string, string> = {
        windows: `${baseUrl}renzu-${release.tag_name.replace('v', '')}-setup.exe`,
        mac: `${baseUrl}renzu-${release.tag_name.replace('v', '')}.dmg`,
        linux: `${baseUrl}renzu-${release.tag_name.replace('v', '')}.AppImage`
      }
      window.location.href = files[platform]
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1 className="logo">Renzu</h1>
          <a
            href="https://github.com/travisluong/renzu"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <section className="hero">
            <h2 className="hero-title">AWS ECS Desktop Client</h2>
            <p className="hero-description">
              Renzu is a powerful desktop application for managing your AWS Elastic Container
              Service (ECS) infrastructure. Monitor clusters, services, tasks, and container logs
              with an intuitive interface built with Electron and React.
            </p>
          </section>

          <section className="features">
            <div className="feature-card">
              <h3>🚀 Easy Management</h3>
              <p>
                Browse and manage your ECS clusters, services, and tasks from a simple desktop
                interface
              </p>
            </div>
            <div className="feature-card">
              <h3>📊 Real-time Monitoring</h3>
              <p>
                View container logs and monitor your services in real-time with CloudWatch
                integration
              </p>
            </div>
            <div className="feature-card">
              <h3>🔐 Secure AWS Integration</h3>
              <p>Connect securely using your AWS credentials with support for profiles and SSO</p>
            </div>
          </section>

          <section className="screenshots">
            <h2 className="section-title">Screenshots</h2>
            <div className="screenshot-grid">
              <div className="screenshot-item">
                <img
                  src="/renzu/screenshot-1.png"
                  alt="Renzu Screenshot 1"
                  className="screenshot-img"
                />
              </div>
              <div className="screenshot-item">
                <img
                  src="/renzu/screenshot-2.png"
                  alt="Renzu Screenshot 2"
                  className="screenshot-img"
                />
              </div>
              <div className="screenshot-item">
                <img
                  src="/renzu/screenshot-3.png"
                  alt="Renzu Screenshot 3"
                  className="screenshot-img"
                />
              </div>
            </div>
          </section>

          <section className="download">
            <h2 className="section-title">
              Download Latest Release {release ? `(${release.tag_name})` : ''}
            </h2>
            <div className="download-buttons">
              <button onClick={() => handleDownload('windows')} className="download-button">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                </svg>
                <span>Windows</span>
              </button>
              <button onClick={() => handleDownload('mac')} className="download-button">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span>macOS</span>
              </button>
              <button onClick={() => handleDownload('linux')} className="download-button">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.84-.41 1.74-.348 2.642.012.154.03.373.046.529.027.336.063.654.104.95.077.555.19 1.04.334 1.49.26.81.647 1.46 1.163 1.966.516.505 1.137.854 1.854 1.042.16.042.331.075.508.097.068.008.136.012.204.015.275.012.564-.03.862-.105.722-.184 1.443-.598 2.168-1.201.289-.24.573-.504.859-.783.068-.067.136-.135.204-.204.272-.275.545-.569.818-.883 1.183-1.362 2.186-3.06 2.977-4.807.713-1.576 1.35-3.309 1.717-4.798.17-.692.27-1.369.3-2.034.03-.665-.015-1.317-.135-1.95-.12-.633-.315-1.248-.585-1.846-.27-.598-.615-1.178-1.035-1.738-.42-.56-.915-1.095-1.485-1.605-.57-.51-1.215-.99-1.935-1.44-.72-.45-1.515-.87-2.385-1.26-.87-.39-1.815-.75-2.835-1.08-1.02-.33-2.115-.63-3.285-.9-1.17-.27-2.415-.51-3.735-.72-1.32-.21-2.715-.39-4.185-.54C2.985.09 1.515 0 .045 0h-.03C.005 0-.005 0 0 0c.015 0 .03 0 .045.003l.015-.003h.03c1.47 0 2.94.09 4.41.27 1.47.18 2.865.42 4.185.69 1.32.27 2.565.57 3.735.93 1.17.36 2.265.78 3.285 1.26.51.24.99.51 1.44.81.45.3.87.63 1.26.99.39.36.75.75 1.08 1.17.33.42.63.87.9 1.35.27.48.51.99.72 1.53.21.54.39 1.11.54 1.71.15.6.27 1.23.36 1.89.09.66.15 1.35.18 2.07.03.72-.03 1.47-.18 2.25-.15.78-.39 1.59-.72 2.43-.33.84-.75 1.71-1.26 2.61-.51.9-1.11 1.83-1.8 2.79-.69.96-1.47 1.95-2.34 2.97-.87 1.02-1.83 2.07-2.88 3.15-.525.54-1.065 1.08-1.62 1.62-.555.54-1.125 1.08-1.71 1.62-1.17.96-2.415 1.89-3.72 2.73-1.305.84-2.67 1.59-4.08 2.22-1.41.63-2.865 1.14-4.35 1.53-1.485.39-2.985.66-4.5.81-1.515.15-3.03.18-4.545.09C.03 23.97 0 23.94 0 23.91v-.015c0-.015.015-.03.03-.03h.015c1.515.075 3.015.03 4.5-.135 1.485-.165 2.97-.48 4.425-.945 1.455-.465 2.88-1.08 4.275-1.845 1.395-.765 2.76-1.68 4.095-2.745.667-.533 1.32-1.095 1.965-1.68.645-.585 1.275-1.2 1.89-1.845.615-.645 1.215-1.32 1.8-2.025.585-.705 1.155-1.44 1.71-2.205.555-.765 1.095-1.56 1.62-2.385.525-.825 1.035-1.68 1.53-2.565.495-.885.975-1.8 1.44-2.745.465-.945.915-1.92 1.35-2.925.435-1.005.855-2.04 1.26-3.105.405-1.065.795-2.16 1.17-3.285.375-1.125.735-2.28 1.08-3.465.345-1.185.675-2.4.99-3.645.315-1.245.615-2.52.9-3.825.285-1.305.555-2.64.81-4.005.255-1.365.495-2.76.72-4.185.225-1.425.435-2.88.63-4.365.195-1.485.375-3 .54-4.545.165-1.545.315-3.12.45-4.725.135-1.605.255-3.24.36-4.905.105-1.665.195-3.36.27-5.085.075-1.725.135-3.48.18-5.265.045-1.785.075-3.6.09-5.445.015-1.845.015-3.72 0-5.625-.015-1.905-.045-3.84-.09-5.805-.045-1.965-.105-3.96-.18-5.985-.075-2.025-.165-4.08-.27-6.165-.105-2.085-.225-4.2-.36-6.345-.135-2.145-.285-4.32-.45-6.525-.165-2.205-.345-4.44-.54-6.705-.195-2.265-.405-4.56-.63-6.885-.225-2.325-.465-4.68-.72-7.065-.255-2.385-.525-4.8-.81-7.245-.285-2.445-.585-4.92-.9-7.425-.315-2.505-.645-5.04-.99-7.605-.345-2.565-.705-5.16-1.08-7.785-.375-2.625-.765-5.28-1.17-7.965-.405-2.685-.825-5.4-1.26-8.145-.435-2.745-.885-5.52-1.35-8.325-.465-2.805-.945-5.64-1.44-8.505-.495-2.865-.975-5.76-1.44-8.685-.465-2.925-.915-5.88-1.35-8.865-.435-2.985-.855-6-1.26-9.045-.405-3.045-.795-6.12-1.17-9.225-.375-3.105-.735-6.24-1.08-9.405-.345-3.165-.675-6.36-.99-9.585-.315-3.225-.615-6.48-.9-9.765-.285-3.285-.555-6.6-.81-9.945-.255-3.345-.495-6.72-.72-10.125-.225-3.405-.435-6.84-.63-10.305-.195-3.465-.375-6.96-.54-10.485-.165-3.525-.315-7.08-.45-10.665-.135-3.585-.255-7.2-.36-10.845-.105-3.645-.195-7.32-.27-11.025-.075-3.705-.135-7.44-.18-11.205-.045-3.765-.075-7.56-.09-11.385C12.504.015 12.504 0 12.504 0z" />
                </svg>
                <span>Linux</span>
              </button>
            </div>
            <p className="download-note">
              Requires AWS credentials configured on your system. Supports AWS profiles and SSO
              authentication.
            </p>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Renzu. Open source software for AWS ECS management.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
