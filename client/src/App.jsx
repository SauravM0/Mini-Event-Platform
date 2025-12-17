import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import MyDashboard from './pages/MyDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/events/:id" element={<EventDetail />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/my-dashboard" element={<MyDashboard />} />
              {/* Edit route skipped for simplicity as per requirement focus on core UX, but can be added easily */}
            </Route>
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
