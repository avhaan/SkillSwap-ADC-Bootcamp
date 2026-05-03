function WantedSkillEditor({
  skillsWanted,
  wantedInput,
  setWantedInput,
  addWantedSkill,
  removeWantedSkill,
}) {
  return (
    <section className="edit-card">
      <h2>Skills wanted</h2>

      <div className="wanted-skill-list">
        {skillsWanted.map((skill, index) => (
          <div className="wanted-skill-tag" key={index}>
            <span>{skill}</span>

            <button
              type="button"
              className="wanted-skill-remove"
              onClick={() => removeWantedSkill(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <input
        className="wanted-input"
        type="text"
        placeholder="Type a skill and press Enter to add"
        value={wantedInput}
        onChange={(event) => setWantedInput(event.target.value)}
        onKeyDown={addWantedSkill}
      />
    </section>
  );
}

export default WantedSkillEditor;