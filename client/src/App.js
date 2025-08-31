import { Outlet, Link, useLocation } from 'react-router-dom'; // Import useLocation
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout } = useAuth();
  const location = useLocation(); // Get current location

  // Hide navbar on login page
  const showNavbar = location.pathname !== '/login';

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {showNavbar && (
        <nav className="bg-gray-800 p-4 flex justify-between items-center">
          <ul className="flex space-x-4">
            <li>
              <Link to="/generator" className="hover:text-gray-300">Generator</Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-gray-300">Gallery</Link>
            </li>
            {user && user.role === 'admin' && (
              <li>
                <Link to="/admin" className="hover:text-gray-300">Admin</Link>
              </li>
            )}
          </ul>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span>Welcome, {user.username}</span>
                <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:text-gray-300">Login</Link>
            )}
          </div>
        </nav>
      )}
      <main className="p-4 flex flex-grow flex-col"> {/* Added flex flex-grow flex-col */}
        <Outlet />
      </main>
    </div>
  );
}

export default App;
