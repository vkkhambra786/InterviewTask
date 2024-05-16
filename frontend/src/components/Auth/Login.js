import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useHistory
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook
import "./Login.css"; // Import CSS file for styling
import Navbar from "../Navbar";
function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform client-side validation
    const validationErrors = {};
    if (!formData.email) {
      validationErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      validationErrors.password = "Password is required";
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/api/login",
        formData
      );
      const token = response.data.token;

      // Save token to local storage
      console.log("tokenLogin", token);
      localStorage.setItem("token", token);
      login(response.data.token); // Save token to context

      // Redirect to dashboard page
      setIsLoggedIn(true);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <>
      {/* <Navbar isLoggedIn={isLoggedIn} /> */}
      <div className="login-container">
        {isLoggedIn && <Navbar />}

        <form onSubmit={handleSubmit} className="login-form">
          <h2>Login</h2>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </div>
          <button type="submit">Login</button>
        </form>
        <div>
          Don't have an account? <Link to="/signup">Signup</Link>
        </div>
      </div>
    </>
  );
}

export default Login;
