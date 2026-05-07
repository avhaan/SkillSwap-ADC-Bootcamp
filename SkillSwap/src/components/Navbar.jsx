// after react router done code

import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Skill<span>Swap</span>
      </Link>

      <input className="navbar-search" placeholder="Search skills..." />

      <div className="navbar-links">
        <Link to="/browse">Browse</Link>
        <Link to="/profile/me">My profile</Link>
        <div className="navbar-avatar">MR</div>
      </div>
    </nav>
  );
}

export default Navbar;