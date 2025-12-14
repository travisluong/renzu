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
                  <path d="M20.581 19.049c-.55-.446-.336-1.431-.907-1.917.553-3.365-.997-6.331-2.845-8.232-1.551-1.595-1.051-3.147-1.051-4.49 0-2.146-.881-4.41-3.55-4.41-2.853 0-3.635 2.38-3.663 3.738-.068 3.262.659 4.11-1.25 6.484-2.246 2.793-2.577 5.579-2.07 7.057-.237.276-.557.582-1.155.835-1.652.72-.441 1.925-.898 2.78-.13.243-.192.497-.192.74 0 .75.596 1.399 1.679 1.302 1.461-.13 2.809.905 3.681.905.77 0 1.402-.438 1.696-1.041 1.377-.339 3.077-.296 4.453.059.247.691.917 1.141 1.662 1.141 1.631 0 1.945-1.849 3.816-2.475.674-.225 1.013-.879 1.013-1.488 0-.39-.139-.761-.419-.988z" />
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
