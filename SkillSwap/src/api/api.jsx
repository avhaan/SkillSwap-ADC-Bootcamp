// backend base URL
const BASE = "http://localhost:8000"

// HELPER FUNCTIONS

// checks if the user has a token and if so, returns a json with it
// Otherwise returns empty json
function authHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// res: the result of an API call
async function handleResponse(res) {
    // the call failed
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || 'Request failed');
    }

    // the call worked, but there is nothing to return
    else if (res.status == 204) {
        return null
    }

    // the call worked, return the result as a json
    else {
        return res.json()
    }
}

// AUTH ENDPOINTS

// api call for registering an account
export async function apiRegister(name, email, password) {
    const res = await fetch(`${BASE}/api/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }, 
        body: JSON.stringify({name: name, email: email, password: password})
    })

    return handleResponse(res)
}

// used to log a user in using their username and password
// returns a JWT
export async function apiLogin(email, password) {
    const res = await fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"}, 
        body: JSON.stringify({email: email, password: password})
    })

    return handleResponse(res)
}

// gets all the information from the current user using their token
export async function apiGetMe() {
    const res = await fetch(`${BASE}/api/auth/me`, {
        method: "GET",
        headers: authHeaders() // gets the users token and returns {Authorization: `Bearer ${token}`} if exists
    })

    return handleResponse(res)
}


// USERS ENDPOINTS 

// browses users. Parameters of search, category, proficiency, page, and limit
export async function apiBrowseUsers({search = "", category = "", proficiency = "", page = 1, limit = 10} = {}) {
    // used to store the parameters for the call
    const params = new URLSearchParams()

    if (search) { // non empty string
        params.append("search", search)  // adds search as a parameter to the call
    }
    if (category) {
        params.append("category", category)
    }
    if (proficiency) {
        params.append("proficiency", proficiency)
    }
    params.append("page", page)
    params.append("limit", limit)

    const res = await fetch(`${BASE}/api/users/?${params}`)

    return handleResponse(res)
}

// gets information about a user using their userID
export async function apiGetUser(userID) {
    const res = await fetch(`${BASE}/api/users/${userID}`)
    return(handleResponse(res))
}

// updates a users profile information
// users the current token to authenticate the user
export async function apiUpdateProfile(data) {
    const res = await fetch(`${BASE}/api/users/me`, {
        method: "PUT",
        headers: {"Content-Type": "application/json", ...authHeaders()}, 
        body: JSON.stringify(data)
    })

    return handleResponse(res)
}

// deletes the current users account based on the current token
export async function apiDeleteAccount() {
    const res = await fetch(`${BASE}/api/users/me`, {
        method: "DELETE",
        headers: authHeaders()
    })

    return handleResponse(res)
}   

// REVIEWS ENDPOINTS

// returns all reviews the for user userID
export async function apiGetReviews(userID) {
    const res = await fetch(`${BASE}/api/reviews/${userID}`)

    return handleResponse(res)
}   

// creates a review for userID from the account of the current user that is logged in
export async function apiCreateReview(userID, rating, comment) {
    const res = await fetch(`${BASE}/api/reviews/${userID}`, {
        method: "POST",
        headers: {"Content-Type": "application/json", ...authHeaders()}, // gets the token of the user leaving the review
        body: JSON.stringify({rating: rating, comment: comment})
    })

    return handleResponse(res)
}

// edits an already existing review on the user userID from the current user
export async function apiUpdateReview(userID, rating, comment) {
    const res = await fetch(`${BASE}/api/reviews/${userID}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json", ...authHeaders()}, // gets the token of the user leaving the review
        body: JSON.stringify({rating: rating, comment: comment})
    })

    return handleResponse(res)
}

// deletes the reivew from the current user on userID
export async function apiDeleteReview(userID) {
    const res = await fetch(`${BASE}/api/reviews/${userID}`, {
        method: "DELETE",
        headers: authHeaders(), // gets the token of the user leaving the review
    })

    return handleResponse(res)
}

// LIKES ENDPOINTS

// the current user likes (toggle) the profile of userID 
export async function apiToggleLike(userID) {
    const res = await fetch(`${BASE}/api/likes/${userID}`, {
        method: "POST",
        headers: authHeaders(), // gets the token of the user that is liking the profile
    })

    return handleResponse(res)
}

// gets the status of whether the current user has liked userId's profile
export async function apiGetLikeStatus(userID) {
    const res = await fetch(`${BASE}/api/likes/${userID}/status`, {
        method: "GET",
        headers: authHeaders(), // gets the token of the user that is liking the profile
    })

    return handleResponse(res)
}

// CATEGORY ENDPOINTS

// gets the list of categories
export async function apiGetCategories() {
    const res = await fetch(`${BASE}/api/categories`)

    return handleResponse(res)
}