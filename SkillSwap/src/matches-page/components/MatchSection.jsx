import MatchCard from "./MatchCard";

function MatchSection({ title, accent, countText, matches, type }) {
  return (
    <section className="match-section">
      <div className="match-section-header">
        <h2>
          {title} <span>{accent}</span>
        </h2>

        {countText && <p>{countText}</p>}
      </div>

      <div className="match-card-grid">
        {matches.length === 0 ? (
          <p className="empty-match-text">Nothing here yet.</p>
        ) : (
          matches.map((match) => (
            <MatchCard key={match.id} match={match} type={type} />
          ))
        )}
      </div>
    </section>
  );
}

export default MatchSection;