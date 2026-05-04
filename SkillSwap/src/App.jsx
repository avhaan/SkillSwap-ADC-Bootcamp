import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import BrowsePage from './pages/BrowsePage'
import ProfilePage from './pages/ProfilePage'
import Navbar from './components/Navbar'
function App() {
 

  return (
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/browse" element={<BrowsePage/>} />
        <Route path="/profile/:id" element={<ProfilePage/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
