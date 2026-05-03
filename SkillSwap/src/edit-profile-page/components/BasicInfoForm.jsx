function BasicInfoForm({ formData, updateBasicInfo }) {
  return (
    <section className="edit-card">
      <h2>Basic info</h2>

      <div className="basic-info-grid">
        <div className="input-group">
          <label>Display name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(event) =>
              updateBasicInfo("name", event.target.value)
            }
          />
        </div>

        <div className="input-group">
          <label>Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(event) =>
              updateBasicInfo("location", event.target.value)
            }
          />
        </div>
      </div>

      <div className="input-group">
        <label>Bio</label>
        <textarea
          value={formData.bio}
          onChange={(event) =>
            updateBasicInfo("bio", event.target.value)
          }
        />
      </div>

      <div className="input-group">
        <label>Avatar URL (optional)</label>
        <input
          type="text"
          placeholder="Paste image URL or leave blank"
          value={formData.avatar_url}
          onChange={(event) =>
            updateBasicInfo("avatar_url", event.target.value)
          }
        />
      </div>
    </section>
  );
}

export default BasicInfoForm;