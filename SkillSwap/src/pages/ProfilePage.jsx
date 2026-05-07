import ProfileHeader from "../profile-page/components/ProfileHeader";
import SkillList from "../profile-page/components/SkillList";
import ReviewCard from "../profile-page/components/ReviewCard";
import ReviewForm from "../profile-page/components/ReviewForm";
import "../profile-page/style.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGetMe, apiGetReviews, apiGetUser } from "../api/api.jsx";

function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // when auth exists so this -
  // const isOwnProfile = currentUser?.id === profile.id;
  // const isOwnProfile = isSelf(user_id)
  // const isOwnProfile = false;



  async function loadProfile() {
    setLoading(true);

    try {
      const user = id ? await apiGetUser(id) : await apiGetMe();
      setProfile(user);

      try {
        const reviewData = await apiGetReviews(user._id);
        setReviews(reviewData.reviews || []);
      } catch {
        setReviews([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [id]);

  if (loading) {
    return <p className="profile-page">Loading profile...</p>;
  }

  if (!profile || profile.error) {
    return <p className="profile-page">Profile not found.</p>;
  }

  return (
    <div className="profile-page">
      <main className="profile-layout">
        <aside className="profile-sidebar">
          <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />

          <div className="contact-card">
            <h3>CONTACT INFO</h3>

            <div className="contact-row">
              <span>Email</span>
              <p>{profile.email}</p>
            </div>

            {profile.contact?.show_phone && profile.contact?.phone && (
              <div className="contact-row">
                <span>Phone</span>
                <p>{profile.contact.phone}</p>
              </div>
            )}
          </div>
        </aside>

        <section className="profile-content">
          <SkillList
            skillsOffered={profile.skills_offered || []}
            skillsWanted={profile.skills_wanted || []}
          />

          <section className="reviews-section">
            <h2>Reviews</h2>
            {!isOwnProfile && (
              <ReviewForm
                targetUserId={profile._id}
                onReviewSaved={loadProfile}
              />
            )}

            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              reviews.map((review) => (
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
