import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProfilePage from "./pages/ProfilePage";
import BrowsePage from "./pages/BrowsePage";
import LandingPage from "./pages/LandingPage";
import EditProfilePage from "./pages/EditProfilePage";
import RegisterPage from "./pages/RegisterPage";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/profile/me" element={<ProfilePage />} />
        <Route path="/profile/me/edit" element={<EditProfilePage />} />
        <Route path ="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;