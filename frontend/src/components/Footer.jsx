import { useEffect, useState } from "react";
import { Copy, X, ChevronDown } from "lucide-react";

export default function Footer() {
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [showContact, setShowContact] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  const isAdmin = role !== "student";

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem("role"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      {/* FOOTER */}
      <footer
        className="bg-white p-4 flex justify-center gap-8 text-sm sticky bottom-0 z-40"
        style={{
          color: isAdmin ? "#4B5563" : "#B91C1C",
          borderTop: `2px solid ${isAdmin ? "#4B5563" : "#B91C1C"}`
        }}
      >
        <FooterLink label="Lost & Found Tips" onClick={() => setShowTips(true)} />
        <FooterLink label="FAQs" onClick={() => setShowFAQ(true)} />
        <FooterLink label="Contact Us" onClick={() => setShowContact(true)} />
      </footer>

      {/* CONTACT */}
      {showContact && (
        <Modal onClose={() => setShowContact(false)}>
          <h2 className="modal-title">Contact Support</h2>

          <div className="space-y-4 mt-4">
            <ContactItem label="Primary Contact" value="09060779655" copyToClipboard={copyToClipboard} />
            <ContactItem label="Alternate Contact" value="09395659903" copyToClipboard={copyToClipboard} />
          </div>
        </Modal>
      )}

      {/* TIPS */}
      {showTips && (
        <Modal onClose={() => setShowTips(false)}>
          <h2 className="modal-title">Lost & Found Tips</h2>

          <div className="space-y-3 mt-4">
            <TipItem text="Report lost items immediately to increase chances of recovery." />
            <TipItem text="Provide clear and detailed descriptions of the item." />
            <TipItem text="Include distinguishing features (marks, stickers, case, etc.)." />
            <TipItem text="Upload clear photos of the item when possible." />
            <TipItem text="Check the system regularly for updates or matches." />
            <TipItem text="Coordinate properly when claiming items." />
            <TipItem text="Avoid sharing sensitive personal information publicly." />
          </div>
        </Modal>
      )}

      {/* FAQ */}
      {showFAQ && (
        <Modal onClose={() => setShowFAQ(false)}>
          <h2 className="modal-title">Frequently Asked Questions</h2>

          <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {faqData.map((faq, index) => (
              <FAQItem key={index} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}

/* =========================
   MODAL
========================= */
const Modal = ({ children, onClose }) => (
  <div
    onClick={onClose}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative"
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100"
      >
        <X size={18} />
      </button>

      {children}
    </div>
  </div>
);

/* =========================
   FOOTER LINK
========================= */
const FooterLink = ({ label, onClick }) => (
  <span onClick={onClick} className="cursor-pointer hover:underline transition">
    {label}
  </span>
);

/* =========================
   CONTACT ITEM
========================= */
const ContactItem = ({ label, value, copyToClipboard }) => (
  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>

    <button
      onClick={() => copyToClipboard(value)}
      className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300"
    >
      <Copy size={16} />
    </button>
  </div>
);

/* =========================
   TIP ITEM
========================= */
const TipItem = ({ text }) => (
  <div className="flex gap-3 items-start bg-gray-50 p-4 rounded-xl border border-gray-200">
    <span className="text-blue-500 font-bold mt-1">•</span>
    <p className="text-sm text-gray-600">{text}</p>
  </div>
);

/* =========================
   FAQ ITEM (ACCORDION)
========================= */
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 text-left"
      >
        <span className="font-medium text-sm text-gray-800">{question}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="p-4 text-sm text-gray-600 bg-white">
          {answer}
        </div>
      )}
    </div>
  );
};

/* =========================
   FAQ DATA
========================= */
const faqData = [
  {
    q: "How do I report a lost item?",
    a: "Click 'Report Lost Item' and fill out the form with item details."
  },
  {
    q: "What should I do if I found an item?",
    a: "Use 'Report Found Item' and provide details and a photo if possible."
  },
  {
    q: "How can I check if my lost item is found?",
    a: "Search using keywords, category, date, or location."
  },
  {
    q: "Do I need to upload a photo?",
    a: "Optional, but strongly recommended for faster identification."
  },
  {
    q: "Who can claim a found item?",
    a: "Only the rightful owner after verification."
  },
  {
    q: "What happens to unclaimed items?",
    a: "They are stored in the security office."
  },
  {
    q: "Is my information safe?",
    a: "Yes, only authorized admins can access it."
  },
  {
    q: "Who manages the system?",
    a: "Admins verify and manage all reports."
  },
  {
    q: "Should I share all information publicly?",
    a: "No, avoid sensitive details."
  },
  {
    q: "Do I need to leave contact details?",
    a: "Optional but helpful for follow-ups."
  }
];