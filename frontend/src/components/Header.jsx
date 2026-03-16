const Header = ({ applicantType, userName }) => {
  const isAdmin = applicantType === "admin";

  const headerColor = isAdmin
    ? "bg-gradient-to-r from-gray-600 via-gray-500 to-gray-400 text-gray-100"
    : "bg-gradient-to-r from-[#7A1F1F] via-[#8A2A2A] to-[#5B0000] text-white";

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    }
  };

  const displayName = userName?.trim() || "Unknown";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header
      className={`${headerColor} sticky top-0 z-50 shadow-md border-b border-gray-300`}
    >
      <div className="flex items-center justify-between px-8 py-4">

        {/* LEFT: Logo + Title */}
        <div className="flex items-center gap-4">
          <img
            src="/ub_logo.png"
            alt="UB Logo"
            className="h-12 w-auto transition-transform duration-300 hover:scale-110"
          />
          <div className="hidden sm:flex flex-col leading-tight">
            <h1 className="text-lg font-bold tracking-wide drop-shadow-sm">
              UB SIHTM Lost & Found
            </h1>
            <p className="text-xs opacity-70">
              University of Baguio Hospitality & Tourism Management
            </p>
          </div>
        </div>

        {/* RIGHT: Profile & Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md hover:scale-105 transition-transform duration-200 hover:bg-white/30"
        >
          {/* Avatar Circle */}
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-white font-semibold text-sm">
            {initial}
          </div>

          {/* Name & Logout */}
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-white">{displayName}</span>
            <span className="text-xs text-gray-200 opacity-80">Log out</span>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;