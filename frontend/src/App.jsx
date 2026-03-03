import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../utils/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/student/Signup.jsx";
import Dashboard from "./pages/student/Dashboard.jsx";
import ReportFoundItems from "./pages/student/ReportFoundItems.jsx";
import ReportLostItems from "./pages/student/ReportLostItems.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";




function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* PRIVATE ROUTES (WITH HEADER + FOOTER) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/founditems" element={<ReportFoundItems />} />
            <Route path="/lostitems" element={<ReportLostItems />} />
            <Route path="/admindashboard" element={<AdminDashboard />} />
          </Route>
            <Route element={<Layout />}>
            <Route path="/admindashboard" element={<AdminDashboard />} />
          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;