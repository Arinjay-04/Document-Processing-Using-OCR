import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
        <div className="text-3xl font-semibold">Hello EDC!!</div>
      </Router>
    </>
  );
}

export default App;
