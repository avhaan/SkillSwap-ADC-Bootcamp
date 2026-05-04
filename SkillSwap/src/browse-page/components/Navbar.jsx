import { Link } from 'react-router-dom'

export default function Navbar(){
    return (
        <nav className="navbar">
            {/* used span here to keep words on same line but style both differently.*/ }
        <Link to="/" className="navbar-logo">
            <span className="skill">Skill</span>
            <span className="swap">Swap</span>
        </Link>

        {/* our searchbar for our nav */}
        <input type="text" placeholder="search skills" className="navbar-search" />

        <div className="navbar-links">

        {/* Sends you to the marketplace / skill swap board */}
        <Link to="/browse"> Browse </Link>

        <Link to="/profile/me"> My Profile</Link>

        <div className="navbar-avatar">ZD</div>
        </div>


        </nav>
    )
}