import { useEffect, useState } from "react";
import {
  apiAcceptMatch,
  apiCancelOrUnmatch,
  apiDeclineMatch,
  apiGetMe,
  apiGetMyMatches,
  apiGetUser,
} from "../api/api";
import MatchSection from "../matches-page/components/MatchSection";
import "../matches-page/style.css";

function MatchesPage() {
  const [me, setMe] = useState(null);
  const [matches, setMatches] = useState({
    current_matches: [],
    incoming_pending: [],
    outgoing_pending: [],
  });
  const [loading, setLoading] = useState(true);

  async function makeCard(match, type, currentUser) {
    const otherId =
      match.requester_id === currentUser._id ? match.receiver_id : match.requester_id;
    const otherName =
      match.requester_id === currentUser._id ? match.receiver_name : match.requester_name;

    let otherUser = null;
    try {
      otherUser = await apiGetUser(otherId);
    } catch {
      otherUser = null;
    }

    return {
      id: match._id,
      otherId,
      name: otherUser?.name || otherName,
      email: otherUser?.email || "",
      location: otherUser?.location || "",
      initials: (otherUser?.name || otherName)
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase(),
      description:
        type === "incoming"
          ? `${otherName} sent you a match request.`
          : type === "sent"
            ? `Waiting for ${otherName} to accept your match request.`
            : `You and ${otherName} are matched. Contact info is now unlocked.`,
      status: type === "matched" ? "Matched" : type === "incoming" ? "New request" : "Pending",
    };
  }

  async function loadMatches() {
    setLoading(true);

    try {
      const currentUser = await apiGetMe();
      const data = await apiGetMyMatches();

      setMe(currentUser);
      setMatches({
        current_matches: await Promise.all(
          (data.current_matches || []).map((match) => makeCard(match, "matched", currentUser))
        ),
        incoming_pending: await Promise.all(
          (data.incoming_pending || []).map((match) => makeCard(match, "incoming", currentUser))
        ),
        outgoing_pending: await Promise.all(
          (data.outgoing_pending || []).map((match) => makeCard(match, "sent", currentUser))
        ),
      });
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadMatches();
  }, []);

  async function handleAccept(matchID) {
    await apiAcceptMatch(matchID);
    loadMatches();
  }

  async function handleDecline(matchID) {
    await apiDeclineMatch(matchID);
    loadMatches();
  }

  async function handleCancel(userID) {
    await apiCancelOrUnmatch(userID);
    loadMatches();
  }

  if (loading) {
    return <p>Loading matches...</p>;
  }

  return (
    <div className="matches-page">
      <main className="matches-container">
        <section className="matches-hero">
          <h1>
            Your <span>matches</span>
          </h1>

          <p className="matches-intro">
            See your current matches, incoming requests, and sent requests.
          </p>
        </section>

        <MatchSection
          title="Current"
          accent="matches"
          countText={`${matches.current_matches.length} active`}
          matches={matches.current_matches}
          type="matched"
          onCancel={handleCancel}
        />

        <MatchSection
          title="Incoming"
          accent="requests"
          countText={`${matches.incoming_pending.length} waiting on you`}
          matches={matches.incoming_pending}
          type="incoming"
          onAccept={handleAccept}
          onDecline={handleDecline}
        />

        <MatchSection
          title="Sent"
          accent="requests"
          countText={`${matches.outgoing_pending.length} awaiting response`}
          matches={matches.outgoing_pending}
          type="sent"
          onCancel={handleCancel}
        />
      </main>
    </div>
  );
}

export default MatchesPage;
