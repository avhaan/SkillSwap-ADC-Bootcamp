// after react router done code

import { Link } from "react-router-dom";
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

      <input className="navbar-search" placeholder="Search skills..." />

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