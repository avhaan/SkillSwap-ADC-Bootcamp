// Displays avatar, name, location, top 3 skills, like count, and rating

import SkillBadge from "./SkillBadge";
import { useNavigate } from "react-router-dom";

const avatarColors = [
  "avatar-orange",
  "avatar-blue",
  "avatar-green",
  "avatar-purple",
  "avatar-gold",
  "avatar-pink",
];

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function getAvatarColor(name) {
  const index = name.length % avatarColors.length;
  return avatarColors[index];
}

export default function SkillCard({ user }) {
  const navigate = useNavigate();

  const initials = getInitials(user.name);
  const avatarColor = getAvatarColor(user.name);

  return (
    <div className="skill-card" onClick={() => navigate(`/profile/${user._id}`)}>
      <div className="skill-card-top">
        <div className={`skill-card-avatar ${avatarColor}`}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className="skill-card-user-info">
          <h2 className="skill-card-name">{user.name}</h2>
          <p className="skill-card-location">{user.location}</p>
        </div>
      </div>

      <div className="skill-card-badges">
        {(user.skills_offered || []).slice(0, 3).map((skill, i) => (
          <SkillBadge key={i} skill={skill.name} level={skill.proficiency} />
        ))}
      </div>

      <div className="skill-card-divider"></div>

      <div className="skill-card-footer">
        <p className="skill-card-likes">♥ {user.like_count} likes</p>

        {user.rating && (
          <p className="skill-card-rating">★ {user.rating}</p>
        )}
      </div>
    </div>
  );
}