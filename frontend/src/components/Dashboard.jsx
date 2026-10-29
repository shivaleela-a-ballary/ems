import { useEffect, useMemo, useState } from "react";
import { deleteEmployee, getEmployee, getEmployees, getTransferHistory, transferEmployee } from "../api/employees";
import EmployeeForm from "./EmployeeForm";
import EmployeeTable from "./EmployeeTable";
import Sidebar from "./Sidebar";
import StatCard from "./StatCard";
import "../App.css";

const pageTitles = {
  dashboard: ["Employee Dashboard", "Manage your workforce from one place."],
  employees: ["Employee Directory", "Search, filter, sort and manage employee records."],
  add: ["Add Employee", "Create a validated employee record."],
  departments: ["Departments", "View departments represented in your workforce."],
  settings: ["Settings", "Adjust your local workspace preferences."],
};

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [activePage, setActivePage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [joiningDateFilter, setJoiningDateFilter] = useState("");
  const [salaryRange, setSalaryRange] = useState("All");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [sortField, setSortField] = useState("fullName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem("ems-compact") === "true");
  const [transferringEmployee, setTransferringEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [transferHistory, setTransferHistory] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  async function loadEmployees() {
    setLoading(true);
    try {
      setEmployees(await getEmployees());
      setError("");
    } catch (err) {
      setError(err.message || "Could not load employees. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch((err) => setError(err.message || "Could not load employees. Is the API running?"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem("ems-compact", String(compactMode));
  }, [compactMode]);

  const departments = useMemo(
    () => [...new Set(employees.map((employee) => employee.department).filter(Boolean))].sort(),
    [employees],
  );
  const roles = useMemo(() => [...new Set(employees.map((employee) => employee.role).filter(Boolean))].sort(), [employees]);

  const matchingEmployees = useMemo(() => employees
    .filter((employee) => {
      const searchable = [
        employee.employeeCode,
        employee.fullName,
        employee.email,
        employee.mobile,
        employee.department,
        employee.role,
        employee.status,
      ].join(" ").toLowerCase();
      return searchable.includes(search.toLowerCase())
        && (statusFilter === "All" || employee.status?.toLowerCase() === statusFilter.toLowerCase())
        && (departmentFilter === "All" || employee.department === departmentFilter)
        && (roleFilter === "All" || employee.role?.toLowerCase() === roleFilter.toLowerCase())
        && (genderFilter === "All" || employee.gender?.toLowerCase() === genderFilter.toLowerCase())
        && (!joiningDateFilter || employee.joiningDate === joiningDateFilter)
        && (salaryRange === "All"
          || (salaryRange === "1-3" && employee.annualSalary >= 100000 && employee.annualSalary < 300000)
          || (salaryRange === "3-5" && employee.annualSalary >= 300000 && employee.annualSalary < 500000)
          || (salaryRange === "5-10" && employee.annualSalary >= 500000 && employee.annualSalary < 1000000)
          || (salaryRange === "10+" && employee.annualSalary >= 1000000)
          || (salaryRange === "custom" && (!minSalary || employee.annualSalary >= Number(minSalary)) && (!maxSalary || employee.annualSalary <= Number(maxSalary))));
    })
    .sort((left, right) => {
      const a = String(left[sortField] ?? "").toLowerCase();
      const b = String(right[sortField] ?? "").toLowerCase();
      return (a.localeCompare(b, undefined, { numeric: true }) || left.id - right.id)
        * (sortDirection === "asc" ? 1 : -1);
    }), [employees, search, statusFilter, departmentFilter, roleFilter, genderFilter, joiningDateFilter, salaryRange, minSalary, maxSalary, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(matchingEmployees.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visibleEmployees = matchingEmployees.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  function navigate(page) {
    setActivePage(page);
    setEditingEmployee(null);
    if (page === "add") setCurrentPage(1);
  }

  function openEditForm(employee) {
    setEditingEmployee(employee);
    setActivePage("add");
  }

  async function removeEmployee(employee) {
    if (!window.confirm(`Deactivate ${employee.fullName}?`)) return;
    try {
      await deleteEmployee(employee.id);
      await loadEmployees();
    } catch (err) {
      setError(err.message || "Could not deactivate employee.");
    }

  }

  async function submitTransfer(event) {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      try {
        const updatedEmployee = await transferEmployee(transferringEmployee.id, {
          newDepartment: form.get("newDepartment"),
          transferDate: form.get("transferDate"),
          reason: form.get("reason"),
        });
        setError("");
        setTransferringEmployee(null);
        setViewingEmployee(updatedEmployee);
        await loadEmployees();
        setViewingEmployee(await getEmployee(updatedEmployee.id));
        try {
          setDetailsLoading(true);
          setTransferHistory(await getTransferHistory(updatedEmployee.id));
        } finally {
          setDetailsLoading(false);
        }
      } catch (err) {
        setError(err.message || "Could not transfer employee.");
      }
  }

  async function viewEmployee(employee) {
    setDetailsLoading(true);
    try {
      setViewingEmployee(await getEmployee(employee.id));
      setTransferHistory(await getTransferHistory(employee.id));
    } catch (err) {
      setError(err.message || "Could not load transfer history.");
      setTransferHistory([]);
    } finally {
      setDetailsLoading(false);
    }
  }

  function toggleSort(field) {
    if (sortField === field) {
      setSortDirection((direction) => direction === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  const [title, subtitle] = pageTitles[activePage];

  return (
    <div className={`app-layout ${compactMode ? "compact-mode" : ""}`}>
      <Sidebar active={activePage} onNavigate={navigate} />
      <main className="main-content">
        <header className="topbar">
          <div className="national-brand"><strong>Employee Management System</strong><span>People · Service · Excellence</span></div>
          <span className="admin-badge">Administrator</span>
        </header>
        <section className="page-content">
          <div className="page-heading">
            <div><p className="eyebrow">WORKSPACE / {activePage.toUpperCase()}</p><h1>{title}</h1><p className="muted">{subtitle}</p></div>
            {activePage !== "add" && <button className="primary-button" onClick={() => navigate("add")}>+ Add Employee</button>}
          </div>

          {error && <p className="error-message">{error}</p>}

          {activePage === "dashboard" && (
            <>
              <div className="stats-grid">
                <StatCard title="Total Employees" value={employees.length} type="employees" />
                <StatCard title="Active Employees" value={employees.filter((employee) => employee.status?.toLowerCase() === "active").length} type="active" />
                <StatCard title="Departments" value={departments.length} type="departments" />
                <StatCard title="Inactive Employees" value={employees.filter((employee) => employee.status?.toLowerCase() !== "active").length} type="inactive" />
              </div>
              <DirectoryPanel employees={employees.slice(0, 5)} loading={loading} onView={viewEmployee} onEdit={openEditForm} onDelete={removeEmployee} onTransfer={setTransferringEmployee} onViewAll={() => navigate("employees")} />
            </>
          )}

          {activePage === "employees" && (
            <section className="panel">
              <div className="panel-heading"><div><h2>All Employees</h2><p className="muted">{matchingEmployees.length} matching records</p></div></div>
              <div className="table-toolbar filters-wrap">
                <input className="search-box" placeholder="Search name, email, code, role..." value={search} onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }} />
                <select value={departmentFilter} onChange={(event) => { setDepartmentFilter(event.target.value); setCurrentPage(1); }} aria-label="Filter by department">
                  <option>All</option>{departments.map((department) => <option key={department}>{department}</option>)}
                </select>
                <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }} aria-label="Filter by status"><option>All</option><option>Active</option><option>Inactive</option></select>
                <select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setCurrentPage(1); }} aria-label="Filter by role"><option>All</option>{roles.map((role) => <option key={role}>{role}</option>)}</select>
                <select value={genderFilter} onChange={(event) => { setGenderFilter(event.target.value); setCurrentPage(1); }} aria-label="Filter by gender"><option>All</option><option>Male</option><option>Female</option><option>Other</option></select>
                <input type="date" value={joiningDateFilter} onChange={(event) => { setJoiningDateFilter(event.target.value); setCurrentPage(1); }} aria-label="Filter by joining date" />
                <select value={salaryRange} onChange={(event) => { setSalaryRange(event.target.value); setCurrentPage(1); }} aria-label="Filter by salary"><option value="All">All salary</option><option value="1-3">₹1–3 LPA</option><option value="3-5">₹3–5 LPA</option><option value="5-10">₹5–10 LPA</option><option value="10+">₹10+ LPA</option><option value="custom">Custom</option></select>
                {salaryRange === "custom" && <><input type="number" placeholder="Min salary" value={minSalary} onChange={(event) => setMinSalary(event.target.value)} /><input type="number" placeholder="Max salary" value={maxSalary} onChange={(event) => setMaxSalary(event.target.value)} /></>}
              </div>
              <div className="sort-controls">
                {["fullName", "department", "role", "status"].map((field) => (
                  <button type="button" key={field} className={sortField === field ? "selected" : ""} onClick={() => toggleSort(field)}>
                    Sort {field === "fullName" ? "name" : field} {sortField === field ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                  </button>
                ))}
              </div>
              {loading ? <div className="loading-state">Loading employees...</div> : <EmployeeTable employees={visibleEmployees} onView={viewEmployee} onEdit={openEditForm} onDelete={removeEmployee} onTransfer={setTransferringEmployee} />}
              <Pagination currentPage={safeCurrentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
            </section>
          )}

          {activePage === "add" && (
            <EmployeeForm
              key={editingEmployee?.id || "new"}
              employee={editingEmployee}
              onCancel={() => navigate("employees")}
              onSaved={() => { setEditingEmployee(null); navigate("employees"); loadEmployees(); }}
            />
          )}

          {activePage === "departments" && (
            <section className="department-grid">
              {departments.length ? departments.map((department) => {
                const members = employees.filter((employee) => employee.department === department);
                return <article className="panel department-card" key={department}><h2>{department}</h2><strong>{members.length}</strong><span>employee{members.length === 1 ? "" : "s"}</span><button type="button" className="secondary-button" onClick={() => { setDepartmentFilter(department); navigate("employees"); }}>View employees</button></article>;
              }) : <section className="panel empty-state"><p>No departments yet.</p><span>Add an employee to create the first department.</span></section>}
            </section>
          )}

          {activePage === "settings" && (
            <section className="panel settings-panel">
              <h2>Workspace settings</h2>
              <label className="setting-row"><span><strong>Compact table</strong><small>Reduce table row spacing for larger directories.</small></span><input type="checkbox" checked={compactMode} onChange={(event) => setCompactMode(event.target.checked)} /></label>
              <button type="button" className="secondary-button" onClick={loadEmployees}>Refresh employee data</button>
            </section>
          )}
          {transferringEmployee && <form className="panel transfer-panel" onSubmit={submitTransfer}>
            <h2>Transfer {transferringEmployee.fullName}</h2>
            <p className="muted">Current code: {transferringEmployee.employeeCode} · Current department: {transferringEmployee.department}</p>
            <div className="form-grid">
              <label>New Department<select name="newDepartment" defaultValue="" required><option value="">Select department</option>{["IT", "HR", "Finance", "Sales", "Admin"].filter((department) => department.toLowerCase() !== transferringEmployee.department?.toLowerCase()).map((department) => <option key={department}>{department}</option>)}</select></label>
              <label>Transfer Date<input name="transferDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
              <label>Reason<textarea name="reason" rows="2" /></label>
            </div>
            <div className="form-actions"><button type="button" className="secondary-button" onClick={() => setTransferringEmployee(null)}>Cancel</button><button className="primary-button">Transfer employee</button></div>
          </form>}
          {viewingEmployee && <section className="details-panel panel">
            <div className="panel-heading"><div><p className="eyebrow">EMPLOYEE DETAILS</p><h2>{viewingEmployee.fullName}</h2><p className="muted">{viewingEmployee.employeeCode}</p></div><button type="button" className="secondary-button" onClick={() => setViewingEmployee(null)}>Close</button></div>
            <div className="details-grid">
              <Detail label="Email" value={viewingEmployee.email} /><Detail label="Mobile" value={viewingEmployee.mobile} /><Detail label="Department" value={viewingEmployee.department} /><Detail label="Role" value={viewingEmployee.role} /><Detail label="Gender" value={viewingEmployee.gender} /><Detail label="Date of birth" value={viewingEmployee.dateOfBirth} /><Detail label="Joining date" value={viewingEmployee.joiningDate} /><Detail label="Salary" value={viewingEmployee.annualSalary ? `₹${Number(viewingEmployee.annualSalary).toLocaleString("en-IN")}` : ""} /><Detail label="Aadhaar" value={viewingEmployee.aadhaarNumber} /><Detail label="PAN" value={viewingEmployee.panNumber} /><Detail label="Address" value={viewingEmployee.address} /><Detail label="Status" value={viewingEmployee.status} />
            </div>
            <h3>Transfer history</h3>
            {detailsLoading ? <p className="muted">Loading history...</p> : transferHistory.length ? <div className="history-list">{transferHistory.map((item, index) => <article key={`${item.transfer_date}-${index}`}><strong>{item.previous_employee_code} → {item.new_employee_code}</strong><span>{item.transfer_date} · {item.reason || "No reason provided"}</span></article>)}</div> : <p className="muted">No transfers recorded.</p>}
          </section>}
          <footer>SEVA · Employee Management System</footer>
        </section>
      </main>
    </div>
  );
}

function DirectoryPanel({ employees, loading, onView, onEdit, onDelete, onTransfer, onViewAll }) {
  return <section className="panel"><div className="panel-heading"><div><h2>Recent employees</h2><p className="muted">Your latest employee records.</p></div><button type="button" className="secondary-button" onClick={onViewAll}>View all</button></div>{loading ? <div className="loading-state">Loading employees...</div> : <EmployeeTable employees={employees} onView={onView} onEdit={onEdit} onDelete={onDelete} onTransfer={onTransfer} />}</section>;
}

function Detail({ label, value }) {
  return <div className="detail-item"><span>{label}</span><strong>{value || "Not provided"}</strong></div>;
}

function Pagination({ currentPage, totalPages, pageSize, onPageChange, onPageSizeChange }) {
  return <div className="pagination"><span>Page {currentPage} of {totalPages}</span><select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} aria-label="Page size"><option value="5">5 / page</option><option value="10">10 / page</option><option value="20">20 / page</option></select><button type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Previous</button><button type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</button></div>;
}
