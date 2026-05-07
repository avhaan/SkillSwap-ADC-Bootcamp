import { useState, useEffect } from "react";
import "../edit-profile-page/style.css";
import BasicInfoForm from "../edit-profile-page/components/BasicInfoForm";
import OfferedSkillEditor from "../edit-profile-page/components/OfferedSkillEditor";
import WantedSkillEditor from "../edit-profile-page/components/WantedSkillEditor";
import { apiGetMe, apiUpdateProfile } from "../api/api";
import { useNavigate } from "react-router-dom";


function EditProfilePage() {
  /*
  const [formData, setFormData] = useState({
    name: "Maya Ramirez",
    location: "College Park, MD",
    bio: "Linguist by training, guitarist by accident.",
    avatar_url: "",
    skills_offered: [
      {
        name: "Spanish",
        category: "Language & Writing",
        proficiency: "Expert",
      },
      {
        name: "Acoustic Guitar",
        category: "Music & Arts",
        proficiency: "Intermediate",
      },
      {
        name: "Knitting",
        category: "Trades & DIY",
        proficiency: "Beginner",
      },
    ],
    skills_wanted: ["React / JavaScript", "Photography", "French"],
  }); 
  */

  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(true)

  // creates a state variable for the little pill boxes under “Skills wanted”
  const [wantedInput, setWantedInput] = useState("");

  const navigate = useNavigate()

  useEffect(() => {
      async function loadProfile() {
        try {
          const me = await apiGetMe()
          setFormData(me)
        }
  
        catch (err) {
  
        }
  
        finally {
          setLoading(false)
        }
      }

      loadProfile()
    }, [])

    // makes the loading screen
  if (loading) {
    return (
      <p>Loading...</p>
    )
  }



  // this basically means only change the field I ask you to
  // without changing the rest of the form 
  function updateBasicInfo(field, value) {
    setFormData({
      ...formData,
      [field]: value,
    });
  }

  function updateOfferedSkill(index, field, value) {
    const updatedSkills = [...formData.skills_offered];

    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      skills_offered: updatedSkills,
    });
  }

  function addOfferedSkill() {
    setFormData({
      ...formData,
      skills_offered: [
        ...formData.skills_offered,
        {
          name: "",
          category: "",
          proficiency: "Beginner",
        },
      ],
    });
  }

  function removeOfferedSkill(index) {
    const updatedSkills = formData.skills_offered.filter((skill, i) => i !== index);

    setFormData({
      ...formData,
      skills_offered: updatedSkills,
    });
  }

  function addWantedSkill(event) {
    if (event.key === "Enter" && wantedInput.trim() !== "") {

      // we don't want the page to reload  
      event.preventDefault();

      setFormData({
        ...formData,
        skills_wanted: [...formData.skills_wanted, wantedInput.trim()],
      });

      setWantedInput("");
    }
  }

  function removeWantedSkill(index) {
    const updatedWantedSkills = formData.skills_wanted.filter((skill, i) => i !== index);

    setFormData({
      ...formData,
      skills_wanted: updatedWantedSkills,
    });
  }

  async function handleSave(event) {
    event.preventDefault();

    // place holder right now
    // later we need to add it to the database
    // console.log("Saved profile:", formData);

    try {
      await apiUpdateProfile(formData)
    }

    catch (err) {

    }
    
    navigate("/profile/me")
  }

  function handleCancel() {
    window.location.href = "/profile/me";
  }

  return (
    <div className="edit-profile-page">
      <main className="edit-profile-container">
        <div className="edit-profile-title">
          <h1>
            Edit your<span> profile</span>
          </h1>
          <p>Tell people who you are and what you can teach.</p>
        </div>

        <form onSubmit={handleSave}>
          <BasicInfoForm
            formData={formData}
            updateBasicInfo={updateBasicInfo}
          />

          <OfferedSkillEditor
            skillsOffered={formData.skills_offered}
            updateOfferedSkill={updateOfferedSkill}
            addOfferedSkill={addOfferedSkill}
            removeOfferedSkill={removeOfferedSkill}
          />

          <WantedSkillEditor
            skillsWanted={formData.skills_wanted}
            wantedInput={wantedInput}
            setWantedInput={setWantedInput}
            addWantedSkill={addWantedSkill}
            removeWantedSkill={removeWantedSkill}
          />

          <div className="edit-profile-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button type="submit" className="save-button">
              Save profile
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default EditProfilePage;