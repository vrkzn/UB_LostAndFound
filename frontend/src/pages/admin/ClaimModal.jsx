import { useState, useEffect } from "react";

export default function ClaimModal({ show, onClose, onSubmit, itemName }) {
  const [claimedBy, setClaimedBy] = useState("");
  const [claimDate, setClaimDate] = useState("");
  const [claimTime, setClaimTime] = useState("");

  // Reset fields when modal opens
  useEffect(() => {
    if (show) {
      setClaimedBy("");
      setClaimDate("");
      setClaimTime("");
    }
  }, [show]);

  if (!show) return null;

  const handleSubmit = () => {
    // Trim values to avoid whitespace issues
    if (!claimedBy.trim() || !claimDate || !claimTime) {
      alert("Please complete all fields.");
      return;
    }

    const claim_datetime = `${claimDate} ${claimTime}`;
    onSubmit({ claimed_by: claimedBy.trim(), claim_datetime });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
        <h2 className="text-xl font-bold">Claim Item: {itemName}</h2>

        <div className="flex flex-col gap-2">
          <label className="font-medium">Claimed By:</label>
          <input
            type="text"
            value={claimedBy}
            onChange={(e) => setClaimedBy(e.target.value)}
            placeholder="Enter claimer's name"
            className="border p-2 rounded-lg w-full"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-medium">Date:</label>
            <input
              type="date"
              value={claimDate}
              onChange={(e) => setClaimDate(e.target.value)}
              className="border p-2 rounded-lg w-full"
            />
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label className="font-medium">Time:</label>
            <input
              type="time"
              value={claimTime}
              onChange={(e) => setClaimTime(e.target.value)}
              className="border p-2 rounded-lg w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}