import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";


export default function Login() {
  const navigate = useNavigate();
  const logo = "/ub_logo.png";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: ""
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:7002/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors(prev => ({
          ...prev,
          general: data.message || "Login failed."
        }));
        return;
      }

      // Store auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.user_type);

      // Redirect based on role
      const role = data.user.user_type;

      if (role === "admin") {
        navigate("/admindashboard");
      } 
      else if (role === "student") {
        navigate("/dashboard");
      } 
      else {
        navigate("/");
      }

    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: "Server is unreachable. Please try again."
      }));
    }
  };

  return (
    <div className="min-h-screen flex">

      <div
        className="hidden md:flex w-1/2 items-center justify-center"
        style={{
          background: "linear-gradient(180deg, #5B0000, #2E0000)"
        }}
      >
        <img src={logo} alt="UB Logo" className="w-72 opacity-95"/>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-[#FAF8F5] px-16">

        <div className="w-full max-w-md">

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[#5B0000]">
              University of Baguio
            </h1>

            <p className="text-sm text-[#8A6B3F] font-medium">
              Report Lost and Found Items
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-4xl font-semibold text-[#3A0000] text-left">
              Welcome!
            </h2>
            

            <p className="text-sm text-gray-600 text-left">
              Please login to continue
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>

            <div>
              <label className="block text-sm text-gray-700 mb-2 font-medium">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-[#5B0000]"
              />

              {errors.email && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-medium">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-[#5B0000]"
                />

                <div
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </div>
              </div>

              {errors.password && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            
            {/* LOGIN BUTTON */}
            {errors.general && (
              <p className="text-red-600 text-sm text-center">
                {errors.general}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#5B0000] text-white py-2.5 rounded-lg
              hover:bg-[#3A0000] transition font-medium"
            >
              Log In
            </button>

            {/* CENTERED LINKS */}
            <div className="flex flex-col items-center gap-2 text-sm pt-2">

              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-[#5B0000] hover:underline"
              >
                Create Account
              </button>

              {/* <button
                type="button"
                onClick={() => navigate("/forgotpassword")}
                className="text-gray-600 hover:underline"
              >
                Forgot Password?
              </button> */}

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}