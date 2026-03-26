import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/globalSlice';
import { useLogoutMutation } from '../../store/apiServices';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();
  const { isLoggedIn, userName } = useSelector(state => state.global);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await logoutApi({ token: refreshToken }).unwrap();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      dispatch(logout());
      setShowDropdown(false);
      navigate('/login');
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl group-hover:scale-110 transition-transform">🚀</span>
          <span className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">TaskMaster</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Home</Link>
          <Link to="/tasks" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Tasks</Link>
          <Link to="/groups" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Groups</Link>
        </nav>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="relative flex items-center gap-3">
              <span className="hidden sm:inline-block text-gray-700 font-medium">{userName}</span>
              <button 
                className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl cursor-pointer hover:bg-indigo-200 transition-colors"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                👤
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-12 w-48 bg-white border border-gray-100 rounded-lg shadow-xl py-1 overflow-hidden">
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg active:scale-95">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;