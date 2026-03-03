import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

const IDLE_LIMIT = 60 * 60 * 1000;
const WARNING_TIME = 59 * 60 * 1000;

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp < Date.now() / 1000;
  } catch {
    return true;
  }
}

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!token) return;

    if (!localStorage.getItem("lastActivity")) {
      localStorage.setItem("lastActivity", Date.now().toString());
    }

    const resetTimer = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
      setShowWarning(false);
    };

    const checkIdle = () => {
      const last = Number(localStorage.getItem("lastActivity") || Date.now());
      const idleTime = Date.now() - last;

      if (idleTime > IDLE_LIMIT || isTokenExpired(token)) {
        localStorage.clear();
        window.location.href = "/";
      } else if (idleTime > WARNING_TIME) {
        setShowWarning(true);
      }
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    const interval = setInterval(checkIdle, 1000);

    resetTimer();

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, [token]);

  if (!token || isTokenExpired(token)) {
    localStorage.clear();
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Outlet />

      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-96 rounded-2xl shadow-2xl p-6 text-center animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-800">
              Session Expiring
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You will be logged out in 1 minute due to inactivity.
            </p>

            <button
              onClick={() => {
                localStorage.setItem("lastActivity", Date.now().toString());
                setShowWarning(false);
              }}
              className="mt-5 w-full bg-[#1A1E04] hover:bg-[#2C3307] text-white py-2 rounded-lg transition duration-200"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      )}
    </>
  );
}