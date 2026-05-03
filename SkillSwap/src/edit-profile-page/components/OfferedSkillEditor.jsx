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
        <div className="offered-skill-row" key={index}>
          <input
            type="text"
            value={skill.name}
            placeholder="Skill name"
            onChange={(event) =>
              updateOfferedSkill(index, "name", event.target.value)
            }
          />

          <input
            type="text"
            value={skill.category}
            placeholder="Category"
            onChange={(event) =>
              updateOfferedSkill(index, "category", event.target.value)
            }
          />

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