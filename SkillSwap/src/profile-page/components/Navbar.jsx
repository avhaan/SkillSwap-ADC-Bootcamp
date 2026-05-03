// after react router done code
// import { Link } from "react-router-dom";

// function Navbar() {
//   return (
//     <nav className="navbar">
//       <Link to="/browse" className="navbar-logo">
//         Skill<span>Swap</span>
//       </Link>

//       <input className="navbar-search" placeholder="Search skills..." />

//       <div className="navbar-links">
//         <Link to="/browse">Browse</Link>
//         <Link to="/profile/me">My profile</Link>
//         <div className="navbar-avatar">MR</div>
//       </div>
//     </nav>
//   );
// }

function Navbar() {
  return (
    <nav className="navbar">
      <a href="/browse" className="navbar-logo">
        Skill<span>Swap</span>
      </a>

      <input className="navbar-search" placeholder="Search skills..." />

      <div className="navbar-links">
        <a href="/browse">Browse</a>
        <a href="/profile/me">My profile</a>
        <div className="navbar-avatar">MR</div>
      </div>
    </nav>
  );
}

export default Navbar;