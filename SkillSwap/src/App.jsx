import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProfilePage from "./pages/ProfilePage";
import BrowsePage from "./pages/BrowsePage";
import LandingPage from "./pages/LandingPage";
import EditProfilePage from "./pages/EditProfilePage";

// IMP: do "npm install react-router-dom" to see the project

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/profile/me" element={<ProfilePage />} />
        <Route path="/profile/me/edit" element={<EditProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;