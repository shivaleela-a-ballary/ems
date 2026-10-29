
import { useState } from "react";
import { createEmployee, updateEmployee } from "../api/employees";

const emptyForm = {
  employeeCode: "",
  fullName: "",
  email: "",
  mobile: "",
  department: "",
  role: "",
  joiningDate: "",
  annualSalary: "",
  status: "Active",
  aadhaarNumber: "",
  panNumber: "",
  dateOfBirth: "",
  gender: "",
  address: "",
};

export default function EmployeeForm({ employee, onCancel, onSaved }) {
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(employee || {}),
    joiningDate: employee?.joiningDate || "",
    annualSalary: employee?.annualSalary ?? "",
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function change(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        annualSalary: form.annualSalary === "" ? null : Number(form.annualSalary),
        joiningDate: form.joiningDate || null,
      };

      if (employee?.id) {
        await updateEmployee(employee.id, payload);
      } else {
        await createEmployee(payload);
      }

      onSaved?.();
    } catch (err) {
      setError(err.message || "Could not save employee.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="employee-form panel" onSubmit={submit}>
      <h2>{employee ? "Edit employee" : "Add employee"}</h2>

      <div className="form-grid">
        <label>
          Employee Code
          <input name="employeeCode" value={form.employeeCode} onChange={change} placeholder="Auto-generated" readOnly={!employee} />
        </label>

        <label>
          Full Name
          <input name="fullName" value={form.fullName} onChange={change} pattern="[A-Za-z ]+" required />
        </label>

        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={change} required />
        </label>
        <label>
          Aadhaar
          <input name="aadhaarNumber" value={form.aadhaarNumber || ""} onChange={change} placeholder="1234-5678-9012" pattern="[0-9]{4}-[0-9]{4}-[0-9]{4}" required={!employee} />
        </label>
        <label>
          PAN
          <input name="panNumber" value={form.panNumber || ""} onChange={change} placeholder="ABCDE1234F" pattern="[A-Za-z]{5}[0-9]{4}[A-Za-z]" required={!employee} />
        </label>

        <label>
          Mobile
          <input name="mobile" value={form.mobile} onChange={change} pattern="[0-9]{10}" maxLength={10} />
        </label>
        <label>
          Date of Birth
          <input name="dateOfBirth" type="date" value={form.dateOfBirth || ""} onChange={change} required={!employee} />
        </label>
        <label>
          Gender
          <select name="gender" value={form.gender || ""} onChange={change} required={!employee}><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select>
        </label>

        <label>
          Department
          <select name="department" value={form.department} onChange={change} required>
            <option value="">Select department</option>
            <option value="IT">Information Technology</option>
            <option value="HR">Human Resources</option>
            <option value="Finance">Finance</option>
            <option value="Sales">Sales</option>
            <option value="Admin">Admin</option>
          </select>
        </label>

        <label>
          Role
          <select name="role" value={form.role} onChange={change} required>
            <option value="">Select role</option>
            <option value="ADMIN">Administrator</option>
            <option value="MANAGER">Manager</option>
            <option value="EMPLOYEE">Employee</option>
          </select>
        </label>
        <label>
          Address
          <textarea name="address" value={form.address || ""} onChange={change} rows="2" />
        </label>

        <label>
          Joining Date
          <input name="joiningDate" type="date" value={form.joiningDate} onChange={change} required />
        </label>

        <label>
          Annual Salary
          <input name="annualSalary" type="number" min="0.01" step="0.01" value={form.annualSalary} onChange={change} required />
        </label>

        <label>
          Status
          <select name="status" value={form.status} onChange={change}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </label>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary-button" disabled={saving}>
          {saving ? "Saving..." : "Save Employee"}
        </button>
      </div>
    </form>
  );
}
