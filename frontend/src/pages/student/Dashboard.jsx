import { useState } from "react";
import { Search, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LostAndFoundFrontend() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("found");

  const foundItems = [
    { name: "Umbrella" },
    { name: "Phone Charger" },
    { name: "Notebook" },
    { name: "Headset" },
  ];

  const lostItems = [
    { name: "Laptop" },
    { name: "Black Wallet" },
    { name: "Set of Keys" },
    { name: "Water Bottle" },
  ];

  const displayItems = activeTab === "found" ? foundItems : lostItems;

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

          <div className="grid md:grid-cols-4 gap-6">

            {displayItems.map((item, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-2xl shadow-md flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition duration-300"
              >
                <div className="w-24 h-24 bg-gray-200 rounded-xl mb-4"></div>

                <p className="font-medium text-gray-700">
                  {item.name}
                </p>
              </div>
            ))}

          </div>
        </div>

      </main>

    </div>
  );
}