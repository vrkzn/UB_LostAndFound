import { X } from "lucide-react";


function ReportDetails({ show, onClose, item }) {


  if (!show || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">

      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 max-h-[85vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Found Item Details
          </h2>

          <button
            onClick={onClose}
            className="hover:bg-gray-200 p-1 rounded-lg transition"
          >
            <X size={18}/>
          </button>
        </div>

        {/* Image */}
        {item.image_path && (
          <img
            src={`http://localhost:7002${item.image_path}`}
            alt={item.item_name}
            className="w-full h-60 object-cover rounded-xl mb-4"
          />
        )}

        {/* Details Grid */}
        <div className="space-y-3 text-gray-700 text-sm">

          <p><span className="font-semibold">Item Name:</span> {item.item_name || "N/A"}</p>

          <p><span className="font-semibold">Category:</span> {item.category || "N/A"}</p>

<p>
  <span className="font-semibold">Date Found:</span>{" "}
  {item.datetime_value
    ? new Date(item.datetime_value.replace(" ", "T")).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    : "N/A"}
</p>

<p>
  <span className="font-semibold">Location Found:</span>{" "}
  {item.location || "N/A"}
</p>

          <p>
            <span className="font-semibold">Claim To:</span>{" "}
            {item.claim_to || "N/A"}
          </p>

          <p>
            <span className="font-semibold">Description:</span>{" "}
            {item.description || "No description"}
          </p>

          <p>
            <span className="font-semibold">Notes:</span>{" "}
            {item.notes || "N/A"}
          </p>

          <p>
            <span className="font-semibold">Reported by</span>{" "}
            {item.isAnonymous ? "Yes" : "No"}
          </p>

          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span className={`px-2 py-1 rounded-lg text-xs ${
              item.status === "approved"
                ? "bg-green-100 text-green-700"
                : item.status === "claimed"
                ? "bg-blue-100 text-blue-700"
                : "bg-yellow-100 text-yellow-700"
            }`}>
              {item.status || "pending"}
            </span>
          </p>

          <p>
            <span className="font-semibold">Created At:</span>{" "}
            {item.created_at
            ? new Date(item.created_at).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
                })
            : "N/A"}
          </p>

        </div>

      </div>
    </div>
  );
}

export default ReportDetails;