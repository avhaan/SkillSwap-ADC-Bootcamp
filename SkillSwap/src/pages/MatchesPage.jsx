import "../matches-page/style.css";
import MatchSection from "../matches-page/components/MatchSection";
import { useEffect, useState } from "react";
import { apiGetMyMatches } from "../api/api";

function MatchesPage() {
  const currentMatches = [
    {
      id: "1",
      name: "Maya Ramirez",
      location: "College Park, MD",
      initials: "MR",
      avatarColor: "green",
      description: "You want Spanish and Maya offers that (Expert). They want Guitar",
      status: "Matched",
      time: "2 days ago",
    },
    {
      id: "2",
      name: "Jordan Kim",
      location: "Bethesda, MD",
      initials: "JK",
      avatarColor: "blue",
      description: "You want portrait photography and Maya offers Spanish (Expert). They want GuitarJordan offers portrait photography and wants help with JavaScript.",
      status: "Matched",
      time: "5 days ago",
    },
  ];

  

  const incomingRequests = [
    {
      id: "3",
      name: "Priya Desai",
      location: "College Park, MD",
      initials: "PD",
      avatarColor: "purple",
      description: "Priya liked your profile. They want React help and offer Figma design lessons.",
      status: "New request",
      time: "3 hours ago",
    },
  ];

  const sentRequests = [
    {
      id: "4",
      name: "Rashid Williams",
      location: "Hyattsville, MD",
      initials: "RW",
      avatarColor: "gold",
      description: "You liked Rashid's profile. Waiting for them to like you back.",
      status: "Pending",
      time: "1 day ago",
    },
  ];

  const [matches, setMatches] = useState({current_matches: [], incoming_pending: [], outgoing_pending: []})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadMatches() {
      setLoading(true)
      try {
        const myMatches = await apiGetMyMatches()
        console.log(myMatches)
        setMatches(myMatches)
      }

      catch (err) {

      }

      finally{
        setLoading(false)
      }
    }

    loadMatches()
  }, [])

  if (loading)
    return <p>loading...</p>

  return (
    <div className="matches-page">
      <main className="matches-container">
        <section className="matches-hero">
          <div>
            
            <h1>
              Your <span>matches</span>
            </h1>

            <p className="matches-intro">
              See your matches, pending requests, and who wants to connect with you.
            </p>
          </div>

          <div className="matches-summary-card">
            <h2>3</h2>
            <p>active match updates</p>
          </div>
        </section>

        <MatchSection
          title="Current"
          accent="matches"
          countText={`${matches.current_matches.length} active`}
          matches={matches.current_matches}
          type="matched"
        />

        <MatchSection
          title="Incoming"
          accent="requests"
          countText={`${matches.incoming_pending.length} waiting on you`}
          matches={matches.incoming_pending}
          type="incoming"
        />

        <MatchSection
          title="Sent"
          accent="requests"
          countText={`${matches.outgoing_pending.length} awaiting response`}
          matches={matches.outgoing_pending}
          type="sent"
        />
      </main>
    </div>
  );
}

export default MatchesPage;