function SkillList({ skillsOffered, skillsWanted }) {
  return (
    <div className="skill-list-section">

      <div className="skills-box">
        <h2>Skills Offered</h2>

        {skillsOffered.length === 0 ? (
          // checking edge cases
          <p>No skills offered yet.</p>
        ) : (
          skillsOffered.map((skill, index) => (
            <div key={index} className="single-skill-card">
              <div className="skill-title-row">
                <h3>{skill.name}</h3>
                <span className="skill-level">{skill.proficiency}</span>
              </div>

              <p className="skill-category">{skill.category}</p>
              <p className="skill-description">{skill.description}</p>
            </div>
          ))
        )}
      </div>

      <div className="skills-box">
        <h2>Skills Wanted</h2>

        {skillsWanted.length === 0 ? (
          <p>No skills wanted yet.</p>
        ) : (
          skillsWanted.map((skill, index) => (
            <div key={index} className="wanted-skill-pill">
              <h3>{skill.name}</h3>

              // not showing skill category based on figma right now
              // <p>{skill.category}</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default SkillList;