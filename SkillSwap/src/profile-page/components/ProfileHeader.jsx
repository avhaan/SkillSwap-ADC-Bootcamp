import LikeButton from "./LikeButton";
import ContactButton from "./ContactButton";

function ProfileHeader({ profile, isOwnProfile }) {

  return (
    <div className="profile-header">

      <div className="profile-avatar">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.name} />
        ) : (
          <span>
            {profile.name.split(" ")
              .map((word) => word[0])
              .join("")}
          </span>
        )}
      </div>

      <div className="profile-info">

        <h1>{profile.name}</h1>
        <p>{profile.location ? profile.location : "Location Not Found"}</p>
        <p className="profile-bio">{profile.bio ? profile.bio : "Bio Not Found"}</p>

        <div className="profile-action-buttons">
          {isOwnProfile ? (
            <a href="/profile/me/edit" className="edit-profile-button">
              Edit Profile
            </a>
          ) : (
            <>
              <LikeButton initialLikes={profile.like_count} />
              <ContactButton email={profile.email} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;