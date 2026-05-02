import { useState } from "react";

function LikeButton({ initialLikes }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  function handleLikeClick() {
    if (liked) {
      setLiked(false);
      setLikes(likes - 1);
    } else {
      setLiked(true);
      setLikes(likes + 1);
    }
  }

  return (
    <button className={liked ? "like-button clicked" : "like-button"} onClick={handleLikeClick}>
      {liked ? "♥" : "♡"} {likes} Likes
    </button>
  );
}

export default LikeButton;