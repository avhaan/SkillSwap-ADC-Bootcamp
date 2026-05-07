import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { token, user } = useAuth() || {};
  const initials = user?.name
    ? user.name.split(" ").map((word) => word[0]).join("")
    : "ME";

  function handleSearch(event) {
    event.preventDefault();

    const query = search.trim();
    navigate(query ? `/browse?search=${encodeURIComponent(query)}` : "/browse");
  }

  return (
    <nav className="navbar">
      <Link to="/browse" className="navbar-logo">
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
        <Link to="/browse">Browse</Link>
        <Link to={token ? "/profile/me" : "/login"}>My profile</Link>
        <div className="navbar-avatar">{initials}</div>
      </div>
    </nav>
  );
}

export default Navbar;
