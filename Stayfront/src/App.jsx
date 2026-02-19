import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './component/homepage';
import HotelDetails from './component/hoteldetails';
import './index.css'
import Login from './component/auth/Login';
import {Navbar} from "./component/auth/Navbar";
import {PrivateRoute} from "./component/auth/PrivateRoute";
import {Wishlist} from "./component/auth/Wishlist";
import {MyCart} from "./component/auth/Mycart";
import {Booking} from "./component/auth/Booking";
import MyAccount from './component/Account/MyAccount';
import BookingSuccess from "./component/BookingSuccess";
import PaymentGateway from "./component/auth/PaymentGateway";
import BookingTicket from "./component/auth/BookingTicket";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/hotel-details" element={<HotelDetails />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/account"
          element={
            <PrivateRoute>
              <MyAccount />
            </PrivateRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <PrivateRoute>
              <Wishlist />
            </PrivateRoute>
          }
        />

        <Route
          path="/mycart"
          element={
            <PrivateRoute>
              <MyCart />
            </PrivateRoute>
          }
        />      
        <Route path="/booking" element={<Booking/>} />
        <Route path="/payment-gateway" element={<PaymentGateway/>} />
        <Route path="/booking-ticket" element={<BookingTicket/>} />
        <Route path="/booking-success" element={<BookingSuccess/>} />

        <Route path='/navbar' element={<Navbar/>}/>
      </Routes>
    </Router>
  );
}
export default App;