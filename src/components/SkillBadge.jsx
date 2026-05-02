import './SkillBadge.css'

export default function SkillBadge({skill, level}) {
    return(
        <span className={`skill-badge ${level.toLowerCase()}`}>
            {/* this className line allows us to access specific css styling based
                on the users skill level. */}
            {skill} · {level}
        </span>
    )
}