import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRegister } from "../api/api.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "../register-page/style.css";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(event) {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Please fill in all the fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    const [error, setError] = useState("")
    const [form, setForm] = useState({name: "", email: "", password: ""})
    const [loading, setLoading] = useState(false)
    const {login} = useAuth() // gets the login method from the AuthContext file
    const navigate = useNavigate()

    // called when the form is submitted
    async function handleSubmit(e) {
        // makes the page not refresh
        e.preventDefault()
        // removes the error message
        setError("")
    
        // one of the fields is empty
        if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
            setError("Please fill in all the fields")
            return
        }

        // password is too short 
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        // makes the button show that the register is loading
        setLoading(true)

        try {
            // returns the access token for the new user (if registration suceeds)
            const {access_token} = await apiRegister(form.name, form.email, form.password)
            // gets the information about the newly made user
            const res = await fetch("http://localhost:8000/api/auth/me", {
                headers: {Authorization: `Bearer ${access_token}`}  
            })
            const me = await res.json() // turns the result into a json
           login(access_token, me) // logs in the newly register user
           navigate("/profile/me/edit") // navigates to the profile editor
        }

        catch (err) {
            // displays the error message to the user
            setError(err.message)
        }

        finally {
            // returns the submit button back to normal whether registation suceeds or not 
            setLoading(false)
        }
    }

    setLoading(true);

    try {
      const { access_token } = await apiRegister(
        form.name,
        form.email,
        form.password
      );

      const res = await fetch("http://localhost:8000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const me = await res.json();

      login(access_token, me);
      navigate("/profile/me/edit");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <section className="left-panel">
        <div className="skill-swap">
          Skill<span>Swap</span>
        </div>

        <div className="trade-text">
          <h1>
            Trade what <br />
            you <span>know.</span>
          </h1>
        </div>

        <div className="own-text">
          <p>Not what you own.</p>
        </div>
      </section>

      <section className="right-panel">
        <div className="register-form-container">
          <div className="register-header">
            <h1>
              Create your <span>account</span>
            </h1>

            <p>
              Already have one?{" "}
              <Link className="signin-link" to="/login">
                Sign in
              </Link>
            </p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full name</label>
              <input
                name="name"
                placeholder="Maya Ramirez"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@school.edu"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button className="submit-button" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>

            {error && <p className="error-text">{error}</p>}
          </form>
        </div>
      </section>
    </div>
  );
}