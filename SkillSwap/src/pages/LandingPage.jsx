import { Link } from "react-router-dom";
import "../landing-page/style.css";

export default function LandingPage() {
  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-left">
          <h1>
            Trade what <span>you know.</span>
          </h1>

          <h2>Not what you own.</h2>

          <p>
            List what you can teach, say what you want to learn, and find people
            ready to swap skills directly.
          </p>

          <div className="landing-actions">
            <Link to="/register" className="landing-btn primary">
              Get started <span>→</span>
            </Link>

            <Link to="/browse" className="landing-btn secondary">
              Browse skills
            </Link>
          </div>
        </div>

        <div className="landing-steps">
          <h3>How SkillSwap works</h3>

          <div className="landing-step">
            <span>1</span>
            <div>
              <h4>Create your profile</h4>
              <p>Add skills you offer and skills you want to learn.</p>
            </div>
          </div>

          <div className="landing-step">
            <span>2</span>
            <div>
              <h4>Find a match</h4>
              <p>Browse people by skill, category, and proficiency.</p>
            </div>
          </div>

          <div className="landing-step">
            <span>3</span>
            <div>
              <h4>Send a swap request</h4>
              <p>Connect when both people have something useful to trade.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
