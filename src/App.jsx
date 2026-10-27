
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";

function HomePage() {
  const navigate = useNavigate();

  const goToAuth = (mode) => {
    navigate("/auth", { state: { mode } });
  };

  return (
    <div className="cloudbox">
      <nav className="navbar">
        <a href="/" className="logo">
          <span className="logo-icon">☁</span>
          CloudBox
        </a>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-actions">
          <button
            className="login-btn"
            onClick={() => goToAuth("login")}
          >
            Log in
          </button>

          <button
            className="signup-btn"
            onClick={() => goToAuth("signup")}
          >
            Get Started
          </button>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="hero-label">
              ✦ YOUR WORKSPACE, REIMAGINED
            </span>

            <h1>
              All your files.
              <br />
              <span>One beautiful space.</span>
            </h1>

            <p>
              Store, organize, and share your files with ease.
              CloudBox keeps everything you need in one secure,
              simple workspace.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-btn"
                onClick={() => goToAuth("signup")}
              >
                Get started free <span>→</span>
              </button>

              <button
                className="secondary-btn"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore features
              </button>
            </div>

            <div className="hero-note">
              <span>✓</span> Easy to use
              <span>✓</span> Access anywhere
              <span>✓</span> Your files, organized
            </div>
          </div>

          <div className="hero-visual">
            <div className="glow"></div>

            <div className="storage-window">
              <div className="window-top">
                <div className="window-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="window-title">My Workspace</span>
                <span className="window-menu">•••</span>
              </div>

              <div className="storage-body">
                <aside className="mini-sidebar">
                  <div className="mini-brand">☁</div>
                  <div className="mini-nav active">▦</div>
                  <div className="mini-nav">▣</div>
                  <div className="mini-nav">♡</div>
                  <div className="mini-nav">⚙</div>
                </aside>

                <div className="mini-content">
                  <div className="mini-heading">
                    <div>
                      <h3>Good morning!</h3>
                      <p>Here's your workspace at a glance.</p>
                    </div>
                    <span className="avatar">G</span>
                  </div>

                  <div className="storage-card">
                    <div className="storage-icon">☁</div>
                    <div>
                      <p>Storage used</p>
                      <h3>
                        6.8 GB <span>of 15 GB</span>
                      </h3>
                    </div>
                    <span className="storage-percent">45%</span>
                    <div className="storage-bar">
                      <div></div>
                    </div>
                  </div>

                  <h4 className="recent-title">Recent files</h4>

                  <div className="file-row">
                    <span className="file-icon pdf">PDF</span>
                    <div>
                      <strong>Project Proposal</strong>
                      <p>Updated just now</p>
                    </div>
                    <span className="file-size">2.4 MB</span>
                  </div>

                  <div className="file-row">
                    <span className="file-icon sheet">XLS</span>
                    <div>
                      <strong>Marketing Report</strong>
                      <p>Updated yesterday</p>
                    </div>
                    <span className="file-size">1.8 MB</span>
                  </div>

                  <div className="file-row">
                    <span className="file-icon image-file">IMG</span>
                    <div>
                      <strong>Brand Assets</strong>
                      <p>Updated Monday</p>
                    </div>
                    <span className="file-size">8.2 MB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="floating-card">
              <span>✓</span>
              <div>
                <strong>Files organized</strong>
                <p>Your workspace is up to date</p>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-section">
          <p>A simpler way to manage your digital life</p>
          <div className="trust-items">
            <span>☁ Cloud storage</span>
            <span>↗ Easy sharing</span>
            <span>◈ Smart organization</span>
            <span>⌁ Work anywhere</span>
          </div>
        </section>

        <section id="features" className="features-section">
          <span className="section-label">MADE FOR YOUR WORKFLOW</span>
          <h2>Everything in its right place.</h2>
          <p>Spend less time searching and more time doing what matters.</p>
        </section>

        <section id="pricing" className="features-section">
          <span className="section-label">SIMPLE AND FLEXIBLE</span>
          <h2>A plan for every workspace.</h2>
          <p>We'll explore the right storage plan for your needs.</p>
        </section>

        <section id="about" className="features-section">
          <span className="section-label">ABOUT CLOUDBOX</span>
          <h2>Your work, all together.</h2>
          <p>One workspace to keep your files organized and easy to find.</p>
        </section>
      </main>

      <footer className="footer">
        <a href="/" className="logo">
          <span className="logo-icon">☁</span>
          CloudBox
        </a>
        <p>Everything you need, all in one place.</p>
        <span>© 2026 CloudBox</span>
      </footer>
    </div>
  );
}

function ProtectedDashboard() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  if (user === undefined) {
    return <p>Checking your account...</p>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/dashboard"
          element={<ProtectedDashboard />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
