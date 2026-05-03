function ContactButton({ email }) {
  function handleContact() {
    window.location.href = `mailto:${email}`;
  }

  return (
    <button className="contact-button" onClick={() => handleContact()}>
      Contact
    </button>
  );
}

export default ContactButton;