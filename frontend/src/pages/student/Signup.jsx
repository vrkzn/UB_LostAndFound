import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import api from "../../api/axios"; // ✅ correct path

export default function Signup() {
  const navigate = useNavigate();
  const logo = "/ub_logo.png";

  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    let newErrors = {};

    if (!form.fullname) newErrors.fullname = "Full name is required";
    if (!form.username) newErrors.username = "Username is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);

        const res = await api.post("/auth/signup", {
          fullname: form.fullname,
          username: form.username,
          email: form.email,
          password: form.password
        });

        alert(res.data.message || "Account created successfully!");
        navigate("/");

      } catch (err) {
        alert(
          err.response?.data?.message ||
          "Failed to create account."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT HERO SECTION */}
      <div
        className="hidden md:flex w-1/2 items-center justify-center"
        style={{
          background: "linear-gradient(180deg, #5B0000, #2E0000)"
        }}
      >
        <img src={logo} alt="UB Logo" className="w-72 opacity-95" />
      </div>

      {/* RIGHT SIGNUP SECTION */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-[#FAF8F5] px-16">

        <div className="w-full max-w-md">

          <h1 className="text-3xl font-bold text-[#5B0000] text-center mb-2">
            Create Account
          </h1>

          <p className="text-sm text-gray-600 text-center mb-8">
            Join the UB SIHTM Lost and Found Portal
          </p>

          <form className="space-y-5" onSubmit={handleSignup}>

            {/* FULL NAME */}
            <div>
              <label className="block text-sm mb-1">Full Name</label>
              <input
                name="fullname"
                value={form.fullname}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5B0000]"
              />
              {errors.fullname && <p className="text-red-600 text-xs">{errors.fullname}</p>}
            </div>

            {/* USERNAME */}
            <div>
              <label className="block text-sm mb-1">User Name</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5B0000]"
              />
              {errors.username && <p className="text-red-600 text-xs">{errors.username}</p>}
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5B0000]"
              />
              {errors.email && <p className="text-red-600 text-xs">{errors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5B0000]"
                />
                <div
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </div>
              </div>
              {errors.password && <p className="text-red-600 text-xs">{errors.password}</p>}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-sm mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5B0000]"
                />
                <div
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs">{errors.confirmPassword}</p>
              )}
            </div>

            {/* SIGNUP BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5B0000] text-white py-2.5 rounded-lg hover:bg-[#3A0000] transition font-medium"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <p className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/")}
                className="text-[#5B0000] cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}