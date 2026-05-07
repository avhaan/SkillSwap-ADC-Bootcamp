import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const {user, logout} = useAuth();
  const initials = user ? user.name.split(' ').map(n => n[0]).join('') : ''


  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Skill<span>Swap</span>
      </Link>

      <form className="navbar-search-form" onSubmit={handleSearch}>
        <input
          className="navbar-search"
          placeholder="Search skills..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </form>

      <div className="navbar-links">
        {user ? (
          <>
             <Link to={`/profile/${user._id}`}>My profile</Link>
             <button onClick={logout} className="navbar-logout">Logout</button>
             <div className="navbar-avatar">{initials}</div>
          </>
        ) : (
          <>
        <Link to="/browse">Browse</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
