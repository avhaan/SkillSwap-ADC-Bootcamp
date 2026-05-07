import { useState } from "react";
import "../login-page/style.css";
import { Link, useNavigate } from "react-router-dom";
import { apiLogin } from "../api/api";
import { useAuth } from "../context/AuthContext";


export default function LoginPage() {

    const [form, setForm] = useState({email: "", password: ""})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const {login} = useAuth() // gets the login method from the AuthContext file
    const navigate = useNavigate()

    function handleChange(e) {
        setForm(f => ({...f, [e.target.name]: e.target.value}))
    }

    async function handleSubmit(e) {
        e.preventDefault()

        setError("")

        if (!form.email.trim() || !form.password.trim()) { // one of the fields is not filled in
            setError("Please enter both fields")
            return
        }   

        // makes the button show that the log in is loading
        setLoading(true)
        
        try {
            // returns the access token for the new user (if registration suceeds)
            const {access_token} = await apiLogin(form.email, form.password)
            // gets the information about the user
            const res = await fetch("http://localhost:8000/api/auth/me", {
                headers: {Authorization: `Bearer ${access_token}`}  
            })

            // checks if the api call succeeded in finding the user's profile
            // if it does not work, then 
            if (!res.ok) {
                setError("Incorrect username or password")
            }

            // the login is valid on the backend
            else {
                const me = await res.json() // turns the result into a json
                login(access_token, me) // logs in the user on the frontend
                navigate("/browse") // navigates to the browse page
            }
        }
        
        catch (err) {
            // displays the error message to the user
            setError(err.message)
        }
        
        finally {
            // returns the submit button back to normal whether logging in suceeds or not 
            setLoading(false)
        }
    }

    return (
        <div className="login-page">

            <div className="left-panel">
                <div className="skill-swap">
                    <h2>Skill<span>Swap</span></h2>
                </div>
                <div className="welcome-text">
                    <h2>Welcome <span>back.</span></h2>
                </div>
                <div className="pick-text">
                    <p>Pick up where you left off.</p>
                </div>
            </div>

            <div className="right-panel">
              <div className="login-form-container">
                <div className="sign-in">
                  <h2>Sign <span>in</span></h2>
                </div>

                <div className="register">
                  <h3>
                    New here? <Link to="/register"><span>Create an account</span></Link>
                  </h3>
                </div>

                <div className="card">
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Email</label>
                        <input
                          name="email"
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
                          placeholder="••••••••"
                          value={form.password}
                          onChange={handleChange}
                        />
                    </div>

                    <button className="submit-button" type="submit">
                      {loading ? "Logging in..." : "Sign in"}
                    </button>
                  </form>
                </div>

                {error && (
                  <div className="error-text">
                    <p>{error}</p>
                  </div>
                )}
              </div>
            </div>

        </div>
    )
}