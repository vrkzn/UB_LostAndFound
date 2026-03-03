import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FileWarning, CheckCircle, Archive, Trash2 } from "lucide-react";

export default function AdminDashboard() {

  const [stats, setStats] = useState({
    totalLost: 0,
    totalFound: 0,
    totalUnclaimed: 0
  });

  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("found");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {

      const res = await api.get("/admin/dashboard");

      setStats(res.data.stats || {
        totalLost: 0,
        totalFound: 0,
        totalUnclaimed: 0
      });

      setItems(res.data.items || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.post(`/admin/items/${id}/${action}`);
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  /* ===== Skeleton Loaders ===== */

  const StatPlaceholder = () => (
    <div className="bg-white rounded-2xl shadow p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    </div>
  );

  const TablePlaceholder = () => (
    <tr className="border-b animate-pulse">
      <td className="p-3"><div className="w-14 h-14 bg-gray-200 rounded-lg"></div></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="p-3"><div className="h-6 bg-gray-200 rounded w-24"></div></td>
    </tr>
  );

  if (loading) {
    return (
      <div className="p-8 space-y-6 bg-gray-50 min-h-screen">

        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard Overview
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <StatPlaceholder key={i}/>)}
        </div>

        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>

          <table className="w-full text-sm">
            <tbody>
              {[1,2,3,4].map(i => <TablePlaceholder key={i}/>)}
            </tbody>
          </table>
        </div>

      </div>
    );
  }

  const filteredItems = items.filter(
    item => item.item_type === activeTab
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1">
          Lost and Found Management System
        </p>
      </div>

      {/* Statistic Cards */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white rounded-2xl shadow p-6 flex gap-5 items-center hover:shadow-lg transition">
          <div className="p-4 bg-red-100 text-red-600 rounded-xl">
            <FileWarning size={22}/>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Lost Reports</p>
            <h2 className="text-3xl font-bold text-gray-800">
              {stats.totalLost}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 flex gap-5 items-center hover:shadow-lg transition">
          <div className="p-4 bg-green-100 text-green-600 rounded-xl">
            <CheckCircle size={22}/>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Found Reports</p>
            <h2 className="text-3xl font-bold text-gray-800">
              {stats.totalFound}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 flex gap-5 items-center hover:shadow-lg transition">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
            <Archive size={22}/>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Unclaimed Items</p>
            <h2 className="text-3xl font-bold text-gray-800">
              {stats.totalUnclaimed}
            </h2>
          </div>
        </div>

      </div>

      {/* Uploads Management Section */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-6">

        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Archive size={20}/>
          Reports Management
        </h2>

        {/* Tabs */}
        <div className="flex gap-6 border-b">

          <button
            onClick={() => setActiveTab("found")}
            className={`pb-3 border-b-2 text-sm font-medium transition
              ${activeTab === "found"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-green-600"
              }`}
          >
            Found Items
          </button>

          <button
            onClick={() => setActiveTab("lost")}
            className={`pb-3 border-b-2 text-sm font-medium transition
              ${activeTab === "lost"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-500 hover:text-red-600"
              }`}
          >
            Lost Items
          </button>

        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-xl">

          <table className="w-full text-sm">

            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="p-4 text-left">Image</th>
                <th className="p-4 text-left">Item Name</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No items found
                  </td>
                </tr>
              )}

              {filteredItems.map(item => (

                <tr key={item.id}
                    className="border-b hover:bg-gray-50 transition">

                  <td className="p-4">
                    <img
                      src={item.image_path || "/placeholder.png"}
                      className="w-14 h-14 object-cover rounded-xl border"
                    />
                  </td>

                  <td className="p-4 font-medium">
                    {item.item_name}
                  </td>

                  <td className="p-4 capitalize text-gray-600">
                    {item.item_type || "N/A"}
                  </td>

                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold
                      ${
                        item.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : item.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : item.status === "claimed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }
                    `}>
                      {item.status || "unknown"}
                    </span>
                  </td>

                  <td className="p-4 flex gap-2 flex-wrap">

                    {item.status === "pending" && (
                      <button
                        onClick={() => handleAction(item.id,"verify")}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-1"
                      >
                        <CheckCircle size={14}/>
                        Verify
                      </button>
                    )}

                    {item.status !== "claimed" && (
                      <button
                        onClick={() => handleAction(item.id,"claimed")}
                        className="px-3 py-1 text-xs border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center gap-1"
                      >
                        <Archive size={14}/>
                        Claim
                      </button>
                    )}

                    <button
                      onClick={() => handleAction(item.id,"delete")}
                      className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-1"
                    >
                      <Trash2 size={14}/>
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}