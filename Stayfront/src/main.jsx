import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from "./component/auth/AuthContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <div>
    <GoogleOAuthProvider clientId="828393106564-p7bvbr10t0ck2718gpa5ne2kfvo34tbn.apps.googleusercontent.com">
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </div>
);
