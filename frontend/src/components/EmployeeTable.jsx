
import { Eye, Pencil, Trash2 } from "lucide-react";

export default function EmployeeTable({ employees = [], onView, onEdit, onDelete, onTransfer }) {
  if (!employees.length) {
    return (
      <div className="empty-state">
        <p>No employees found.</p>
        <span>Add an employee to get started.</span>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="employee-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Employee Code</th>
            <th>Department</th>
            <th>Role</th>
            <th>Joining Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>
                <strong>{employee.fullName}</strong>
                <small className="cell-subtitle">{employee.email}</small>
              </td>
              <td>{employee.employeeCode}</td>
              <td>{employee.department}</td>
              <td>{employee.role}</td>
              <td>{employee.joiningDate || "—"}</td>
              <td>
                <span
                  className={`status-pill ${
                    employee.status?.toLowerCase() === "active"
                      ? "status-active"
                      : "status-inactive"
                  }`}
                >
                  {employee.status?.toLowerCase() === "active" ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <button type="button" title="View employee details" onClick={() => onView?.(employee)}>
                    <Eye size={16} />
                  </button>
                  <button type="button" title="Edit employee" onClick={() => onEdit?.(employee)}>
                    <Pencil size={16} />
                  </button>
                  <button type="button" title="Delete employee" onClick={() => onDelete?.(employee)}>
                    <Trash2 size={16} />
                  </button>
                  {onTransfer && <button type="button" title="Transfer employee" className="text-action" onClick={() => onTransfer(employee)}>Transfer</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
