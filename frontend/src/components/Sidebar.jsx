
import { Building2, LayoutDashboard, Users, UserPlus, Settings } from "lucide-react";

const items = [
  { label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { label: "Employees", icon: Users, id: "employees" },
  { label: "Add Employee", icon: UserPlus, id: "add" },
  { label: "Departments", icon: Building2, id: "departments" },
  { label: "Settings", icon: Settings, id: "settings" },
];

export default function Sidebar({ active = "dashboard", onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark" role="img" aria-label="Indian tricolour emblem">
          <svg viewBox="0 0 42 42" aria-hidden="true">
            <path fill="#f28c28" d="M8 9h26a3 3 0 0 1 3 3v6H5v-6a3 3 0 0 1 3-3Z" />
            <path fill="#fff" d="M5 18h32v6H5z" />
            <path fill="#388e3c" d="M5 24h32v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6Z" />
            <circle cx="21" cy="21" r="4" fill="none" stroke="#1b4f9c" strokeWidth="1.5" />
            <circle cx="21" cy="21" r="1.1" fill="#1b4f9c" />
            <path stroke="#1b4f9c" strokeWidth="1" d="M21 16.8v8.4M16.8 21h8.4M18 18l6 6M24 18l-6 6" />
          </svg>
        </span>
        <div>
          <strong>SEVA</strong>
          <small>Employee Portal</small>
        </div>
      </div>

      <p className="sidebar-label">WORKSPACE</p>

      <nav className="sidebar-nav">
        {items.map(({ label, icon: Icon, id }) => (
          <button
            key={id}
            className={`nav-item ${active === id ? "active" : ""}`}
            onClick={() => onNavigate?.(id)}
            type="button"
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="avatar">A</span>
        <div>
          <strong>Administrator</strong>
          <small>EMS Admin</small>
        </div>
      </div>
    </aside>
  );
}
