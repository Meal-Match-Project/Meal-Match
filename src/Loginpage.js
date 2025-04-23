import React from "react";
import { useNavigate } from "react-router-dom";
import "./Loginpage.css";

function Loginpage() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo">Meal Match</div>
        <div className="nav-links">
          <a href="#">ABOUT</a>
          <a href="#">TEMPLATES</a>
          <a href="#">PRICING</a>
          <button className="nav-btn header-login-btn" onClick={() => navigate("/login")}>
            LOGIN
          </button>
          <button className="nav-btn signup-btn" onClick={() => navigate("/signup")}>
            SIGN UP
          </button>
        </div>
      </nav>

      {/* Login Container */}
      <div className="login-container">
        <h2 className="login-title">LOG IN</h2>

        <div className="login-box">
          <form>
            <label>Email</label>
            <input type="email" placeholder="Your Email" />

            <label>Password</label>
            <input type="password" placeholder="Your Password" />

            {/* (REMEMBER ME + FORGOT PASSWORD) */}
            <div className="login-options">
            <label className="remember-me">
            <input type="checkbox" className="checkbox" /> Remember Me
            </label>
              <label className="forgot-password">Forgot Password?</label>
            </div>
            
            <div className="login-button-container">
              <button type="submit" className="login-btn">LOGIN</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Loginpage;