import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGetMe, apiGetReviews, apiGetUser } from "../api/api";
import ProfileHeader from "../profile-page/components/ProfileHeader";
import SkillList from "../profile-page/components/SkillList";
import ReviewCard from "../profile-page/components/ReviewCard";
import ReviewForm from "../profile-page/components/ReviewForm";
import "../profile-page/style.css";

const emptyReviews = { reviews: [], average_rating: null, total: 0 };

function ProfilePage() {
  const { user_id } = useParams();
  const isMeRoute = !user_id || user_id === "me";

  const [user, setUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState(emptyReviews);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  async function refreshReviews(targetUserId) {
    const revs = await apiGetReviews(targetUserId);
    setReviews(revs);
  }

  useEffect(() => {
    async function loadProfile() {
      await Promise.resolve();

      setLoading(true);
      setShowReviewForm(false);
      setReviews(emptyReviews);

      try {
        if (isMeRoute) {
          if (!localStorage.getItem("token")) {
            setUser(null);
            setIsOwnProfile(false);
            setLoggedIn(false);
            return;
          }

          const me = await apiGetMe();
          setUser(me);
          setIsOwnProfile(true);
          setLoggedIn(true);
          await refreshReviews(me._id);
          return;
        }

        const profile = await apiGetUser(user_id);
        if (!profile?._id) {
          throw new Error("User not found");
        }

        setUser(profile);
        setIsOwnProfile(false);
        setLoggedIn(false);

        if (localStorage.getItem("token")) {
          try {
            const me = await apiGetMe();
            setIsOwnProfile(me?._id === profile._id);
            setLoggedIn(Boolean(me));
          } catch {
            setIsOwnProfile(false);
            setLoggedIn(false);
          }
        }
        
        const revs = await apiGetReviews(user_id)
        setReviews(revs) 
      }
      catch (err) {
        console.error(err);
        setUser(null);
        setIsOwnProfile(false);
        setLoggedIn(false);
        setReviews(emptyReviews);
      } 
      finally {
        setLoading(false);
      }
    }
      loadProfile();
    } , [isMeRoute, user_id])

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
      <div className="profile-page">
        <main className="profile-layout profile-message-layout">
          <section className="profile-message">
            <p>{isMeRoute ? "Log in to view your profile." : "User does not exist."}</p>
            {isMeRoute && (
              <Link className="add-review-button" to="/login">
                Log in
              </Link>
            )}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <main className="profile-layout">
        <aside className="profile-sidebar">
          <ProfileHeader profile={user} isOwnProfile={isOwnProfile}/>

          <div className="contact-card">
            <h3>CONTACT INFO</h3>

            <div className="contact-row">
              <span>Email</span>
              <p>{user.email}</p>
            </div>

            <div className="contact-row">
              <span>Phone</span>
              <p>{user.contact?.phone ? user.contact.phone : "Unknown"}</p>
            </div>
          </div>
        </aside>

        <section className="profile-content">
          <SkillList
            skillsOffered={user.skills_offered}
            skillsWanted={user.skills_wanted}
          />

          <section className="reviews-section">
            <div className="reviews-header">
              <h2>Reviews</h2>

              {!isOwnProfile && loggedIn && !showReviewForm && (
                <button
                  type="button"
                  className="add-review-button"
                  onClick={() => setShowReviewForm(true)}
                >
                  Add review
                </button>
              )}

              {!isOwnProfile && !loggedIn && (
                <Link className="add-review-button" to="/login">
                  Log in to review
                </Link>
              )}
            </div>

            {!isOwnProfile && loggedIn && showReviewForm && (
              <ReviewForm
                targetUserId={user._id}
                onReviewSaved={() => {
                  setShowReviewForm(false);
                  refreshReviews(user._id);
                }}
              />
            )}

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
