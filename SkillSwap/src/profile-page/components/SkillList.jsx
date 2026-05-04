function SkillList({ skillsOffered, skillsWanted }) {
  return (
    <div className="skill-list-section">

      <div className="skills-box">
        <h2>Skills <span>Offered</span></h2>

        {skillsOffered.length === 0 ? (
          // checking edge cases
          <p>No skills offered yet.</p>
        ) : (
          skillsOffered.map((skill, index) => (
            <div key={index} className="single-skill-card">
              <div className="skill-title-row">
                <h3>{skill.name}</h3>
                <span className={`skill-level ${skill.proficiency.toLowerCase()}`}>
                 •  {skill.proficiency}
                </span>
              </div>

              <p className="skill-category">{skill.category}</p>
              <p className="skill-description">{skill.description}</p>
            </div>
          ))
        )}
      </div>

      <div className="skills-box">
        <h2>Skills <span>Wanted</span></h2>

        {skillsWanted.length === 0 ? (
          <p>No skills wanted yet.</p>
        ) : (
          skillsWanted.map((skill, index) => (
            <div key={index} className="wanted-skill-pill">
              <h3>{skill.name}</h3>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default SkillList;