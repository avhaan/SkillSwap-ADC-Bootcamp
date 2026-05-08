export default function SkillBadge({skill, level}) {
    const safeSkill = skill || "Skill";
    const safeLevel = level || "Beginner";

    return(
        <span className={`skill-badge ${safeLevel.toLowerCase()}`}>
            {/* this className line allows us to access specific css styling based
                on the users skill level. */}
            {safeSkill} · {safeLevel}
        </span>
    )
}
