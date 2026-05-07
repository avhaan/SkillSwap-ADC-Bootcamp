import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; 
import { useNavigate } from "react-router-dom";
import { apiGetLikeStatus, apiToggleLike } from "../../api/api";

function LikeButton({ initialLikes, user_id }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  const {isUserLoggedIn} = useAuth()
  const navigate = useNavigate()


  useEffect(
    () => {
      async function loadButton() {
        if (localStorage.getItem("token") !== null) {
          try {
            const userLiked = await apiGetLikeStatus(user_id)

            setLiked(userLiked.liked)
          }

          catch (err) {

          }
          
        }
      }

      loadButton()

      }, []
  )

  async function handleLikeClick() {
    try {
      await apiToggleLike(user_id)
      const userLiked = await apiGetLikeStatus(user_id)

    }
 
    catch (err) {

    }

    if (liked) {
      setLiked(false);
      setLikes(likes - 1);
    } else {
      setLiked(true);
      setLikes(likes + 1);
    }

    
      


  }

  return (
    // checks if a user is logged in
    // if yes, call the handle click function
    localStorage.getItem("token") !== null ? (
      <button className={liked ? "like-button clicked" : "like-button"} onClick={handleLikeClick}>
      {liked ? "♥" : "♡ "} {likes} Likes
      </button>
    )
    :
    // if not logged in, display the like button like normal, but make the button redirect to login page
      <button className={liked ? "like-button clicked" : "like-button"} onClick={() => navigate("/login")}>
      {`♡ ${likes} Likes`}
      </button>


    
  );
}

export default LikeButton;