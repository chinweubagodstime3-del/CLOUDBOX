
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <a href="/" className="dashboard-logo">
          ☁ CloudBox
        </a>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav">
          <a href="#overview" className="selected">▦ Overview</a>
          <a href="#files">▣ My Files</a>
          <a href="#recent">◷ Recent Files</a>
          <a href="#favorites">♡ Favorites</a>
          <a href="#settings">⚙ Settings</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="storage-label">
            <span>Storage</span>
            <span>45%</span>
          </div>
          <div className="dashboard-storage-bar">
            <div />
          </div>
          <p>6.8 GB of 15 GB used</p>
          <button onClick={() => window.location.href = "/"}>
            Log out
          </button>
        </div>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-eyebrow">YOUR WORKSPACE</p>
            <h1>Overview</h1>
          </div>
          <div className="dashboard-user">
            <div className="user-avatar">G</div>
            <span>My Account</span>
          </div>
        </header>

        <section className="dashboard-welcome" id="overview">
          <div>
            <p>YOUR FILES, YOUR SPACE</p>
            <h2>Welcome to your workspace 👋</h2>
            <span>Everything you need, organized in one place.</span>
          </div>
          <div className="welcome-icon">☁</div>
        </section>

        <section className="dashboard-stats">
          <article className="stat-card">
            <div className="stat-icon purple">▣</div>
            <p>Total files</p>
            <h2>0</h2>
            <span>Your files will appear here</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon blue">☁</div>
            <p>Storage used</p>
            <h2>0 GB</h2>
            <span>Of 15 GB available</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon green">↗</div>
            <p>Shared files</p>
            <h2>0</h2>
            <span>Files shared with others</span>
          </article>
        </section>

        <section className="files-section" id="files">
          <div className="files-heading">
            <div>
              <h2>My Files</h2>
              <p>Your workspace starts here.</p>
            </div>
            <button className="upload-button">
              + Upload files
            </button>
          </div>

          <div className="empty-files">
            <div className="empty-files-icon">☁</div>
            <h3>No files yet</h3>
            <p>
              Your uploaded files will appear here.
              Let's add file uploads next.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
