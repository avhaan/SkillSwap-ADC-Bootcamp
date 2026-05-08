function MatchStatusBadge({ type, label }) {
  return (
    <span className={`match-status-badge ${type}`}>
      {label}
    </span>
  );
}

export default MatchStatusBadge;