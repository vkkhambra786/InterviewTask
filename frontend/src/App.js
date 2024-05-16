import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Dashboard from "./components/Dashboard";
import RecordList from "./components/RecordList";
import Home from "./components/Home";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/records" element={<RecordList />} />

          {/* Add more routes as needed */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
