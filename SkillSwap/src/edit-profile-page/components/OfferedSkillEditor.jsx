function OfferedSkillEditor({
  // we are using props destructuring to just make it shorter
  skillsOffered,
  updateOfferedSkill,
  addOfferedSkill,
  removeOfferedSkill,
}) {
  return (
    <section className="edit-card">
      <h2>Skills offered</h2>

      {skillsOffered.map((skill, index) => (
        <div className="offered-skill-block" key={index}>
          <div className="offered-skill-row">
            <input
              type="text"
              value={skill.name}
              placeholder="Skill name"
              onChange={(event) =>
                updateOfferedSkill(index, "name", event.target.value)
              }
            />

            <select
              value={skill.category}
              onChange={(event) =>
                updateOfferedSkill(index, "category", event.target.value)
              }
            >
              <option value="">Select category</option>
              <option value="Technology & Programming">
                Technology & Programming
              </option>
              <option value="Design & Creative">Design & Creative</option>
              <option value="Music & Arts">Music & Arts</option>
              <option value="Language & Writing">Language & Writing</option>
              <option value="Cooking & Food">Cooking & Food</option>
              <option value="Fitness & Sports">Fitness & Sports</option>
              <option value="Academic Tutoring">Academic Tutoring</option>
              <option value="Trades & DIY">Trades & DIY</option>
              <option value="Business & Finance">Business & Finance</option>
              <option value="Photography & Video">Photography & Video</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={skill.proficiency}
              onChange={(event) =>
                updateOfferedSkill(index, "proficiency", event.target.value)
              }
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Expert</option>
            </select>

            <button
              type="button"
              className="remove-skill-button"
              onClick={() => removeOfferedSkill(index)}
            >
              ×
            </button>
          </div>

          <textarea
            className="offered-skill-description"
            value={skill.description || ""}
            placeholder="Describe what you can help with..."
            onChange={(event) =>
              updateOfferedSkill(index, "description", event.target.value)
            }
          />
        </div>
      ))}

      <button
        type="button"
        className="add-skill-button"
        onClick={addOfferedSkill}
      >
        + Add another skill
      </button>
    </section>
  );
}

export default OfferedSkillEditor;