import ProfileHeader from "../profile-page/components/ProfileHeader";
import SkillList from "../profile-page/components/SkillList";
import ReviewCard from "../profile-page/components/ReviewCard";
import ReviewForm from "../profile-page/components/ReviewForm";
import LikeButton from "../profile-page/components/LikeButton";
import "../profile-page/style.css";
import { useParams } from "react-router-dom";
import { apiGetMe, apiGetReviews, apiGetUser } from "../api/api";
import { useEffect, useState } from "react";

function ProfilePage() {
  // gets the user_id from the url
  const { user_id } = useParams();

  const [user, setUser] = useState(null)
  const [isOwnProfile, setIsOwnProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)


  useEffect(() => {
    async function loadProfile() {
    try {
      // checks if using profile/me
      if (user_id === "me") {
        const me = await apiGetMe()
        setUser(me)
        setIsOwnProfile(true)

        const revs = await apiGetReviews(me._id)
        setReviews(revs) 
      }

      // using profile/{user_id}
      else {
        const profile = await apiGetUser(user_id)
        setUser(profile)

        // checks if a user is logged in
        if (localStorage.getItem("token") !== null) {
          const me = await apiGetMe()
          setIsOwnProfile(me?._id === user_id)
          setLoggedIn(true)
        }
        

        const revs = await apiGetReviews(user_id)
        setReviews(revs) 
      }
      
      
    }

    catch (err) {

    }

    finally {
      setLoading(false)
    }
  }
    loadProfile()
  }, [])

  // displays loading when the api calls are loading
  if (loading) {
    return (
    <p>Loading...</p>
    )
  }


  if (!user) {
    return (
    <p>User does not exist</p>
    )
  }



  

  // when auth exists so this - 
  

  // const isOwnProfile = currentUser?.id === profile.id;
  // const isOwnProfile = isSelf(user_id)
  // const isOwnProfile = false;



  const mockProfile = {

    id: "ut101",
    name: "Maya Ramirez",
    avatar_url: "",
    location: "College Park, MD",
    email: "maya.r@umd.edu",

    bio: "Linguist by training, guitarist by accident. Always trading languages for new music.",
    like_count: 24,
   
    contact: {
      display_email: true,
      phone: "(301) 555-0142",
      display_phone: true
    },

    skills_offered: [
      {
        name: "Spanish (conversational + written)",
        category: "Language & Writing",
        proficiency: "Expert",
        description: "Native speaker, 6 years tutoring undergrads. Comfortable with grammar drills, conversation, or DELE prep."
      },
      {
        name: "Acoustic Guitar",
        category: "Music & Arts",
        proficiency: "Intermediate",
        description: "Self-taught for 8 years. Can teach chords, basic fingerstyle, and how to play along to songs."
      },
      {
        name: "Knitting",
        category: "Trades & DIY",
        proficiency: "Beginner",
        description: "Learning alongside you — happy to swap a beginner-level lesson if you want a casual study buddy."
      }
    ],

    skills_wanted: [
      {
        name: "React/ JavaScript",
        category: "Technology & Programming"
      },
      {
        name: "Photography Basics",
        category: "Photography & Video"
      },
      {
        name: "French",
        category: "Language & Writing"
      }
    ]

  };

  const mockReviews = [
    {
      id: "r1",
      reviewer_name: "Jamie Chen",
      rating: 5,
      comment: "Maya explained Python in a very simple and practical way. Super helpful!",
      created_at: "2026-04-20"
    },
    {
      id: "r2",
      reviewer_name: "Morgan Lee",
      rating: 4,
      comment: "Great teacher and very patient during the knitting session.",
      created_at: "2026-04-22"
    }
  ];

  return (
    <div className="profile-page">

      <main className="profile-layout">
        <aside className="profile-sidebar">
          <ProfileHeader profile={user} isOwnProfile={isOwnProfile} />

          <div className="contact-card">
            <h3>CONTACT INFO</h3>

            <div className="contact-row">
              <span>Email</span>
              <p>{user.email}</p>
            </div>

            <div className="contact-row">
              <span>Phone</span>
              <p>{(user.contact && user.contact.phone) ? user.contact.phone : "Unknown"}</p>
            </div>
          </div>
        </aside>

        <section className="profile-content">
          <SkillList
            skillsOffered={user.skills_offered}
            skillsWanted={user.skills_wanted}
          />

          <section className="reviews-section">
            <h2>Reviews</h2>
            {!isOwnProfile && loggedIn && <ReviewForm user_id={user_id}/>}

            {reviews.reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              reviews.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </section>
        </section>
        
      </main>
    </div>
  );
}

export default ProfilePage;