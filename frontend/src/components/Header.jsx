export default function Header({ applicantType }) {

  const isAdmin = applicantType === "admin";

  const headerColor = isAdmin
    ? "bg-gradient-to-r from-gray-400 via-gray-400 to-gray-300 text-gray-900"
    : "bg-gradient-to-r from-[#5B0000] via-[#7A1F1F] to-[#8A2A2A] text-white";

  return (
    <header
      className={`
        ${headerColor}
        sticky top-0 z-50
        shadow-md
        transition-all duration-300
        border-b-2
        ${isAdmin ? "border-gray-600" : "border-gray-300"}
      `}
    >

      <div className="flex items-center px-8 py-4 gap-6">

        {/* Logo */}
        <img
          src="/ub_logo.png"
          alt="UB Logo"
          className="h-12 w-auto drop-shadow-sm hover:scale-105 transition"
        />

        {/* Title */}
        <div className="flex flex-col leading-tight">
          <h1 className="text-xl font-bold tracking-wide">
            UB SIHTM Lost & Found System
          </h1>

          <span className="text-sm opacity-70">
            University of Baguio School of International Hospitality and Tourism Management
          </span>
        </div>

        {/* Admin Badge */}
        {isAdmin && (
          <div className="ml-auto">
            <span className="
              text-xs font-semibold uppercase tracking-wider
              px-4 py-1 rounded-full
              bg-gray-800 text-white
              shadow-sm border border-gray-900
            ">
              Administrator Mode
            </span>
          </div>
        )}

      </div>
    </header>
  );
}