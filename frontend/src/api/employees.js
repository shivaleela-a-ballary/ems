
const API_URL = "/api/employees";

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
  } catch {
    throw new Error("Cannot connect to the backend. Start Spring Boot on port 8080 and refresh this page.");
  }

  if (!response.ok) {
    const body = await response.text();
    let problem;
    try {
      problem = JSON.parse(body);
    } catch {
      throw new Error(body || `Request failed with status ${response.status}.`);
    }
    const fields = problem.fields
      ? ` ${Object.entries(problem.fields).map(([field, message]) => `${field}: ${message}`).join("; ")}`
      : "";
    throw new Error(`${problem.error || "Request failed."}${fields}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function getEmployees() {
  return request(API_URL);
}

export function getEmployee(id) {
  return request(`${API_URL}/${id}`);
}

export function createEmployee(employee) {
  return request(API_URL, {
    method: "POST",
    body: JSON.stringify(employee),
  });
}

export function updateEmployee(id, employee) {
  return request(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(employee),
  });
}

export function deleteEmployee(id) {
  return request(`${API_URL}/${id}`, { method: "DELETE" });
}

export function transferEmployee(id, transfer) {
  return request(`${API_URL}/${id}/transfer`, {
    method: "POST",
    body: JSON.stringify(transfer),
  });
}

export function getTransferHistory(id) {
  return request(`${API_URL}/${id}/transfers`);
}
