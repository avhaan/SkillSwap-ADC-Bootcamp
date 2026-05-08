import LikeButton from "./LikeButton";
import ContactButton from "./ContactButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProfileHeader({ profile, isOwnProfile, user_id }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const initials = profile.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="profile-header">

      <div className="profile-avatar">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.name} />
        ) : (
          <span>{initials}</span>
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
              <ContactButton email={profile.email} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
