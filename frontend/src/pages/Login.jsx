import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (user) {
      nav("/");
    }
  }, [user, nav]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await login(form);
      setMsg("Login successful!");
      setTimeout(() => nav("/"), 800);
    } catch (err) {
      console.error(err);
      setMsg(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Login</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input
                name="username"
                onChange={handleChange}
                value={form.username}
                placeholder="Username"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                onChange={handleChange}
                value={form.password}
                placeholder="Password"
                required
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          {msg && (
            <p className={`auth-alert ${msg.includes("successful") ? "auth-alert--success" : "auth-alert--error"}`}>
              {msg}
            </p>
          )}
          <div className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register" className="auth-link-btn">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;