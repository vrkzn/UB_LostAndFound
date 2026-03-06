import { useEffect, useState } from "react";
import { Search, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ReportDetails from "./ReportDetails";

export default function LostAndFoundFrontend() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("found");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchItems = async (type) => {
    try {

        setLoading(true);

const res = await api.get(`/items/${type}`);

        setItems(res.data);
        console.log("Fetched Items:", res.data);

    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    fetchItems(activeTab);
}, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">

      <main className="flex-grow">

        {/* Search Section */}
        <div className="bg-gray-100 p-5 flex flex-col md:flex-row items-center justify-center gap-3 border-b">

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              placeholder="Search by keyword..."
              className="pl-10 pr-3 py-2 w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-200 transition"
            />
          </div>

          <select className="p-2 rounded-xl border w-full md:w-40">
            <option>Category</option>
          </select>

          <select className="p-2 rounded-xl border w-full md:w-32">
            <option>Date</option>
          </select>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center gap-6 p-8">

          <button
            onClick={() => navigate("/founditems")}
            className="flex items-center justify-center gap-2 bg-[#3A7CA5] hover:bg-[#32698C] text-white px-7 py-3 rounded-2xl shadow-md hover:-translate-y-0.5 transition duration-200"
          >
            <CheckCircle size={18} />
            Report Found Item
          </button>

          <button
            onClick={() => navigate("/lostitems")}
            className="flex items-center justify-center gap-2 bg-[#7A1F1F] hover:bg-[#6A1A1A] text-white px-7 py-3 rounded-2xl shadow-md hover:-translate-y-0.5 transition duration-200"
          >
            <AlertTriangle size={18} />
            Report Lost Item
          </button>

        </div>

        {/* Tabs Section */}
        <div className="px-6 mt-2">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("found")}
              className={`px-5 py-3 font-semibold transition ${
                activeTab === "found"
                  ? "text-[#3A7CA5] border-b-2 border-[#3A7CA5]"
                  : "text-gray-600"
              }`}
            >
              Found Items
            </button>

            <button
              onClick={() => setActiveTab("lost")}
              className={`px-5 py-3 font-semibold transition ${
                activeTab === "lost"
                  ? "text-red-700 border-b-2 border-red-700"
                  : "text-gray-600"
              }`}
            >
              Lost Items
            </button>

          </div>
        </div>

        {/* Items Grid */}
<div className="px-6 pb-12 mt-5">
    {loading && <p className="text-center text-gray-500">Loading items...</p>}

    <div className="grid md:grid-cols-4 gap-6">

        {items.map((item) => (
<div
    key={item.id}
    onClick={() => setSelectedItem(item)}
    className="bg-white p-5 rounded-2xl shadow-md flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer"
>

<div className="w-full h-40 bg-gray-200 rounded-xl mb-4 overflow-hidden flex items-center justify-center">

    {item.image_path && (
        <img
            src={`http://localhost:7002${item.image_path}`}
            alt={item.item_name}
            className="w-full h-full object-cover"
        />
    )}

</div>

                <p className="font-medium text-gray-700 text-center">
                    {item.item_name}
                </p>

            </div>
        ))}

    </div>
</div>

<ReportDetails
  show={selectedItem !== null}
  item={selectedItem}
  onClose={() => setSelectedItem(null)}
/>
      </main>

    </div>
  );
}