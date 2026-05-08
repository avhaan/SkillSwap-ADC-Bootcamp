function SkillList({ skillsOffered, skillsWanted }) {
  const cleanSkillsOffered = (skillsOffered || []).filter((skill) => {
    return skill && typeof skill.name === "string" && skill.name.trim();
  });

  const cleanSkillsWanted = (skillsWanted || [])
    .map((skill) => {
      if (typeof skill === "string") {
        return skill.trim();
      }

      return skill?.name || skill?.skill || skill?.title || "";
    })
    .filter((skillName) => skillName && skillName.trim());

  return (
    <div className="skill-list-section">

      <div className="skills-box">
        <h2>Skills <span>Offered</span></h2>

        {cleanSkillsOffered.length === 0 ? (
          // checking edge cases
          <p>No skills offered yet.</p>
        ) : (
          cleanSkillsOffered.map((skill, index) => (
            <div key={index} className="single-skill-card">
              <div className="skill-title-row">
                <h3>{skill.name.trim()}</h3>
                <span className={`skill-level ${(skill.proficiency || "Beginner").toLowerCase()}`}>
                  • {skill.proficiency || "Beginner"}
                </span>
              </div>

              <p className="skill-category">{skill.category || "Other"}</p>

              {typeof skill.description === "string" && skill.description.trim() && (
                <p className="skill-description">{skill.description.trim()}</p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="skills-box">
        <h2>Skills <span>Wanted</span></h2>

        {cleanSkillsWanted.length === 0 ? (
          <p>No skills wanted yet.</p>
        ) : (
          cleanSkillsWanted.map((skill, index) => (
            <div key={index} className="wanted-skill-pill">
              <h3>{skill}</h3>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default SkillList;
