import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">Organ Donation</Link>
        <div className="navbar-nav">
          {user.role === 'donor' && (
            <>
              <Link className="nav-link" to="/my-donations">My Donations</Link>
              <Link className="nav-link" to="/donate">New Donation</Link>
            </>
          )}
          {user.role === 'recipient' && (
            <>
              <Link className="nav-link" to="/my-requests">My Requests</Link>
              <Link className="nav-link" to="/request-organ">Request Organ</Link>
            </>
          )}
          {(user.role === 'hospital' || user.role === 'admin') && (
            <>
              <Link className="nav-link" to="/match">Matching</Link>
              <Link className="nav-link" to="/stats">Statistics</Link>
            </>
          )}
          {user.role === 'admin' && (
            <Link className="nav-link" to="/admin/users">Users</Link>
          )}
          <Link className="nav-link" to="/profile">Profile</Link>
          <button className="btn btn-outline-light" onClick={logout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;