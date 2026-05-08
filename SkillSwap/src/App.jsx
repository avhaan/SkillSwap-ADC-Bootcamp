import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";

import ProfilePage from "./pages/ProfilePage";
import BrowsePage from "./pages/BrowsePage";
import LandingPage from "./pages/LandingPage";
import EditProfilePage from "./pages/EditProfilePage";
import RegisterPage from "./pages/RegisterPage";
import MatchesPage from "./pages/MatchesPage";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";



function AppLayout() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <AuthProvider>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/profile/:user_id" element={<ProfilePage />} />
        <Route path="/profile/me" element={<ProfilePage />} />
        <Route path="/profile/me/edit" element={<EditProfilePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/matches" element={<MatchesPage />} />
      </Routes>
    </AuthProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
