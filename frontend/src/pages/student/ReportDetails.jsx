import { X, Calendar, MapPin, User, Tag, Clipboard } from "lucide-react";

function ReportDetails({ show, onClose, item, type }) {
  if (!show || !item) return null;

  const formatDateTime = (datetime) => {
    if (!datetime) return "N/A";
    return new Date(datetime.replace(" ", "T")).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const dateLabel = type === "found" ? "Date Found" : "Date Lost";
  const locationLabel = type === "found" ? "Location Found" : "Location Lost";

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const capitalizeFirst = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto animate-slide-in">

    {/* Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
      <h2 className="text-2xl font-bold text-gray-900">
        {type === "found" ? "Found Item Details" : "Lost Item Details"}
      </h2>

      <button
        onClick={onClose}
        className="hover:bg-gray-100 p-2 rounded-full transition self-start sm:self-auto"
      >
        <X size={22} />
      </button>
    </div>

    {/* Reported By */}
    <div className="flex items-center gap-2 mb-4">
      <User size={20} className="text-gray-500" />
      <p className="text-gray-800">
        <span className="font-semibold">Reported By:</span>{" "}
        {item.isAnonymous
          ? "Anonymous"
          : capitalizeFirst(item.uploader_name) || "N/A"}
      </p>
    </div>

{/* Divider */}
<div className="border-b border-gray-200 mb-6"></div>

        {/* Images */}
        {item.images && item.images.length > 0 && (
          <div className="mb-6 flex gap-3 justify-center">
            {item.images.map((img, idx) => (
              <div
                key={idx}
                className={`rounded-xl overflow-hidden shadow-lg ${
                  item.images.length === 1
                    ? "w-full max-w-lg"
                    : item.images.length === 2
                    ? "w-1/2"
                    : "w-1/3"
                }`}
              >
                <img
                  src={`http://localhost:7002${img}`}
                  alt={`${item.item_name} ${idx + 1}`}
                  className="w-full h-64 object-contain"
                />
              </div>
            ))}
          </div>
        )}

        {/* Core Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
          <div className="flex items-center gap-2">
            <Tag size={20} className="text-gray-500" />
            <span className="font-semibold text-gray-800">Item Name:</span>
            <span>{capitalizeFirst(item.item_name) || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clipboard size={20} className="text-gray-500" />
            <span className="font-semibold text-gray-800">Category:</span>
            <span>{capitalizeFirst(item.category) || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-500" />
            <span className="font-semibold text-gray-800">{dateLabel}:</span>
            <span>{formatDateTime(item.datetime_value)}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-gray-500" />
            <span className="font-semibold text-gray-800">{locationLabel}:</span>
            <span>{capitalizeFirst(item.location) || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-500" />
            <span className="font-semibold text-gray-800">Reported At:</span>
            <span>{formatDateTime(item.created_at)}</span>
          </div>

          <div className="flex items-center gap-2">
            <User size={20} className="text-gray-500" />
            <span className="font-semibold text-gray-800">Claim To:</span>
            <span>{capitalizeFirst(item.claim_to) || "N/A"}</span>
          </div>
        </div>

        {/* Description & Notes */}
        <div className="mt-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600">
              {capitalizeFirst(item.description) || "No description"}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
            <p className="text-gray-600">
              {capitalizeFirst(item.notes) || "N/A"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ReportDetails;