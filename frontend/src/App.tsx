import "./App.css";
import { CodingPage } from "./components/CodingPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing } from "./components/Landing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/coding/:userId" element={<CodingPage />} />
        <Route path="/:userId" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
