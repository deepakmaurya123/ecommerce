import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    password2: "",
  });
  const [msg, setMsg] = useState("");
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
    if (form.password !== form.password2) {
      setMsg("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      nav("/login", {
        state: {
          message: "Registration successful! Please login with your new account.",
        },
      });
    } catch (err) {
      console.error(err);
      setMsg(err.message || "Registration failed");
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
              <label>Phone</label>
              <input
                name="phone"
                onChange={handleChange}
                value={form.phone}
                placeholder="Phone number"
                required
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                name="city"
                onChange={handleChange}
                value={form.city}
                placeholder="City"
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
