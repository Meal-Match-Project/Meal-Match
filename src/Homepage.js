import React from "react";
import { useNavigate } from "react-router-dom";

function Homepage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", padding: "50px", position: "relative" }}>
      {/* Navigation Bar */}
      <nav style={{ position: "absolute", top: "20px", right: "20px" }}>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "10px 15px",
            fontSize: "14px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          Log In
        </button>
      </nav>

      <h1>Meal Match</h1>
    </div>
  );
}

export default Homepage;
