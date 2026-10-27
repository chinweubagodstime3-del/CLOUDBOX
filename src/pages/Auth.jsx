
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";
import { auth } from "../firebase";
import "./Auth.css";

function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(
    location.state?.mode !== "signup"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
      } else {
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const messages = {
        "auth/invalid-email":
          "Please enter a valid email address.",
        "auth/user-not-found":
          "No account found. Please create an account first.",
        "auth/wrong-password":
          "Incorrect email or password.",
        "auth/invalid-credential":
          "Incorrect email or password.",
        "auth/email-already-in-use":
          "This email already has an account. Please log in.",
        "auth/weak-password":
          "Your password must be at least 6 characters.",
        "auth/too-many-requests":
          "Too many attempts. Please try again later.",
        "auth/network-request-failed":
          "Network error. Check your internet connection.",
        "auth/operation-not-allowed":
          "Email/password sign-in is not enabled in Firebase.",
      };

      setError(
        messages[err.code] ||
          "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin((current) => !current);
    setError("");
    setPassword("");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <a href="/" className="auth-logo">
          ☁ CloudBox
        </a>

        <h1>
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>

        <p className="auth-description">
          {isLogin
            ? "Log in to access your workspace."
            : "Join CloudBox and organize your files."}
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            autoComplete={
              isLogin ? "current-password" : "new-password"
            }
            minLength={6}
            required
          />

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isLogin
                ? "Log In"
                : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin
            ? "New to CloudBox?"
            : "Already have an account?"}{" "}
          <button type="button" onClick={switchMode}>
            {isLogin ? "Create an account" : "Log in"}
          </button>
        </p>

        <button
          type="button"
          className="auth-back"
          onClick={() => navigate("/")}
        >
          ← Back to home
        </button>
      </section>
    </main>
  );
}

export default Auth;
