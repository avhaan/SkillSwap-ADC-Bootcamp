import {useState, useEffect, createContext, useContext} from 'react'

const AuthContext = createContext(null)

export function AuthProvider({children}) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(() => localStorage.getItem("token"))
    const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")))
    
    // runs whenever token is updated
    useEffect(() => {
        if (token) { // if there is a token already
            // api call to get information about the user
            fetch(`${(import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "")}/api/auth/me`, {
                headers: {Authorization: `Bearer ${token}`}
            })

            // if the call succeeded, turn it into json else null
            .then(r => r.ok ? r.json() : null)
            // set the user to the data retrieved by the call and loading to false
            .then(data => {
                setUser(data); 
                setLoading(false)
            })
            // if any error, set loading to false
            .catch(() => setLoading(false))
        }
        
    }, [token])

    // logs a user in using their token and their user data
    function login(newToken, userData) {
        localStorage.setItem("token", newToken)
        setToken(newToken)
        setUser(userData)
    }

    // logs the current user out
    function logout() {
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
    }

    function refreshUser(updatedUser) {
        setUser(updatedUser)
    }


    return (
        <AuthContext.Provider value = {{user, token, loading, login, logout, refreshUser}}>
        {children}
        </AuthContext.Provider>
    )
}

// The authentication hook intentionally shares its provider's context.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext)
}

