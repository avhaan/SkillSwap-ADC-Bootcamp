import LikeButton from "./LikeButton";

function ProfileHeader({ profile }) {
  const contact = profile.contact;

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
        <p>{profile.location}</p>
        <p>{profile.bio}</p>

        <div className="profile-contact">
          {contact.show_email && <p>Email: {profile.email}</p>}
          {contact.show_phone && <p>Phone: {contact.phone}</p>}
        </div>

        <LikeButton initialLikes={profile.like_count} />
      </div>
    </div>
  );
}

export default ProfileHeader;