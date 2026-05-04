import SkillBadge from "../browse-page/components/SkillBadge";
import { Link } from "react-router-dom";
import "../landing-page/style.css";

export default function LandingPage(){
    return(
        
        <div className="landing">
            <div className="landing-hero">
                <h1>Trade what <span> you know</span> </h1>
                <p>Find someone to swap skills with in seconds.</p>
                <Link to="/browse" className="landing-btn"> Browse skills</Link>
            </div>
        </div>
       
    )
}
