import { useEffect, useState } from "react";
import { Search, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ReportDetails from "./ReportDetails";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("found");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Filter states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Fetch items based on type and filters
  const fetchItems = async (type) => {
    setLoading(true);
    setItems([]);
    try {
      const params = {};
      if (searchKeyword) params.search = searchKeyword;
      if (categoryFilter) params.category = categoryFilter;
      if (dateFilter) params.date = dateFilter;

      const res = await api.get(`/items/${type}`, { params });
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchItems(tab);
  };

  useEffect(() => {
    fetchItems(activeTab);
  }, [searchKeyword, categoryFilter, dateFilter]);

  useEffect(() => {
    fetchItems(activeTab);
  }, []);

  const capitalizeFirst = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <main className="flex-grow">
        {/* Search & Filters */}
        <div className="bg-gray-100 p-5 flex flex-col md:flex-row items-center justify-center gap-3 border-b">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search by keyword..."
              className="pl-10 pr-3 py-2 w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-200 transition"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 rounded-xl border w-full md:w-40"
          >
            <option value="">Select Category</option>
            <option value="electronics">Electronics</option>
            <option value="accessories">Accessories</option>
            <option value="documents">Documents</option>
            <option value="others">Others</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="p-2 rounded-xl border w-full md:w-32"
          />
        </div>

        {/* Report Buttons */}
        <div className="flex flex-col md:flex-row justify-center gap-6 p-8">
          <button
            onClick={() => navigate("/founditems")}
            className="flex items-center justify-center gap-2 bg-[#3A7CA5] hover:bg-[#32698C] text-white px-7 py-3 rounded-2xl shadow-md hover:-translate-y-0.5 transition duration-200"
          >
            <CheckCircle size={18}/> Report Found Item
          </button>
          <button
            onClick={() => navigate("/lostitems")}
            className="flex items-center justify-center gap-2 bg-[#7A1F1F] hover:bg-[#6A1A1A] text-white px-7 py-3 rounded-2xl shadow-md hover:-translate-y-0.5 transition duration-200"
          >
            <AlertTriangle size={18}/> Report Lost Item
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 mt-2">
          <div className="flex border-b">
            <button
              onClick={() => handleTabChange("found")}
              className={`px-5 py-3 font-semibold transition ${activeTab==="found" ? "text-[#3A7CA5] border-b-2 border-[#3A7CA5]" : "text-gray-600"}`}
            >
              Found Items
            </button>
            <button
              onClick={() => handleTabChange("lost")}
              className={`px-5 py-3 font-semibold transition ${activeTab==="lost" ? "text-red-700 border-b-2 border-red-700" : "text-gray-600"}`}
            >
              Lost Items
            </button>
          </div>
        </div>

        {/* Items Grid */}
        <div className="px-6 pb-12 mt-5">
          {loading && <p className="text-center text-gray-500">Loading items...</p>}
          <div className="grid md:grid-cols-4 gap-6">
            {!loading && items.length === 0 && (
              <p className="text-center text-gray-400 col-span-full">No items to display</p>
            )}
            {items.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-white p-5 rounded-2xl shadow-md flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer"
              >
                <div className="w-full h-40 bg-gray-200 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
                  {item.images?.length > 0 ? (
                    <img
                      src={`http://localhost:7002${item.images[0]}`}
                      alt={capitalizeFirst(item.item_name)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-gray-400 text-sm">No image</p>
                  )}
                </div>

                <p className="font-medium text-gray-700 text-center">
                  {capitalizeFirst(item.item_name)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        <ReportDetails
          show={selectedItem!==null}
          item={selectedItem}
          type={activeTab}
          onClose={() => setSelectedItem(null)}
        />
      </main>
    </div>
  );
}