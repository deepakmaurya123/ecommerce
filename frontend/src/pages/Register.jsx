import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/client";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", password2: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (form.password !== form.password2) {
      setMsg("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(form);
      setMsg("Registration successful!");
      setTimeout(() => nav("/"), 800);
    } catch (err) {
      console.error(err);
      setMsg("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Register</h2>
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
              <label>Email</label>
              <input
                name="email"
                type="email"
                onChange={handleChange}
                value={form.email}
                placeholder="Email address"
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
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                name="password2"
                type="password"
                onChange={handleChange}
                value={form.password2}
                placeholder="Confirm Password"
                required
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          {msg && (
            <p className={`auth-alert ${msg.includes("successful") ? "auth-alert--success" : "auth-alert--error"}`}>
              {msg}
            </p>
          )}
          <div className="auth-footer">
            Already have an account?{" "}
            <Link to="/login" className="auth-link-btn">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
