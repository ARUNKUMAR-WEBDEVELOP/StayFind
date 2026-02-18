import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../firebase"; // ✅ Adjust path
import { useAuth } from "./AuthContext";

const Login = () => {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  // ✅ Setup Recaptcha once
useEffect(() => {
  if (!window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          // size: "invisible",
          callback: (response) => {
            console.log("Recaptcha solved");
          },
          "expired-callback": () => {
            console.warn("Recaptcha expired");
          }
        }
      );
      window.recaptchaVerifier.render();
    } catch (err) {
      console.error("Recaptcha init failed:", err);
    }
  }
}, []);



  // 🔢 Send OTP
const sendOtp = async () => {
  if (!phone || !phone.startsWith("+91")) {
    setError("Enter a valid phone number with country code (e.g., +91...)");
    return;
  }

  try {
    const appVerifier = window.recaptchaVerifier;
    const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
    window.confirmationResult = confirmation;
    setStep("otp");
    setError("");
  } catch (err) {
    console.error("Send OTP Error:", err);
    setError("Failed to send OTP. Make sure phone number is valid and Firebase is set up.");
  }
};

  // ✅ Verify OTP and get JWT from backend
  const verifyOtp = async () => {
  try {
    if (!window.confirmationResult) {
      setError("OTP was not sent. Please try again.");
      return;
    }

    const result = await window.confirmationResult.confirm(otp);
    const idToken = await result.user.getIdToken();

    const response = await fetch("https://stayfind.onrender.com/api/firebase-login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();
    if (data.access) {
      login(data.user, data.access);
      navigate("/");
    } else {
      setError("Login failed. Try again.");
    }
  } catch (err) {
    console.error("Verify OTP Error:", err);
    setError("OTP verification failed.");
  }
};


  // 🧠 Google Login flow
  const handleGoogle = async (res) => {
    try {
      const response = await fetch("https://stayfind.onrender.com/api/google_login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Authorization: `Bearer ${token}`,
        body: JSON.stringify({ token: res.credential }),
      });

      const data = await response.json();
      if (data.access) {
        localStorage.setItem("access_token", data.access); // 🔥 REQUIRED
        // localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        login(data.user, data.access);
        navigate("/");
        console.log("Saved token:", localStorage.getItem("access_token"));
        console.log("refresh token:", localStorage.getItem("refresh_token"));

      } else {
        setError("Google login failed.");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Something went wrong with Google login.");
    }
  };

  // Refresh access token using stored refresh token
  async function refreshAccessToken() {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) throw new Error('No refresh token');

    const res = await fetch('https://stayfind.onrender.com/api/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    });
    const data = await res.json();
    if (data.access) {
      localStorage.setItem('accessToken', data.access);
    }
    return data;
  }

  return (
    <div className="p-6 bg-white shadow-xl rounded-xl max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4 text-center">Login to StayFinder</h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* 🔢 Phone/OTP Section */}
      {step === "phone" ? (
        <>
          <input
            type="tel"
            placeholder="Enter phone number"
            className="w-full p-2 border mb-4 rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            onClick={sendOtp}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Send OTP
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full p-2 border mb-4 rounded"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            onClick={verifyOtp}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Verify OTP
          </button>
        </>
      )}

      <div className="text-center my-3 text-gray-500">OR</div>

      {/* 🔐 Google Login */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogle}
          onError={() => setError("Google login failed")}
        />
      </div>

      {/* 🔒 Invisible Recaptcha Container */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Login;
