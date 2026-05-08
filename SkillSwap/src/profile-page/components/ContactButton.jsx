import { apiGetMatchStatus, apiSendMatchRequest } from "../../api/api";

function ContactButton({ email, user_id }) {
  function handleContact() {
    window.location.href = `mailto:${email}`;
  }

  async function handleMatch() {
    const alreadyRequested = await apiGetMatchStatus(user_id) 

    console.log(alreadyRequested.status === "none")
    console.log(user_id)
    if (alreadyRequested) {
      await apiSendMatchRequest(user_id)
      console.log("requested")
    }
  }

  return (
    <button className="contact-button" onClick={() => handleMatch()}>
      Request Match
    </button>
  );
}

export default ContactButton;