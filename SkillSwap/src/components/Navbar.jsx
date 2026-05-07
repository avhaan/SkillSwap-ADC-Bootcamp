import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const {user, logout} = useAuth();
  const initials = user ? user.name.split(' ').map(n => n[0]).join('') : ''


  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Skill<span>Swap</span>
      </Link>

        <input
          className="navbar-search"
          placeholder="Search skills..."
          onChange={(event) => setSearch(event.target.value)}
        />

      <div className="navbar-links">
        {/* if the user is logged in, we change our navbar to display logout
            and the profile of the user. */}
        {user ? (
          <>
             <Link to={`/profile/${user._id}`}>
             <div className="navbar-avatar">{initials}</div>
             </Link>
          </>
        ) : (
          <>
        {/* If user is not logged in, we have login, register and browse on the navbar.  */}
        <Link to="/browse">Browse</Link>
        <Link to="/login">Login/Register</Link>
        </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
