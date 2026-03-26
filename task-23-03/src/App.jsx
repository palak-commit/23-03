import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TaskList from './pages/TaskList'
import Home from './pages/Home'
import Groups from './pages/Groups'
import Login from './pages/Login'
import Register from './pages/Register'
import Header from './layout/header/Header'
import Footer from './layout/footer/Footer'
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <ToastContainer position="top-center" autoClose={3000} transition={Slide} />
        
        <Header />

        <main className="flex-grow py-10 px-4 md:px-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}

export default App
