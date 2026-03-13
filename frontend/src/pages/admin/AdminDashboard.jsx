import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { FileWarning, CheckCircle, Archive, Search } from "lucide-react";
import ClaimModal from "./ClaimModal";

/* =====================================================
   PREMIUM ADMIN DASHBOARD UI
===================================================== */

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalLost: 0,
    totalFound: 0,
    totalUnclaimed: 0
  });
  

  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // CLAIM MODAL STATE
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimItem, setClaimItem] = useState(null);
  const [claimedBy, setClaimedBy] = useState("");
  const [claimedDate, setClaimedDate] = useState("");
  const [claimedTime, setClaimedTime] = useState("");

  /* =====================================================
     FETCH DASHBOARD DATA
  ===================================================== */
  const fetchDashboard = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setStats(res.data.stats || { totalLost: 0, totalFound: 0, totalUnclaimed: 0 });
      let fetchedItems = res.data.items || [];
      fetchedItems.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
      setItems(fetchedItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     HANDLE ACTIONS (VERIFY, CLAIMED, DELETE)
  ===================================================== */
  const handleAction = async (id, action, currentStatus) => {
if (action === "claimed") {
    const item = items.find(i => i.id === id);

    if (currentStatus === "claimed") {
      if (!window.confirm("Mark this item as unclaimed?")) return;

      try {
        await api.post(`/admin/items/${id}/claimed`, {
          claimed_by: null,
          claim_datetime: null,
        });
        fetchDashboard();
      } catch (err) {
        console.error(err);
        alert("Failed to unclaim item.");
      }
      return;
    }

    setClaimItem(item);
    setShowClaimModal(true);
    return;
  }


    let promptMessage = "";
    if (action === "verify") {
      promptMessage = currentStatus === "approved"
        ? "Are you sure you want to unverify this report?"
        : "Are you sure you want to verify this report?";
    } else if (action === "delete") {
      promptMessage = "Are you sure you want to permanently delete this report?";
    }

    if (!window.confirm(promptMessage)) return;

    try {
      await api.post(`/admin/items/${id}/${action}`);
      alert(
        action === "verify"
          ? (currentStatus === "approved" ? "Report unverified successfully." : "Report verified successfully.")
          : "Report deleted successfully."
      );
      fetchDashboard();
    } catch (err) {
      console.error(err);
      alert("Action failed. Please try again.");
    }
  };

  /* =====================================================
     SUBMIT CLAIM
  ===================================================== */
const submitClaim = async () => {
  if (!claimedBy || !claimedDate || !claimedTime) {
    alert("Please complete all fields.");
    return;
  }

  try {
    await api.post(`/admin/items/${claimItem.id}/claimed`, {
      claimed_by: claimedBy,
      claim_datetime: `${claimedDate} ${claimedTime}`,
    });
    alert("Item claimed successfully!");
    setShowClaimModal(false);
    setClaimedBy(""); setClaimedDate(""); setClaimedTime(""); setClaimItem(null);
    fetchDashboard();
  } catch (err) {
    console.error(err);
    alert("Failed to claim item.");
  }
};

  useEffect(() => { fetchDashboard(); }, []);

  /* =====================================================
     FILTER LOGIC
  ===================================================== */
/* =====================================================
   FILTER LOGIC
===================================================== */
const filteredItems = useMemo(() => {
  return items.filter(item => {
    let matchType = false;

    if (activeTab === "all") matchType = true;
    else if (activeTab === "found") matchType = item.item_type === "found" && item.status !== "claimed";
    else if (activeTab === "lost") matchType = item.item_type === "lost" && item.status !== "claimed";
    else if (activeTab === "claimed") matchType = item.status === "claimed";

    const matchSearch = item.item_name?.toLowerCase().includes(search.toLowerCase());

    return matchType && matchSearch;
  });
}, [items, activeTab, search]);

/* =====================================================
   TAB COUNTS
===================================================== */
const tabCounts = useMemo(() => {
  const counts = { all: 0, found: 0, lost: 0, claimed: 0 };

  items.forEach(item => {
    counts.all += 1;
    if (item.item_type === "found" && item.status !== "claimed") counts.found += 1;
    if (item.item_type === "lost" && item.status !== "claimed") counts.lost += 1;
    if (item.status === "claimed") counts.claimed += 1;
  });

  return counts;
}, [items]);
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 space-y-8">

      {/* HEADER */}
      <Header />

      {/* STATS GRID */}
<div className="grid md:grid-cols-4 gap-6">
  <StatCard
    title="Total Lost Reports"
    value={stats.totalLost}
    icon={<FileWarning />}
    color="from-red-50 to-red-100 text-red-600"
  />
  <StatCard
    title="Total Found Reports"
    value={stats.totalFound}
    icon={<CheckCircle />}
    color="from-green-50 to-green-100 text-green-600"
  />
  <StatCard
    title="Unclaimed Items"
    value={stats.totalUnclaimed}
    icon={<Archive />}
    color="from-blue-50 to-blue-100 text-blue-600"
  />
  <StatCard
    title="Claimed Items"
    value={stats.totalClaimed}
    icon={<CheckCircle />}
    color="from-indigo-50 to-indigo-100 text-indigo-600"
  />
</div>

      {/* MANAGEMENT PANEL */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-8 space-y-6">
        <div className="flex flex-wrap justify-between gap-4 items-center">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Archive size={22} /> Reports Management
          </h2>
          <SearchBar search={search} setSearch={setSearch} />
        </div>

        {/* TABS */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabCounts={tabCounts} />

        <TableView items={filteredItems} handleAction={handleAction} />
      </div>

      {/* CLAIM MODAL */}
<ClaimModal
  show={showClaimModal}
  onClose={() => {
    setShowClaimModal(false);
    setClaimItem(null);
  }}
  itemName={claimItem?.item_name}
  onSubmit={async ({ claimed_by, claim_datetime }) => {
    if (!claimed_by || !claim_datetime) {
      alert("Please complete all fields.");
      return;
    }

    // Split date/time
    const [date, time] = claim_datetime.split(" ");

    try {
      await api.post(`/admin/items/${claimItem.id}/claimed`, {
        claimed_by,
        claim_datetime: claim_datetime,
      });

      alert("Item marked as claimed!");
      setShowClaimModal(false);
      setClaimItem(null);

      // Refresh dashboard
      fetchDashboard();
    } catch (err) {
      console.error(err);
      alert("Failed to claim item.");
    }
  }}
/>
    </div>
  );
}

/* =====================================================
   COMPONENTS
===================================================== */

const LoadingSkeleton = () => (
  <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100">
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-64 bg-gray-200 rounded-xl"></div>
      <div className="grid md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
      </div>
    </div>
  </div>
);

const Header = () => (
  <div className="space-y-2">
    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
    <p className="text-gray-500 text-sm max-w-xl leading-relaxed">
      Lost and Found Management System Administration Panel
    </p>
  </div>
);

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-7 shadow-md hover:-translate-y-1 transition duration-300`}>
    <p className="text-sm text-gray-500 flex items-center gap-2">{icon}{title}</p>
    <h3 className="text-4xl font-bold mt-3">{value}</h3>
  </div>
);

const SearchBar = ({ search, setSearch }) => (
  <div className="flex items-center gap-3 bg-gray-50 border border-black-1500 rounded-xl px-5 py-3 w-full md:w-96 focus-within:ring-2 focus-within:ring-blue-400/30 transition">
    <Search size={18} className="text-gray-400"/>
    <input placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent outline-none text-sm w-full"/>
  </div>
);

const Tabs = ({ activeTab, setActiveTab, tabCounts }) => (
  <div className="flex gap-12 border-b text-base font-medium">
    {["all", "found", "lost", "claimed"].map(tab => (
      <TabButton
        key={tab}
        label={
          tab === "all" ? `All Items (${tabCounts.all})` :
          tab === "found" ? `Found Items (${tabCounts.found})` :
          tab === "lost" ? `Lost Items (${tabCounts.lost})` :
          `Claimed Items (${tabCounts.claimed})`
        }
        active={activeTab === tab}
        onClick={() => setActiveTab(tab)}
        activeColor={
          tab === "lost" ? "border-red-600 text-red-600" :
          tab === "found" ? "border-green-600 text-green-600" :
          tab === "claimed" ? "border-blue-600 text-blue-600" :
          "border-gray-600 text-gray-600"
        }
      />
    ))}
  </div>
);

const TabButton = ({ label, active, onClick, activeColor }) => (
  <button onClick={onClick} className={`pb-4 border-b-2 text-base transition-all duration-200 font-medium ${active ? activeColor : "border-transparent text-gray-500 hover:text-gray-700"}`}>
    {label}
  </button>
);

const TableView = ({ items, handleAction }) => {
  if (!items.length) return (
    <div className="p-20 text-center text-gray-400">
      <Archive size={60} className="mx-auto opacity-30"/>
      <p className="mt-4 text-lg font-medium">No reports found</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {items.map(item => {
        const dateObj = item.created_at ? new Date(item.created_at) : null;
        const formattedDate = dateObj ? dateObj.toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric"}) : "N/A";
        const formattedTime = dateObj ? dateObj.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) : "";

        return (
          <div key={`${item.item_type}-${item.id}`} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition duration-300 overflow-hidden">
            <div className="flex justify-between items-start p-6 border-b border-gray-300">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">{item.item_name}</h3>
                <p className="text-sm text-gray-600 font-medium">Reported by: {item.reporter_name || "Anonymous"}</p>
                <div className="flex items-center gap-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${item.item_type==="found"?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>{item.item_type}</span>
                  <span className="text-gray-400">{item.item_type==="found"?"Found":"Lost"} {formattedDate} | {formattedTime}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={item.status} />
                <p className="text-xs text-gray-400">Reported {formattedDate} | {formattedTime}</p>

                {/* Claimed Details (if item is claimed) */}
                {item.status === "claimed" && (
                  <div className="text-xs text-blue-600 mt-1 text-right">
                    <p>Claimed By: {item.claimed_by || "Unknown"}</p>
                    <p>
                      Claimed Date:{" "}
                      {item.claim_datetime
                        ? new Date(item.claim_datetime).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "N/A"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 flex gap-6 flex-wrap">
              <div className="w-70 h-70 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0 shadow-sm hover:shadow-md transition">
                <img src={`http://localhost:7002${item.image_path}`} alt={item.item_name} className="w-full h-full object-cover hover:scale-150 transition duration-300"/>
              </div>

              <div className="flex-1 space-y-6 text-sm">
                <div className="grid md:grid-cols-2 gap-6">
                  <DetailBlock title="Description" value={item.description || "No description"} large />
                  <DetailBlock title="Notes" value={item.notes || "No notes"} large />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <DetailBlock title={item.item_type==="found"?"Location Found":"Location Lost"} value={item.location_found || item.location_lost || item.location || "Not specified"} />
                  <DetailBlock title={item.item_type==="found"?"Claim To":"Surrender To"} value={item.claim_to || "Not specified"} />
                </div>
              </div>
            </div>
            

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
              {(item.status==="approved" || item.status==="pending") && (
                <ActionButton label={item.status==="approved"?"Unverify":"Verify"} color="bg-green-600 text-white hover:bg-green-700" onClick={() => handleAction(item.id,"verify",item.status)} />
              )}

              <ActionButton
                label={item.status==="claimed"?"Unclaim":"Claim"}
                color="border border-blue-600 text-blue-600 hover:bg-blue-50"
                outline
                onClick={() => handleAction(item.id,"claimed",item.status,item.item_type)}
              />

              <ActionButton label="Delete" color="bg-red-600 text-white hover:bg-red-700" onClick={() => handleAction(item.id,"delete")} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DetailBlock = ({ title, value, large }) => (
  <div className={`bg-gray-50 border border-black/20 rounded-xl flex flex-col transition hover:bg-gray-100 ${large?"min-h-[160px] p-5":"p-4"}`}>
    <p className="text-sm font-bold text-gray-900 mb-3">{title}</p>
    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap flex-1">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    claimed: "bg-blue-100 text-blue-700"
  };
  const labels = {
    approved: "Approved",
    pending: "Pending",
    claimed: "Claimed"
  };
  return (
    <span className={`px-3 py-1 text-sm rounded-full font-semibold ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {labels[status] || "Unknown"}
    </span>
  );
};

const ActionButton = ({ label, color, onClick, outline }) => (
  <button onClick={onClick} className={`px-4 py-2 text-xs rounded-xl shadow-sm hover:shadow-md transition font-medium ${outline?color:color+" hover:opacity-90"}`}>{label}</button>
);