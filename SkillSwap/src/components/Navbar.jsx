import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const initials = user ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "";

  function handleSearch(event) {
    event.preventDefault();

    const nextSearch = search.trim();

    if (nextSearch) {
      navigate(`/browse?search=${encodeURIComponent(nextSearch)}`);
    } else {
      navigate("/browse");
    }
  }

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
            <Link to="/browse">Browse</Link>
            <Link to="/matches">Matches</Link>
            <Link to="/profile/me" className="navbar-avatar" aria-label="My profile">
              {initials}
            </Link>
          </>
        ) : (
          <>
            <Link to="/browse">Browse</Link>
            <Link to="/login">Matches</Link>
            <Link to="/login" className="navbar-auth-button primary">
              Login/Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
