function ReviewCard({ review }) {
  return (
    <div className="review-card">
      <div className="review-card-header">
        <div className="reviewer-avatar">
          {review.reviewer_name[0]}
        </div>

        <div>
          <h4>{review.reviewer_name}</h4>
          <p>{review.created_at}</p>
        </div>
      </div>

      <div className="review-stars">
        {"★".repeat(review.rating)}
        {"☆".repeat(5 - review.rating)}
      </div>

      <p className="review-comment">{review.comment}</p>
    </div>
  );
}

export default ReviewCard;