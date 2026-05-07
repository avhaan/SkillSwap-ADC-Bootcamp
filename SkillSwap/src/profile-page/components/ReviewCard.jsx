function ReviewCard({ review }) {
  const filledStar = String.fromCharCode(9733);
  const emptyStar = String.fromCharCode(9734);

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
        {filledStar.repeat(review.rating)}
        {emptyStar.repeat(5 - review.rating)}
      </div>

      <p className="review-comment">{review.comment}</p>
    </div>
  );
}

export default ReviewCard;
