import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function Layout() {

  const [role, setRole] = useState(localStorage.getItem("role"));

  useEffect(() => {

    const handleStorageChange = () => {
      setRole(localStorage.getItem("role"));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };

  }, []);

  const isAdmin = role !== "student";

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <Header applicantType={isAdmin ? "admin" : "student"} />

      {/* Page Content */}
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>

      {/* Footer with Role Theme */}
      <Footer isAdmin={isAdmin} />

    </div>
  );
}