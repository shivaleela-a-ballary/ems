
package com.leela.backend.employee;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import org.springframework.jdbc.core.JdbcTemplate;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final JdbcTemplate jdbcTemplate;

    public EmployeeService(EmployeeRepository employeeRepository, JdbcTemplate jdbcTemplate) {
        this.employeeRepository = employeeRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public List<Employee> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        employees.forEach(employee -> {
            loadReferenceData(employee);
            loadPersonalDetails(employee);
        });
        return employees;
    }

    @Transactional(readOnly = true)
    public Employee getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found with ID: " + id
                ));
        loadPersonalDetails(employee);
        loadReferenceData(employee);
        return employee;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> transferHistory(Long id) {
        return jdbcTemplate.query("select previous_employee_code, new_employee_code, transfer_date, reason, created_at from employee_transfer_history where employee_id=? order by transfer_date desc, id desc",
                (rs, rowNum) -> {
                    Map<String, Object> history = new java.util.LinkedHashMap<>();
                    history.put("previous_employee_code", rs.getString("previous_employee_code"));
                    history.put("new_employee_code", rs.getString("new_employee_code"));
                    history.put("transfer_date", rs.getDate("transfer_date").toLocalDate().toString());
                    history.put("reason", rs.getString("reason"));
                    history.put("created_at", rs.getTimestamp("created_at"));
                    return history;
                }, id);
    }

    public Employee createEmployee(Employee employee) {
        normalizeEmployee(employee);
        employee.setEmployeeCode(normalizeCode(employee.getEmployeeCode()));
        if (employee.getEmployeeCode().isBlank()) {
            employee.setEmployeeCode(generateEmployeeCode(employee.getDepartment()));
        }
        if (employeeRepository.existsByEmployeeCode(employee.getEmployeeCode())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Employee code already exists"
            );
        }

        if (employeeRepository.existsByEmailIgnoreCase(employee.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Email already exists"
            );
        }

        Employee saved = employeeRepository.save(employee);
        savePersonalDetails(saved);
        return saved;
    }

    public Employee updateEmployee(Long id, Employee updatedEmployee) {
        Employee existing = getEmployeeById(id);
        normalizeEmployee(updatedEmployee);

        employeeRepository.findByEmployeeCode(updatedEmployee.getEmployeeCode())
                .filter(employee -> !employee.getId().equals(id))
                .ifPresent(employee -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT, "Employee code already exists"
                    );
                });

        employeeRepository.findAll().stream()
                .filter(employee ->
                        employee.getEmail().equalsIgnoreCase(updatedEmployee.getEmail()))
                .filter(employee -> !employee.getId().equals(id))
                .findFirst()
                .ifPresent(employee -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT, "Email already exists"
                    );
                });

        String requestedCode = normalizeCode(updatedEmployee.getEmployeeCode());
        existing.setEmployeeCode(requestedCode.isBlank() ? existing.getEmployeeCode() : requestedCode);
        existing.setFullName(updatedEmployee.getFullName());
        existing.setEmail(updatedEmployee.getEmail());
        existing.setMobile(updatedEmployee.getMobile());
        existing.setDepartment(updatedEmployee.getDepartment());
        existing.setRole(updatedEmployee.getRole());
        existing.setJoiningDate(updatedEmployee.getJoiningDate());
        existing.setAnnualSalary(updatedEmployee.getAnnualSalary());
        existing.setStatus(normalizeStatus(updatedEmployee.getStatus()));

        Employee saved = employeeRepository.save(existing);
        savePersonalDetails(saved);
        return saved;
    }

    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        employee.setStatus("Inactive");
        employeeRepository.save(employee);
    }

    private void loadPersonalDetails(Employee employee) {
        jdbcTemplate.query("select aadhaar_number, pan_number, date_of_birth, gender, address from employee_personal_details where id = (select personal_details_id from employees where id = ?)",
                rs -> {
                    employee.setAadhaarNumber(rs.getString("aadhaar_number"));
                    employee.setPanNumber(rs.getString("pan_number"));
                    employee.setDateOfBirth(rs.getDate("date_of_birth").toLocalDate());
                    employee.setGender(rs.getString("gender"));
                    employee.setAddress(rs.getString("address"));
                }, employee.getId());
    }

    private void loadReferenceData(Employee employee) {
        jdbcTemplate.query("select d.code, r.name from employees e join departments d on d.id=e.department_id join roles r on r.id=e.role_id where e.id=?",
                rs -> {
                    employee.setDepartment(rs.getString("code"));
                    employee.setRole(rs.getString("name"));
                }, employee.getId());
    }

    private void savePersonalDetails(Employee employee) {
        int updated = jdbcTemplate.update("update employee_personal_details set aadhaar_number=?, pan_number=?, date_of_birth=?, gender=?, address=? where id=(select personal_details_id from employees where id=?)",
                employee.getAadhaarNumber(), employee.getPanNumber(), employee.getDateOfBirth(), employee.getGender(), employee.getAddress(), employee.getId());
        if (updated == 0) {
            jdbcTemplate.update("insert into employee_personal_details (aadhaar_number, pan_number, date_of_birth, gender, address) values (?, ?, ?, ?, ?)",
                    employee.getAadhaarNumber(), employee.getPanNumber(), employee.getDateOfBirth(), employee.getGender(), employee.getAddress());
            Long personalId = jdbcTemplate.queryForObject("select last_insert_id()", Long.class);
            jdbcTemplate.update("update employees set personal_details_id=? where id=?", personalId, employee.getId());
        }
    }

    private String normalizeCode(String code) {
        return code == null ? "" : code.trim().toUpperCase();
    }

    private void normalizeEmployee(Employee employee) {
        employee.setFullName(employee.getFullName() == null ? null : employee.getFullName().trim());
        employee.setEmail(employee.getEmail() == null ? null : employee.getEmail().trim().toLowerCase());
        employee.setDepartment(employee.getDepartment() == null ? null : employee.getDepartment().trim());
        employee.setRole(employee.getRole() == null ? null : employee.getRole().trim());
        employee.setStatus(normalizeStatus(employee.getStatus()));
        employee.setAadhaarNumber(employee.getAadhaarNumber() == null ? null : employee.getAadhaarNumber().replaceAll("\\D", "").replaceAll("([0-9]{4})(?=[0-9])", "$1-"));
        employee.setPanNumber(employee.getPanNumber() == null ? null : employee.getPanNumber().trim().toUpperCase());
        employee.setDepartmentId(resolveDepartmentId(employee.getDepartment()));
        employee.setRoleId(resolveRoleId(employee.getRole()));
    }

    @Transactional
    public Employee transfer(Long id, String newDepartment, LocalDate transferDate, String reason) {
        Employee employee = getEmployeeById(id);
        String oldDepartment = employee.getDepartment();
        if (oldDepartment == null || oldDepartment.isBlank()) {
            oldDepartment = jdbcTemplate.queryForObject("select code from departments where id=?", String.class, employee.getDepartmentId());
        }
        if (oldDepartment.equalsIgnoreCase(newDepartment)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transfer must use a different department");
        }
        String oldCode = employee.getEmployeeCode();
        employee.setDepartment(newDepartment.trim());
        employee.setDepartmentId(resolveDepartmentId(newDepartment));
        employee.setEmployeeCode(generateEmployeeCode(newDepartment));
        Employee saved = employeeRepository.save(employee);
        jdbcTemplate.update("insert into employee_transfer_history (employee_id, from_department_id, to_department_id, previous_employee_code, new_employee_code, transfer_date, reason) values (?, ?, ?, ?, ?, ?, ?)",
                id, resolveDepartmentId(oldDepartment), employee.getDepartmentId(), oldCode, saved.getEmployeeCode(), transferDate, reason);
        return saved;
    }

    private String normalizeStatus(String status) {
        return status == null || status.isBlank()
                ? "ACTIVE"
                : status.trim().toUpperCase();
    }

    private Long resolveDepartmentId(String department) {
        return employeeRepository.findDepartmentId(department)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Unknown department: " + department));
    }

    private Long resolveRoleId(String role) {
        return employeeRepository.findRoleId(role)
                .or(() -> employeeRepository.findRoleId("EMPLOYEE"))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "No employee role is configured"));
    }

    private String generateEmployeeCode(String department) {
        String prefix = Map.of(
                "IT", "I",
                "HR", "H",
                "FINANCE", "F",
                "SALES", "S",
                "ADMIN", "A"
        ).getOrDefault(department == null ? "" : department.trim().toUpperCase(),
                department == null || department.isBlank()
                        ? "E"
                        : department.trim().substring(0, 1).toUpperCase());

        int nextNumber = employeeRepository
                .findTopByEmployeeCodeStartingWithOrderByEmployeeCodeDesc(prefix)
                .map(Employee::getEmployeeCode)
                .map(code -> Integer.parseInt(code.substring(prefix.length())) + 1)
                .orElse(1);
        return String.format("%s%04d", prefix, nextNumber);
    }
}
