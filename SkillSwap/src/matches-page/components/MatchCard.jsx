import MatchStatusBadge from "./MatchStatusBadge";
import { Link } from "react-router-dom";

function MatchCard({ match, type, onAccept, onDecline, onCancel }) {
  function getAvatarClass() {
    if (match.avatarColor === "purple") {
      return "match-avatar purple";
    }

    if (match.avatarColor === "gold") {
      return "match-avatar gold";
    }

    if (match.avatarColor === "blue") {
      return "match-avatar blue";
    }

    return "match-avatar green";
  }

  return (
    <article className={`match-card ${type === "incoming" ? "incoming-card" : ""}`}>
      <div className="match-card-top">
        <div className={getAvatarClass()}>
          {match.initials}
        </div>

        <div className="match-person-info">
          <h3>{match.name}</h3>
          <p>{match.location}</p>
        </div>
      </div>

      <div className="match-reason">
        <p>{match.description}</p>
      </div>

      <div className="match-actions">
        {type === "matched" && (
          <>
            <Link to={`/profile/${match.otherId}`} className="primary-match-button">
              Open profile
            </Link>

            <a href={`mailto:${match.email || ""}`} className="secondary-match-button">
              Contact
            </a>

            <button
              type="button"
              className="secondary-match-button"
              onClick={() => onCancel(match.otherId)}
            >
              Unmatch
            </button>
          </>
        )}

        {type === "incoming" && (
          <>
            <button type="button" className="accept-button" onClick={() => onAccept(match.id)}>
              Accept
            </button>

            <button
              type="button"
              className="secondary-match-button"
              onClick={() => onDecline(match.id)}
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
              onClick={() => onCancel(match.otherId)}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      <div className="match-card-bottom">
        <MatchStatusBadge type={type} label={match.status} />

        <span className="match-time">
          {match.time}
        </span>
      </div>
    </article>
  );
}

export default MatchCard;
