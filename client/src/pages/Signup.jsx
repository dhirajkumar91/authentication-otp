import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false); // to toggle UI
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    try {
      const { data } = await axios.post("http://localhost:4000/send-otp", {
        email,
      });
      if (data.success) {
        toast.success("OTP sent to your email");
        setOtpSent(true);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Something went wrong!");
    }
  };

  // Step 2: Submit form with OTP
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:4000/signup",
        {
          email,
          username,
          password,
          otp,
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Signup successful!");
        setTimeout(() => navigate("/"), 1500);
      } else {
        toast.error(data.message || "Signup failed");
      }
    } catch (err) {
      toast.error("Signup error occurred");
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!otpSent && (
          <button type="button" onClick={handleSendOtp}>
            Send OTP
          </button>
        )}

        {otpSent && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <input
              type="text"
              placeholder="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Signup</button>
          </>
        )}
      </form>
      <ToastContainer />
    </div>
  );
};

export default Signup;
