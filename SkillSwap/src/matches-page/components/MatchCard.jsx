import { useNavigate } from "react-router-dom";
import { apiAcceptMatch, apiDeclineMatch, apiGetMe } from "../../api/api";
import MatchStatusBadge from "./MatchStatusBadge";
import { useEffect, useState } from "react";

function MatchCard({ match, type }) {
  const navigate = useNavigate()
  const [me, setMe] = useState(getMe())
const [requester, setRequester] = useState(false)
  

  async function getMe() {
      const myProfile = await apiGetMe()
      // setMe(myProfile)
      // console.log(myProfile)
    }

    useEffect(() => {
      setRequester(me.name === match.requester_name)
    }, [])


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

  async function accept() {
    await apiAcceptMatch(match._id)
    window.location.reload()
  }

  async function decline () {
    await apiDeclineMatch(match._id)
    window.location.reload()
  }

  return (
    <article className={`match-card ${type === "incoming" ? "incoming-card" : ""}`}>
      <div className="match-card-top">
        <div className={getAvatarClass()}>
          {match.initials}
        </div>

        <div className="match-person-info">
          <h3>{requester ? match.requester_name : match.receiver_name }</h3>
          <p>{match.location}</p>
        </div>
      </div>

      <div className="match-reason">
        <p>{match.description}</p>
      </div>

      <div className="match-actions">
        {type === "matched" && (
          <>
            <button type="button" className="primary-match-button" onClick={() => navigate(`/profile/${match.receiver_id}`)}>
              Open profile
            </button>

            <button type="button" className="secondary-match-button">
              Contact
            </button>
          </>
        )}

        {type === "incoming" && (
          <>
            <button type="button" className="accept-button" onClick={accept}> 
              Accept
            </button>

            <button type="button" className="secondary-match-button" onClick={decline}>
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