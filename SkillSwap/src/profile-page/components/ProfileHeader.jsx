import LikeButton from "./LikeButton";
import ContactButton from "./ContactButton";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiCancelOrUnmatch, apiSendMatchRequest } from "../../api/api";

function ProfileHeader({ profile, isOwnProfile, loggedIn, matchStatus, onMatchStatusChange }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const initials = (profile.name || "User")
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  async function handleMatchRequest() {
    if (matchStatus === "matched" || matchStatus === "pending_sent") {
      const data = await apiCancelOrUnmatch(profile._id);

      if (!data.error) {
        onMatchStatusChange("none");
      }
      return;
    }

    const data = await apiSendMatchRequest(profile._id);

    if (!data.error) {
      onMatchStatusChange("pending_sent");
    }
  }

  function getMatchButtonText() {
    if (matchStatus === "pending_sent") {
      return "Cancel Request";
    }

    if (matchStatus === "pending_received") {
      return "They Requested You";
    }

    if (matchStatus === "matched") {
      return "Unmatch";
    }

    return "Send Match Request";
  }

  const matchButtonDisabled = matchStatus === "pending_received";

  return (
    <div className="profile-header">
      <div className="profile-avatar">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.name} />
        ) : (
          <span className="profile-initials">{initials}</span>
        )}
      </div>

      <div className="profile-info">
        <h1>{profile.name}</h1>
        <p>{profile.location ? profile.location : "Location Not Found"}</p>
        <p className="profile-bio">{profile.bio ? profile.bio : "Bio Not Found"}</p>

        <div className={isOwnProfile ? "profile-action-buttons profile-own-actions" : "profile-action-buttons"}>
          {isOwnProfile ? (
            <>
              <a href="/profile/me/edit" className="edit-profile-button">
                Edit Profile
              </a>

              <button type="button" className="profile-logout-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <LikeButton initialLikes={profile.like_count} user_id={profile._id} />
              {matchStatus === "matched" && <ContactButton email={profile.email} />}
            </>
          )}
        </div>

        {!isOwnProfile && loggedIn && (
          <button
            type="button"
            className="match-request-button"
            disabled={matchButtonDisabled}
            onClick={handleMatchRequest}
          >
            {getMatchButtonText()}
          </button>
        )}

        {!isOwnProfile && !loggedIn && (
          <Link to="/login" className="match-login-link">
            Log in to send a match request
          </Link>
        )}
      </div>
    </div>
  );
}

export default ProfileHeader;
