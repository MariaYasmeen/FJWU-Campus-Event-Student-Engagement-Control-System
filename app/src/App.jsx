import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Landing from "./pages/Landing.jsx";
import StudentHome from "./panels/student/StudentHome.jsx";
import ManagerHome from "./panels/manager/ManagerHome.jsx";
import CreateEvent from "./panels/manager/CreateEvent.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import ManagerProfile from "./panels/manager/ManagerProfile.jsx";
import Favourites from "./panels/manager/Favourites.jsx";
import StudentEvents from "./panels/student/StudentEvents.jsx";
import StudentFavourites from "./panels/student/StudentFavourites.jsx";
import StudentRegistrations from "./panels/student/StudentRegistrations.jsx";
import StudentCommunity from "./panels/student/StudentCommunity.jsx";
import StudentProfile from "./panels/student/StudentProfile.jsx";
import StudentSettings from "./panels/student/StudentSettings.jsx";
import StudentSearch from "./panels/student/StudentSearch.jsx";
import StudentSocieties from "./panels/student/StudentSocieties.jsx";
import ManagerEvents from "./panels/manager/ManagerEvents.jsx";
import ManagerSocieties from "./panels/manager/ManagerSocieties.jsx";
import AdminEvents from "./pages/AdminEvents.jsx";
import SocietyProfile from "./pages/SocietyProfile.jsx";
import YourEvents from "./panels/manager/YourEvents.jsx";
import ManagerAnalytics from "./panels/manager/ManagerAnalytics.jsx";
import ManagerSettings from "./panels/manager/ManagerSettings.jsx";
import ManagerAnnouncements from "./panels/manager/ManagerAnnouncements.jsx";

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
            path="/student/events"
            element={
              <ProtectedRoute>
                <StudentEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/favourites"
            element={
              <ProtectedRoute>
                <StudentFavourites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/registrations"
            element={
              <ProtectedRoute>
                <StudentRegistrations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/community"
            element={
              <ProtectedRoute>
                <StudentCommunity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/settings"
            element={
              <ProtectedRoute>
                <StudentSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/search"
            element={
              <ProtectedRoute>
                <StudentSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/societies"
            element={
              <ProtectedRoute>
                <StudentSocieties />
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
            path="/manager/events"
            element={
              <ProtectedRoute>
                <ManagerEvents />
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
            path="/manager/events/:id/edit"
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
            path="/manager/your-events"
            element={
              <ProtectedRoute>
                <YourEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/societies"
            element={
              <ProtectedRoute>
                <ManagerSocieties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/analytics"
            element={
              <ProtectedRoute>
                <ManagerAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/settings"
            element={
              <ProtectedRoute>
                <ManagerSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/announcements"
            element={
              <ProtectedRoute>
                <ManagerAnnouncements />
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
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute>
                <AdminEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/society/:uid"
            element={
              <ProtectedRoute>
                <SocietyProfile />
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
