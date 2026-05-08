// Displays avatar, name, location, top 3 skills, and like count

import SkillBadge from './SkillBadge'
import { useNavigate } from 'react-router-dom'


export default function SkillCard({ user }) {

  // gets initials from name e.g. "David Bowie" -> "DB"
  // it basically breaks the arrays up into two, so like David and Bowie then
  // grabs the first index and joins the two together into one string and we get
  // DB
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase()
  const navigate = useNavigate()
  return (
    <div className="skill-card" onClick={() => navigate(`/profile/${user._id}`)}>

      {/* shows initials if no image url. it uses a conditional operator to evaluate if
          the user has a image.  */}
      <div className="skill-card-avatar">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.name} />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* name of our user */}
      <h2 className="skill-card-name">{user.name}</h2>

      {/* location of our user */}
      <p className="skill-card-location">{user.location}</p>

      {/* Top 3 skills */}
      <div className="skill-card-badges">
        {/* this grabs the first 3 skills from the users skill bank and
            maps each one into a Skill Badge component with i as the index
            which is used as a key. */}
        {(user.skills_offered || []).slice(0, 3).map((skill, i) => (
          <SkillBadge key={i} skill={skill.name} level={skill.proficiency} />
        ))} 

      </div>

      {/* this is the like count of our user.*/}
      <p className="skill-card-likes">♥ {user.like_count} likes</p>

    </div>
  )
}
