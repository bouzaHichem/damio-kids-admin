import { BrowserRouter } from "react-router-dom";
import Footer from "./Components/Footer/Footer";
import Navbar from "./Components/Navbar/Navbar";
import Admin from "./Pages/Admin";

// Environment-based backend URL configuration
export const backend_url = process.env.REACT_APP_BACKEND_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://damio-kids-backend.onrender.com'  // Replace with your actual Render URL
    : 'http://localhost:4000');
export const currency = 'د.ج';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar />
        <Admin />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
