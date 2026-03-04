import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { FileWarning, CheckCircle, Archive, Search } from "lucide-react";

/*
=====================================================
 PREMIUM ADMIN DASHBOARD UI
=====================================================
*/

export default function AdminDashboard() {

  const [stats, setStats] = useState({
    totalLost: 0,
    totalFound: 0,
    totalUnclaimed: 0
  });

  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("found");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /*
  =====================================================
  FETCH DASHBOARD DATA
  =====================================================
  */

  const fetchDashboard = async () => {
    try {

      const res = await api.get("/admin/dashboard");

      setStats(res.data.stats || {
        totalLost: 0,
        totalFound: 0,
        totalUnclaimed: 0
      });

      let fetchedItems = res.data.items || [];

      // Sort newest → oldest
      fetchedItems.sort(
        (a, b) =>
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
      );

      setItems(fetchedItems);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================================
  ACTION HANDLER
  =====================================================
  */

  const handleAction = async (id, action) => {
    try {
      await api.post(`/admin/items/${id}/${action}`);
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /*
  =====================================================
  FILTER LOGIC
  =====================================================
  */

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.item_type === activeTab &&
      item.item_name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, activeTab, search]);

  /*
  =====================================================
  LOADING STATE
  =====================================================
  */

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="animate-pulse space-y-6">

          <div className="h-10 w-64 bg-gray-200 rounded-xl"></div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  /*
  =====================================================
  MAIN UI
  =====================================================
  */

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 space-y-8">

      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Dashboard Overview
        </h1>

        <p className="text-gray-500 text-sm max-w-xl leading-relaxed">
          Lost and Found Management System Administration Panel
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid md:grid-cols-3 gap-6">

        <StatCard
          title="Total Lost Reports"
          value={stats.totalLost}
          icon={<FileWarning/>}
          color="from-red-50 to-red-100 text-red-600"
        />

        <StatCard
          title="Total Found Reports"
          value={stats.totalFound}
          icon={<CheckCircle/>}
          color="from-green-50 to-green-100 text-green-600"
        />

        <StatCard
          title="Unclaimed Items"
          value={stats.totalUnclaimed}
          icon={<Archive/>}
          color="from-blue-50 to-blue-100 text-blue-600"
        />

      </div>

      {/* MANAGEMENT PANEL */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-8 space-y-6">

        {/* TITLE + SEARCH */}
        <div className="flex flex-wrap justify-between gap-4 items-center">

          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Archive size={20}/>
            Reports Management
          </h2>

          <SearchBar search={search} setSearch={setSearch}/>
        </div>

        {/* TABS */}
        <div className="flex gap-8 border-b text-sm font-medium">

          <TabButton
            label="Found Items"
            active={activeTab === "found"}
            onClick={() => setActiveTab("found")}
            activeColor="border-green-600 text-green-600"
          />

          <TabButton
            label="Lost Items"
            active={activeTab === "lost"}
            onClick={() => setActiveTab("lost")}
            activeColor="border-red-600 text-red-600"
          />

        </div>

        {/* TABLE */}
        <TableView
          items={filteredItems}
          handleAction={handleAction}
        />

      </div>
    </div>
  );
}

/*
=====================================================
 COMPONENTS
=====================================================
*/

const StatCard = ({ title, value, icon, color }) => (
  <div className={`
    bg-gradient-to-br ${color}
    rounded-2xl p-7
    shadow-md hover:-translate-y-1 transition duration-300
  `}>
    <p className="text-sm text-gray-500 flex items-center gap-2">
      {icon}
      {title}
    </p>

    <h3 className="text-4xl font-bold mt-3">
      {value}
    </h3>
  </div>
);

const SearchBar = ({ search, setSearch }) => (
  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-full md:w-80 focus-within:ring-2 focus-within:ring-blue-400/30 transition">
    <Search size={18} className="text-gray-400"/>
    <input
      placeholder="Search reports..."
      value={search}
      onChange={e => setSearch(e.target.value)}
      className="bg-transparent outline-none text-sm w-full"
    />
  </div>
);

const TabButton = ({ label, active, onClick, activeColor }) => (
  <button
    onClick={onClick}
    className={`
      pb-3 border-b-2 transition-all duration-200
      ${active ? activeColor : "border-transparent text-gray-500 hover:text-gray-700"}
    `}
  >
    {label}
  </button>
);

const TableView = ({ items, handleAction }) => (
  <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">

    <table className="w-full text-sm">

      <thead className="bg-gray-50 text-gray-500 uppercase text-xs sticky top-0">
        <tr>
          <th className="p-4 text-left">Image</th>
          <th className="p-4 text-left">Item Name</th>
          <th className="p-4 text-left">Status</th>
          <th className="p-4 text-left">Reported</th>
          <th className="p-4 text-left">Actions</th>
        </tr>
      </thead>

      <tbody>

        {items.length === 0 && (
          <tr>
            <td colSpan={5} className="p-10 text-center text-gray-400">
              <Archive size={40} className="mx-auto opacity-30"/>
              <p className="mt-2">No reports found</p>
            </td>
          </tr>
        )}

        {items.map(item => {

          /* ===============================
             Date Formatting
          =============================== */

          const dateObj = item.created_at
            ? new Date(item.created_at)
            : null;

          const formattedDate = dateObj
            ? dateObj.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })
            : "N/A";

          const formattedTime = dateObj
            ? dateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit"
              })
            : "";

          return (
            <tr
              key={item.id}
              className="border-b border-gray-100 hover:bg-gray-50/80 transition"
            >

              {/* IMAGE */}
              <td className="p-4">
                <img
                  src={item.image_path || "/placeholder.png"}
                  className="w-14 h-14 object-cover rounded-xl border border-gray-200"
                  alt={item.item_name}
                />
              </td>

              {/* ITEM DETAILS */}
              <td className="p-4 font-medium text-gray-800">

                <div>{item.item_name}</div>

              </td>

              {/* STATUS */}
              <td className="p-4">
                <StatusBadge status={item.status}/>
              </td>

              {/* DATE + TIME */}
              <td className="p-4 text-gray-500 text-xs leading-relaxed">

                <div>{formattedDate}</div>

                <div className="text-gray-300 text-[11px]">
                  {formattedTime}
                </div>

              </td>

              {/* ACTIONS */}
              <td className="p-4 flex gap-2 flex-wrap">

                {item.status === "pending" && (
                  <ActionButton
                    label="Verify"
                    color="bg-green-600 text-white"
                    onClick={() => handleAction(item.id,"verify")}
                  />
                )}

                {item.status !== "claimed" && (
                  <ActionButton
                    label="Claim"
                    color="border border-blue-600 text-blue-600"
                    outline
                    onClick={() => handleAction(item.id,"claimed")}
                  />
                )}

                <ActionButton
                  label="Delete"
                  color="bg-red-600 text-white"
                  onClick={() => handleAction(item.id,"delete")}
                />

              </td>

            </tr>
          );
        })}

      </tbody>
    </table>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    claimed: "bg-blue-100 text-blue-700"
  };

  return (
    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status || "unknown"}
    </span>
  );
};

const ActionButton = ({ label, color, onClick, outline }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1 text-xs rounded-xl shadow-sm hover:shadow-md transition font-medium
      ${outline ? color : color + " hover:opacity-90"}
    `}
  >
    {label}
  </button>
);