import ProfileHeader from "../components/ProfileHeader";
import SkillList from "../components/SkillList";
import ReviewCard from "../components/ReviewCard";
import ReviewForm from "../components/ReviewForm";

function ProfilePage() {

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
    <div>
      <ProfileHeader profile={mockProfile} />
      <SkillList
        skillsOffered={mockProfile.skills_offered}
        skillsWanted={mockProfile.skills_wanted}
      />

      <h2>Reviews</h2>

      <ReviewForm />

      {mockReviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

export default ProfilePage;