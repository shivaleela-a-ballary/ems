
import { Users, UserCheck, UserMinus, Building2 } from "lucide-react";

const icons = {
  employees: Users,
  active: UserCheck,
  inactive: UserMinus,
  departments: Building2,
};

export default function StatCard({ title, value, type }) {
  const Icon = icons[type] || Users;

  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span>{title}</span>
        <span className="stat-icon">
          <Icon size={21} />
        </span>
      </div>
      <strong className="stat-value">{value}</strong>
    </article>
  );
}
