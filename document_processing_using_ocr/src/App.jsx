import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import FileUploadPage from "./pages/FileUploadPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<FileUploadPage />} />
        </Routes>
        <div className="text-3xl font-semibold">Hello EDC!!</div>
      </Router>
    </>
  );
}

export default App;
