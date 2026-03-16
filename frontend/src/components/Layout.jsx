import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function Layout() {

  const [role, setRole] = useState(localStorage.getItem("role"));

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [userName, setUserName] = useState(storedUser.name || "Unknown");

  useEffect(() => {

    const handleStorageChange = () => {
      setRole(localStorage.getItem("role"));

      const updatedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(updatedUser.name || "Unknown");
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };

  }, []);

  const isAdmin = role !== "student";

  return (
    <div className="min-h-screen flex flex-col">

      <Header
        applicantType={isAdmin ? "admin" : "student"}
        userName={userName}
      />

      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>

      <Footer isAdmin={isAdmin} />

    </div>
  );
}