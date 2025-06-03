import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import CreateNews from './pages/CreateNews';
import Streams from './pages/Streams';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel'
import CreateTournament from './pages/CreateTournament';
import WaitingConfirmation from './pages/WaitingConfirmation';
import Footer from './components/Footer';
import UpdatePassword from './pages/UpdatePassword';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <ToastContainer position="bottom-right" autoClose={5000} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />
          <Route path="/create-tournament" element={<CreateTournament />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<TeamDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/create-news" element={<CreateNews />} />
          <Route path="/streams" element={<Streams />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/waiting-confirmation" element={<WaitingConfirmation />} />
          <Route path="/update-password" element={<UpdatePassword />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;