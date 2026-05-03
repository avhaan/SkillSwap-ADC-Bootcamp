import ProfileHeader from "../profile-page/components/ProfileHeader";
import SkillList from "../profile-page/components/SkillList";
import ReviewCard from "../profile-page/components/ReviewCard";
import ReviewForm from "../profile-page/components/ReviewForm";
import LikeButton from "../profile-page/components/LikeButton";
import "../profile-page/style.css";

function ProfilePage() {

  // when auth exists so this - 
  // const isOwnProfile = currentUser?.id === profile.id;
  const isOwnProfile = false;

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
          <ProfileHeader profile={mockProfile} isOwnProfile={isOwnProfile} />

          <div className="contact-card">
            <h3>CONTACT INFO</h3>

            <div className="contact-row">
              <span>Email</span>
              <p>{mockProfile.email}</p>
            </div>

            <div className="contact-row">
              <span>Phone</span>
              <p>{mockProfile.contact.phone}</p>
            </div>
          </div>
        </aside>

        <section className="profile-content">
          <SkillList
            skillsOffered={mockProfile.skills_offered}
            skillsWanted={mockProfile.skills_wanted}
          />

          <section className="reviews-section">
            <h2>Reviews</h2>
            {!isOwnProfile && <ReviewForm />}

            {mockReviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              mockReviews.map((review) => (
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