import React, { useState, useEffect } from "react";

const initialPayments = [
  { id: 1, passenger: "John Doe", shuttle: "Pretoria → Durban", amount: 800, status: "Paid" },
  { id: 2, passenger: "Jane Smith", shuttle: "Johannesburg → Polokwane", amount: 350, status: "Pending" }
];

const navLinks = [
  { label: "Dashboard", href: "#" },
  { label: "Manage Shuttles", href: "#" },
  { label: "Payments", href: "#" },
  { label: "Logout", href: "#" }
];

const AdminDashboard = () => {
  const [user, setUser] = useState({ name: "", email: "" });
  const [shuttles, setShuttles] = useState([]);
  const [payments] = useState(initialPayments);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [newShuttle, setNewShuttle] = useState({ route: "", date: "", time: "", duration: "", pickup: "", seats: "", price: "" });

  // Load admin info dynamically
  useEffect(() => {
    const loggedInAdmin = JSON.parse(localStorage.getItem("user"));
    if (loggedInAdmin) setUser({ name: loggedInAdmin.name, email: loggedInAdmin.email });
  }, []);

  // Fetch shuttles from backend
  const fetchShuttles = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/shuttles/");
      const data = await res.json();
      setShuttles(data);
    } catch (err) {
      console.error("Error fetching shuttles:", err);
    }
  };

  useEffect(() => {
    fetchShuttles();
  }, []);

  // Add shuttle
  const handleAddShuttle = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/shuttles/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newShuttle),
      });
      const data = await res.json();
      alert(data.message);
      setShowAdd(false);
      setNewShuttle({ route: "", date: "", time: "", duration: "", pickup: "", seats: "", price: "" });
      fetchShuttles();
    } catch (err) {
      console.error(err);
      alert("Error creating shuttle. Please try again.");
    }
  };

  // Edit shuttle
  const handleEditShuttle = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/api/shuttles/${showEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(showEdit),
      });
      const data = await res.json();
      alert(data.message);
      setShowEdit(null);
      fetchShuttles();
    } catch (err) {
      console.error(err);
      alert("Error updating shuttle. Please try again.");
    }
  };

  // Delete shuttle
  const handleDeleteShuttle = async (id) => {
    if (!window.confirm("Delete this shuttle?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/shuttles/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      alert(data.message);
      fetchShuttles();
    } catch (err) {
      console.error(err);
      alert("Error deleting shuttle. Please try again.");
    }
  };

  return (
    <section className="min-h-screen bg-slate-100 font-sans">
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center px-4 sm:px-6 shadow-md z-50">
        <span className="font-bold text-lg sm:text-xl">Admin Dashboard</span>
        <div className="ml-auto flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex flex-col text-right mr-4">
            <span className="font-semibold">{user.name}</span>
            <span className="text-sm text-gray-300">{user.email}</span>
          </div>
          {navLinks.map(link => (
            <a key={link.label} href={link.href} className={`px-3 py-1 rounded-md font-medium text-sm ${link.label === "Logout" ? "bg-red-600" : ""} ${link.label === "Dashboard" ? "border-2 border-blue-500" : ""}`}>
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Side Nav */}
      <aside className="hidden md:flex fixed top-16 left-0 w-56 h-screen flex-col items-center pt-6 bg-blue-600 text-white shadow-md">
        <div className="font-semibold text-lg mb-4 text-center">Welcome, {user.name}</div>
        {navLinks.map(link => (
          <a key={link.label} href={link.href} className={`w-full text-center py-3 mb-2 rounded-md font-medium ${link.label === "Dashboard" ? "bg-slate-900" : "hover:bg-blue-700 transition"}`}>
            {link.label}
          </a>
        ))}
      </aside>

      {/* Main Content */}
      <div className="md:ml-56 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        {/* Shuttle Management */}
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-10 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-600 mb-4 sm:mb-0">Shuttle Management</h2>
            <button onClick={() => setShowAdd(true)} className="bg-green-600 text-white font-bold rounded-lg px-6 py-2 shadow hover:bg-green-700 transition">+ Add Shuttle</button>
          </div>

          <div className="space-y-4">
            {shuttles.map(shuttle => (
              <div key={shuttle.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-lg shadow-sm border p-4">
                <div className="flex-1 min-w-[180px]">
                  <div className="text-gray-500 text-sm">{shuttle.date} • {shuttle.time} • {shuttle.duration}</div>
                  <div className="font-bold text-blue-600 text-lg my-1">{shuttle.route}</div>
                  <div className="text-gray-700 text-sm">Pickup window: {shuttle.pickup}</div>
                  <div className="text-gray-500 text-sm">Seats left: <span className="font-bold text-blue-600">{shuttle.seats}</span></div>
                </div>
                <div className="flex flex-col items-end mt-3 sm:mt-0">
                  <div className="text-green-600 font-bold text-lg">ZAR {shuttle.price}</div>
                  <div className="text-gray-500 text-sm">per seat</div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setShowEdit({ ...shuttle })} className="bg-blue-600 text-white px-3 py-1 rounded font-medium hover:bg-blue-700 transition">Edit</button>
                    <button onClick={() => handleDeleteShuttle(shuttle.id)} className="bg-red-600 text-white px-3 py-1 rounded font-medium hover:bg-red-700 transition">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payments Tracker */}
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-10">
          <h2 className="text-blue-600 font-bold text-xl mb-4">Payments Tracker</h2>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-gray-50">
              <thead className="bg-blue-600 text-white">
                <tr>
                  {["Passenger", "Shuttle", "Amount", "Status"].map(header => (
                    <th key={header} className="px-4 py-2 text-left">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map(pay => (
                  <tr key={pay.id} className="bg-white">
                    <td className="px-4 py-2">{pay.passenger}</td>
                    <td className="px-4 py-2">{pay.shuttle}</td>
                    <td className="px-4 py-2">ZAR {pay.amount}</td>
                    <td className={`px-4 py-2 font-bold ${pay.status === "Paid" ? "text-green-600" : "text-red-600"}`}>{pay.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAdd && <ShuttleModal title="Add Shuttle" shuttle={newShuttle} setShuttle={setNewShuttle} onClose={() => setShowAdd(false)} onSubmit={handleAddShuttle} />}
      {showEdit && <ShuttleModal title="Edit Shuttle" shuttle={showEdit} setShuttle={setShowEdit} onClose={() => setShowEdit(null)} onSubmit={handleEditShuttle} />}
    </section>
  );
};

const ShuttleModal = ({ title, shuttle, setShuttle, onClose, onSubmit }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl"
      >
        ×
      </button>
      <h3 className="text-center text-blue-600 font-bold text-xl mb-4">{title}</h3>
      <form onSubmit={onSubmit} className="space-y-3">
        {["route", "date", "time", "duration", "pickup", "seats", "price"].map(field => (
          <div key={field} className="flex flex-col">
            <label className="font-medium text-blue-600 capitalize">{field}</label>
            <input
              type={field === "date" ? "date" : field === "time" ? "time" : (field === "seats" || field === "price") ? "number" : "text"}
              required
              min={field === "seats" || field === "price" ? 1 : undefined}
              value={shuttle[field]}
              onChange={e => setShuttle({ ...shuttle, [field]: e.target.value })}
              className="mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder={field === "route" ? "e.g. Pretoria → Durban" : undefined}
            />
          </div>
        ))}
        <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition">
          {title.includes("Add") ? "Add Shuttle" : "Save Changes"}
        </button>
      </form>
    </div>
  </div>
);

export default AdminDashboard;
