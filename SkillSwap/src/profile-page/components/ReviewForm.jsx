import { useState } from "react";
// import { apiCreateReview } from "../../api/api";

// function ReviewForm({user_id}) {
import { apiCreateReview } from "../../api/api.jsx";

function ReviewForm({ targetUserId, onReviewSaved }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    // need to insert api here instead of this later
    // this just prints the review to console
    // console.log("Rating:", rating);
    // console.log("Comment:", comment);

    // creates a review
    // await apiCreateReview(user_id, rating, comment)

    if (!rating) {
      setError("Choose a star rating first.");
      return;
    }

    if (!comment.trim()) {
      setError("Write a review before submitting.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await apiCreateReview(targetUserId, rating, comment);
      setRating(0);
      setComment("");
      onReviewSaved?.();
    } catch (err) {
      setError(err.message || "Could not save review.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Leave a Review</h3>

      <div className="star-picker">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}

            // this checks in the loop, how many stars are selected
            // and then classify them as selected or not, to color them in style.css
            className={star <= rating ? "star selected" : "star"}
            onClick={() => setRating(star)}
          > ★
          </button>
        ))}
      </div>

      <textarea
        placeholder="Write your review..."
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="review-submit" disabled={saving}>
        {saving ? "Saving..." : "Submit Review"}
      </button>
    </form>
  );
}

export default ReviewForm;
