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

const handleAction = async (id, action, currentStatus) => {

  let promptMessage = "";

  if (action === "verify") {
    promptMessage = currentStatus === "approved"
      ? "Are you sure you want to unverify this report?"
      : "Are you sure you want to verify this report?";
  }

  else if (action === "claimed") {
    promptMessage = currentStatus === "claimed"
      ? "Are you sure you want to mark this item as unclaimed?"
      : "Are you sure you want to mark this item as claimed?";
  }

  else if (action === "delete") {
    promptMessage = "Are you sure you want to permanently delete this report?";
  }

  if (!window.confirm(promptMessage)) return;

  try {
    await api.post(`/admin/items/${id}/${action}`);

    alert(
      action === "verify"
        ? (currentStatus === "approved"
            ? "Report unverified successfully."
            : "Report verified successfully.")
      : action === "claimed"
        ? (currentStatus === "claimed"
            ? "Item marked as unclaimed."
            : "Item marked as claimed.")
      : "Report deleted successfully."
    );

    fetchDashboard();

  } catch (err) {
    console.error(err);
    alert("Action failed. Please try again.");
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
  return items.filter(item => {

    const matchType =
      activeTab === "all" ||
      item.item_type === activeTab;

    const matchSearch =
      item.item_name
        ?.toLowerCase()
        .includes(search.toLowerCase());

    return matchType && matchSearch;

  });
}, [items, activeTab, search]);

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

        <div className="flex flex-wrap justify-between gap-4 items-center">

          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Archive size={22}/>
            Reports Management
          </h2>

          <SearchBar search={search} setSearch={setSearch}/>
        </div>

        {/* TABS */}
        <div className="flex gap-12 border-b text-base font-medium">
          <TabButton
            label="All Items"
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
            activeColor="border-green-600 text-green-600"
          />
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
  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 w-full md:w-96 focus-within:ring-2 focus-within:ring-blue-400/30 transition">
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
      pb-4 border-b-2 text-base transition-all duration-200 font-medium
      ${active ? activeColor : "border-transparent text-gray-500 hover:text-gray-700"}
    `}
  >
    {label}
  </button>
);

/*
=====================================================
 PREMIUM CLEAN FEED CARD VIEW (NO INTERNAL LINES)
=====================================================
*/

const TableView = ({ items, handleAction }) => {

  if (!items.length) {
    return (
      <div className="p-20 text-center text-gray-400">
        <Archive size={60} className="mx-auto opacity-30" />
        <p className="mt-4 text-lg font-medium">
          No reports found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {items.map(item => {

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
          <div
            key={`${item.item_type}-${item.id}`}
            className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 hover:shadow-2xl transition duration-300 overflow-hidden border border-gray-100"
          >

            {/* HEADER */}
            <div className="flex justify-between items-start p-6">

              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {item.item_name}
                </h3>

                <p className="text-xs text-gray-400 capitalize flex gap-2">
                  <span>{item.item_type}</span>
                  <span>•</span>
                  <span>Reported {formattedDate} {formattedTime}</span>
                </p>
              </div>

              <StatusBadge status={item.status} />

            </div>

            {/* CONTENT */}
            <div className="px-6 pb-6 space-y-6">

              <div className="flex gap-6 flex-wrap">

                {/* IMAGE */}
                <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-sm border flex-shrink-0">
                  <img
                    src={`http://localhost:7002${item.image_path}`}
                    alt={item.item_name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>

                {/* DETAILS GRID */}
                <div className="grid md:grid-cols-2 gap-4 text-sm flex-1">

                  <DetailBlock
                    title="Description"
                    value={item.description || "No description"}
                  />

                  <DetailBlock
                    title="Notes"
                    value={item.notes || "No notes"}
                  />

<DetailBlock
  title="Location"
  value={
    item.location_found ||
    item.location_lost ||
    item.location ||
    "Not specified"
  }
/>

                  <DetailBlock
                    title="Claim / Surrender To"
                    value={item.claim_to || "Not specified"}
                  />

                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="p-6 bg-gray-50 flex justify-end flex-wrap gap-3">

              {(item.status === "approved" || item.status === "pending") && (
                <ActionButton
                  label={item.status === "approved" ? "Unverify" : "Verify"}
                  color="bg-green-600 text-white"
                  onClick={() =>
                    handleAction(item.id, "verify", item.status)
                  }
                />
              )}

              <ActionButton
                label={item.status === "claimed" ? "Unclaim" : "Claim"}
                color="border border-blue-600 text-blue-600"
                outline
                onClick={() =>
                  handleAction(item.id, "claimed", item.status)
                }
              />

              <ActionButton
                label="Delete"
                color="bg-red-600 text-white"
                onClick={() =>
                  handleAction(item.id, "delete")}
              />

            </div>
          </div>
        );
      })}
    </div>
  );
};

/*
=====================================================
 DETAIL BLOCK COMPONENT
=====================================================
*/

const DetailBlock = ({ title, value }) => (
  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 hover:bg-gray-100 transition">
    <p className="text-xs text-gray-400 mb-1">{title}</p>
    <p className="text-sm text-gray-700 font-medium leading-relaxed">
      {value}
    </p>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    claimed: "bg-blue-100 text-blue-700"
  };

  return (
    <span className={`px-3 py-1 text-small rounded-full font-semibold ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status || "unknown"}
    </span>
  );
};

const ActionButton = ({ label, color, onClick, outline }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 text-xs rounded-xl shadow-sm hover:shadow-md transition font-medium
      ${outline ? color : color + " hover:opacity-90"}
    `}
  >
    {label}
  </button>
);