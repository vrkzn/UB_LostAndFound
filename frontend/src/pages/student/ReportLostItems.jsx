import { useState } from "react";
import { Upload, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function LostItemPage() {

  const navigate = useNavigate();

  // Form States
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [dateLost, setDateLost] = useState("");
  const [locationLost, setLocationLost] = useState("");
  const [timeLost, setTimeLost] = useState("");
  const [claimTo, setClaimTo] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // File Validation
  // --------------------------------------------------

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);

    if (selected.length > 3) {
      setError("You can upload a maximum of 3 images.");
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg"];

    for (let file of selected) {
      if (!allowedTypes.includes(file.type)) {
        setError("Only PNG and JPEG images are allowed.");
        return;
      }
    }

    setError("");
    setFiles(selected);
  };

  // --------------------------------------------------
  // Submit Handler
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length > 3) {
      setError("You can upload a maximum of 3 images.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      files.forEach(file => {
        formData.append("images", file);
      });

      formData.append("item_name", itemName);
      formData.append("category", category);
      formData.append("date_lost", dateLost);
      formData.append("time_lost", timeLost);
      formData.append("location_lost", locationLost);
      formData.append("claim_to", claimTo);
      formData.append("description", description);
      formData.append("notes", notes || "");
      formData.append("isAnonymous", anonymous);

      const res = await api.post("/items/lost", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert(res.data.message || "Lost item reported successfully!");
      navigate("/dashboard");

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Error submitting lost item report"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-5xl p-8 rounded-2xl shadow-lg"
      >

        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>

          <h1 className="text-2xl font-bold text-gray-700">
            Report Lost Item
          </h1>
        </div>

        <p className="text-gray-500 mb-6">
          Fill in the details of the lost item
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">

          {/* Item Name */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">
              Lost Item <span className="text-red-600">*</span>
            </label>
            <input
              required
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              placeholder="Enter item name"
              className="p-3 border rounded-xl focus:ring-2 focus:ring-red-200 outline-none"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              required
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="p-3 border rounded-xl text-gray-700"
            >
              <option value="" disabled>Select Category</option>
              <option value="electronics">Electronics</option>
              <option value="accessories">Accessories</option>
              <option value="documents">Documents</option>
              <option value="others">Others</option>
            </select>
          </div>

          {/* Date Lost */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">
              Date Lost <span className="text-red-600">*</span>
            </label>
            <input
              required
              type="date"
              value={dateLost}
              onChange={e => setDateLost(e.target.value)}
              className="p-3 border rounded-xl"
            />
          </div>

          {/* Time Lost */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">
              Time Lost <span className="text-red-600">*</span>
            </label>
            <input
              required
              type="time"
              value={timeLost}
              onChange={e => setTimeLost(e.target.value)}
              className="p-3 border rounded-xl"
            />
          </div>

          {/* Location Lost */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">
              Location Lost <span className="text-red-600">*</span>
            </label>
            <input
              required
              value={locationLost}
              onChange={e => setLocationLost(e.target.value)}
              placeholder="Where was the item lost?"
              className="p-3 border rounded-xl"
            />
          </div>

          {/* Claim To */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">
              Claim To <span className="text-red-600">*</span>
            </label>
            <input
              required
              value={claimTo}
              onChange={e => setClaimTo(e.target.value)}
              placeholder="Person/where to claim the item"
              className="p-3 border rounded-xl"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="font-medium text-gray-700">
              Item Description <span className="text-red-600">*</span>
            </label>
            <textarea
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Item description"
              className="p-3 border rounded-xl h-28"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="font-medium text-gray-700">
              Notes<span className="text-red-600">*</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="eg.,Detailed notes about how you lost the item, contanct info, etc.,"
              className="p-3 border rounded-xl h-24"
            />
          </div>

          {/* Upload Images */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <label className="font-medium text-gray-700">
              Upload Pictures (Max 3)
            </label>

            <label className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 transition">

              <Upload size={60} className="text-gray-400" />

              <p className="text-gray-500 text-sm text-center">
                Click or drag images here to upload<br/>
                PNG or JPEG only — maximum 3 images
              </p>

              <input
                type="file"
                multiple
                accept="image/png, image/jpeg"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="text-sm text-gray-500">
                {files.length} file(s) selected
              </div>
            </label>
          </div>

          {/* Anonymous */}
          <div className="md:col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={() => setAnonymous(!anonymous)}
              className="w-4 h-4 accent-[#5B0000]"
            />
            <span className="text-gray-700">
              Report anonymously
            </span>
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5B0000] hover:bg-[#7A0000] text-white p-3 rounded-xl shadow-md transition disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Lost Item Report"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}