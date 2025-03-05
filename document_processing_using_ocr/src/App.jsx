import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import FileUploadPage from "./pages/FileUploadPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { authService } from "./services/api";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar.jsx";

function App() {
  const isAuthenticated = () => !!authService.getCurrentUser();

  return (
    <>
      {/* <AuthProvider> */}
      <Router>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/upload" element={<FileUploadPage />} />
          {/* </Routes> */}
          {/* <div className="text-3xl font-semibold">Hello EDC!!</div> */}
          {/* </Router> */}
          {/* </> */}
          {/* <Router> */}
          {/* <Routes> */}
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={isAuthenticated() ? <Navigate to="/" /> : <LoginPage />}
          />
          <Route
            path="/signup"
            element={isAuthenticated() ? <Navigate to="/" /> : <SignupPage />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard (Protected Route)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div>Profile Page (Protected Route)</div>
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      {/* </AuthProvider> */}
    </>
  );
}

export default App;
