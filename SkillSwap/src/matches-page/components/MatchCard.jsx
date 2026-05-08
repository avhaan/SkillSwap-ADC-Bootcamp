import MatchStatusBadge from "./MatchStatusBadge";

function MatchCard({ match, type }) {
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
            <button type="button" className="primary-match-button">
              Open profile
            </button>

            <button type="button" className="secondary-match-button">
              Contact
            </button>
          </>
        )}

        {type === "incoming" && (
          <>
            <button type="button" className="accept-button">
              Accept
            </button>

            <button type="button" className="secondary-match-button">
              Decline
            </button>
          </>
        )}

        {type === "sent" && (
          <>
            <button type="button" className="disabled-match-button" disabled>
              Request sent
            </button>

            <button type="button" className="secondary-match-button">
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