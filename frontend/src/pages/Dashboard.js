import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mt-4">
      <h1>Welcome, {user?.name}</h1>
      <p>Role: {user?.role}</p>
      
      {user?.role === 'donor' && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Donor Dashboard</h5>
            <p className="card-text">
              You can register your organ donations here.
            </p>
            <a href="/donate" className="btn btn-primary">
              Register Donation
            </a>
          </div>
        </div>
      )}
      
      {user?.role === 'recipient' && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Recipient Dashboard</h5>
            <p className="card-text">
              You can request organs you need here.
            </p>
            <a href="/request-organ" className="btn btn-primary">
              Request Organ
            </a>
          </div>
        </div>
      )}
      
      {user?.role === 'hospital' && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Hospital Dashboard</h5>
            <p className="card-text">
              Manage donations and requests.
            </p>
            <a href="/match" className="btn btn-primary me-2">
              Matching Interface
            </a>
            <a href="/stats" className="btn btn-secondary">
              View Statistics
            </a>
          </div>
        </div>
      )}
      
      {user?.role === 'admin' && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Admin Dashboard</h5>
            <p className="card-text">
              Manage all system users and data.
            </p>
            <a href="/admin/users" className="btn btn-primary me-2">
              User Management
            </a>
            <a href="/stats" className="btn btn-secondary">
              View Statistics
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;