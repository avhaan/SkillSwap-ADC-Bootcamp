import { useState } from "react";
import {apiRegister} from "../api/api.jsx"
import {useAuth} from "../context/AuthContext.jsx"
import { useNavigate, Link } from 'react-router-dom';
import "../register-page/style.css"



export default function RegisterPage() {
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

    function handleChange(e) {
        setForm(f => ({...f, [e.target.name]: e.target.value}))
    }

    return (
        <div className="register-page">
            <div className="left-panel">
                <div className="skill-swap">
                    <h2>Skill<span>Swap</span></h2>
                </div>
                <div className="trade-text">
                    <h2>Trade what</h2>
                    <h2>you <span>know</span></h2>
                </div>
                <div className="own-text">
                    <p>Not what you own</p>
                </div>
            </div>

            <div className="right-panel">
                <h1>Create Your <span>Account</span></h1>

                <div className="sign-in">
                    <h4>Already have one? <Link className= "signin-link"to="/login"><span>Sign in</span></Link></h4>  
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input name="name" placeholder="Your Name" value = {form.name} onChange={handleChange}></input>
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input name="email" placeholder="Your Email" value = {form.email} onChange={handleChange}></input>
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input name="password" placeholder="At least 6 characters" value = {form.password} onChange={handleChange}></input>
                        </div>

                        <button className="submit-button" type="submit">
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                        <p className="error-text">{error}</p>
                    </form>
                </div>
            </div>  
        </div>
    )
}