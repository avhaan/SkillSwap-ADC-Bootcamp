import {useState} from "react"
import "../login-page/style.css"
import {Link} from 'react-router-dom'
import { apiLogin } from "../api/api"

export default function LoginPage() {
    const [form, setForm] = useState({email: "", password: ""})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    function handleChange(e) {
        setForm(f => ({...f, [e.target.name]: e.target.value}))
    }

    async function handleSubmit(e) {
        e.preventDefault()

        setError("ec")

        // makes the button show that the log in is loading
        setLoading(true)
        
        try {
            // returns the access token for the new user (if registration suceeds)
            const {access_token} = await apiLogin(form.email, form.password)
            // gets the information about the user
            const res = await fetch("http://localhost:8000/api/auth/me", {
                headers: {Authorization: `Bearer ${access_token}`}  
            })

            const me = await res.json() // turns the result into a json
            login(access_token, me) // logs in the user on the frontend
            navigate("/browse") // navigates to the browse page
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
                    <h2>Welcome <span>Back.</span></h2>
                </div>
                <div className="pick-text">
                    <p>Pick up where you left off.</p>
                </div>
            </div>

            <div className="right-panel">
                <div className="sign-in">
                    <h2>Sign <span>in</span></h2>
                </div>

                <div className="register">
                    <h3>New here? <Link to="/register"><span>Create an account</span></Link></h3>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input name="email" placeholder="Your Email" value = {form.email} onChange={handleChange}></input>
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input name="password" placeholder="Enter Passwrod" value = {form.password} onChange={handleChange}></input>
                        </div>

                        <button className="submit-button" type="submit">
                            {loading ? "Loggin in..." : "Log in"}
                        </button>
                    </form>
                </div>

                <div className="error-text">
                    <p>{error}</p>
                </div>

            </div>


        </div>
    )
}