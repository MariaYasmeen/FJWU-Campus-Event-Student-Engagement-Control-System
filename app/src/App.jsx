import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Landing from "./pages/Landing.jsx";
import StudentHome from "./pages/StudentHome.jsx";
import ManagerHome from "./pages/ManagerHome.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import ManagerProfile from "./pages/ManagerProfile.jsx";
import Favourites from "./pages/Favourites.jsx";

// ✅ Fix: RootRedirect must be placed inside AuthProvider
function RootRedirectWrapper() {
  const { profile, loading } = useAuth();

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!profile) return <Navigate to="/login" replace />;

  return (
    <Navigate
      to={profile.role === "manager" ? "/manager" : "/student"}
      replace
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Landing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <StudentHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute>
                <ManagerHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/create-event"
            element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/profile"
            element={
              <ProtectedRoute>
                <ManagerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/favourites"
            element={
              <ProtectedRoute>
                <Favourites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <EventDetail />
              </ProtectedRoute>
            }
          />

          {/* Redirect all unknown paths */}
          <Route path="*" element={<RootRedirectWrapper />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
