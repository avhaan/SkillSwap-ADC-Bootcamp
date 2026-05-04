// use to see profile-page
//-------------------------------------------------------------------
// import ProfilePage from "./pages/ProfilePage";
// import Navbar from "./profile-page/components/Navbar";

// function App() {
//   return (
//     <>  
//       <Navbar />
//       <ProfilePage />
//     </>
//   );
// }

// export default App;
//-------------------------------------------------------------------


// use to see edit-profile page
//-------------------------------------------------------------------
// import Navbar from "./profile-page/components/Navbar";
// import EditProfilePage from "./pages/EditProfilePage";

// function App() {
//   return (
//     <>
//       <Navbar />
//       <EditProfilePage />
//     </>
//   );
// }

// export default App;
// //-------------------------------------------------------------------


import Navbar from "./profile-page/components/Navbar";
import RegisterPage from "./pages/RegisterPage";
import { AuthProvider } from "./context/AuthContext";
import { Routes, Route} from "react-router-dom";

function App() {
  return (
    <>
    
    <AuthProvider>
      <Navbar />
      <Routes>
          <Route path="/" element={<RegisterPage />} />
        </Routes>
    </AuthProvider>
    </>
  );
}

export default App;
//-------------------------------------------------------------------