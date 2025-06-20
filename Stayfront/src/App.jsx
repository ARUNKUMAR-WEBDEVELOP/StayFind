import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import HotelDetails from './components/HotelDetails';
 import './index.css'
 import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
