import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../components/firebase";
import { ToastContainer, toast } from "react-toastify";
import "./LoginPage.css";
import "react-toastify/dist/ReactToastify.css";

// Custom Notification Icons
const SuccessIcon = () => (
  <svg
    className="toast-icon"
    fill="currentColor"
    viewBox="0 0 20 20"
    width="24"
    height="24"
  >
    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
  </svg>
);

const ErrorIcon = () => (
  <svg
    className="toast-icon"
    fill="currentColor"
    viewBox="0 0 20 20"
    width="24"
    height="24"
  >
    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
  </svg>
);

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const showSuccess = (message) =>
    toast(
      <div className="toast-content">
        <SuccessIcon />
        <span>{message}</span>
      </div>,
      {
        className: "toast-success",
        progressClassName: "toast-progress",
      }
    );

  const showError = (message) =>
    toast(
      <div className="toast-content">
        <ErrorIcon />
        <span>{message}</span>
      </div>,
      {
        className: "toast-error",
        progressClassName: "toast-progress",
      }
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in Succesfully!", { position: "top-center" });
      setTimeout(() => {
        window.location.href = "/home";
      }, 2000);
    } catch (error) {
      console.log(error.message);
      toast.error("Error", { position: "top-center" });
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="auth-form-container">
        <h3>Login</h3>

        <div className="form-group">
          <label>Email address</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary">
          Sign In
        </button>

        <p className="forgot-password">
          New user <a href="/register">Register Here</a>
        </p>
        {/* <SignInwithGoogle/> */}
      </form>
    </div>
  );
}

export default LoginPage;