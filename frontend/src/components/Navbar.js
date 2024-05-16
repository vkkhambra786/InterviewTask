import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ isLoggedIn }) => {
  return (
    <nav className="navbar">
      <div>
        {/* <h1>My App</h1> */}

        <h1>
          <Link to="/">Home </Link>
        </h1>
      </div>
      <ul>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>

        <li>
          <Link to="/records">Records</Link>
        </li>
        {!isLoggedIn ? ( // If user is not logged in, show login and signup links
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/signup">Signup</Link>
            </li>
          </>
        ) : (
          // If user is logged in, show logout link
          <li>
            <button>Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
