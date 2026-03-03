import { useEffect, useState } from "react";

export default function Footer() {

  const [role, setRole] = useState(localStorage.getItem("role"));
  const isAdmin = role !== "student";

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem("role"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <footer className="
      bg-white
      p-4
      flex
      justify-center
      gap-6
      text-sm
      sticky bottom-0 z-40
      transition-all duration-300
    "
    style={{
      color: isAdmin ? "#4B5563" : "#B91C1C",
      borderTop: `2px solid ${isAdmin ? "#4B5563" : "#B91C1C"}`
    }}
    >

      <span className="cursor-pointer hover:underline">
        Lost & Found Tips
      </span>

      <span className="cursor-pointer hover:underline">
        FAQs
      </span>

      <span className="cursor-pointer hover:underline">
        Contact Us
      </span>

    </footer>
  );
}