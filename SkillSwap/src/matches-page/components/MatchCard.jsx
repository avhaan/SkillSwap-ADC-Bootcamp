import { Link, useNavigate } from "react-router-dom";
import MatchStatusBadge from "./MatchStatusBadge";

function MatchCard({ match, type, onAccept, onDecline, onCancel }) {
  const navigate = useNavigate();

  function openProfile() {
    navigate(`/profile/${match.otherId}`);
  }

  function stopClick(event) {
    event.stopPropagation();
  }

  return (
    <article
      className={`match-card ${type === "incoming" ? "incoming-card" : ""}`}
      onClick={openProfile}
    >
      <div className="match-card-top">
        <div className="match-avatar">
          {match.initials}
        </div>

        <div className="match-person-info">
          <h3>{match.name}</h3>
          <p>{match.location || "Location not listed"}</p>
        </div>
      </div>

      <div className="match-reason">
        <p>{match.description}</p>
      </div>

      <div className="match-actions">
        {type === "matched" && (
          <>
            <Link
              to={`/profile/${match.otherId}`}
              className="primary-match-button"
              onClick={stopClick}
            >
              Open profile
            </Link>

            <a
              href={`mailto:${match.email || ""}`}
              className="secondary-match-button"
              onClick={stopClick}
            >
              Contact
            </a>

            <button
              type="button"
              className="secondary-match-button"
              onClick={(event) => {
                stopClick(event);
                onCancel(match.otherId);
              }}
            >
              Unmatch
            </button>
          </>
        )}

        {type === "incoming" && (
          <>
            <button
              type="button"
              className="accept-button"
              onClick={(event) => {
                stopClick(event);
                onAccept(match.id);
              }}
            >
              Accept
            </button>

            <button
              type="button"
              className="secondary-match-button"
              onClick={(event) => {
                stopClick(event);
                onDecline(match.id);
              }}
            >
              Decline
            </button>
          </>
        )}

        {type === "sent" && (
          <>
            <button type="button" className="disabled-match-button" disabled>
              Request sent
            </button>

            <button
              type="button"
              className="secondary-match-button"
              onClick={(event) => {
                stopClick(event);
                onCancel(match.otherId);
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      <div className="match-card-bottom">
        <MatchStatusBadge type={type} label={match.status} />
      </div>
    </article>
  );
}

export default MatchCard;
