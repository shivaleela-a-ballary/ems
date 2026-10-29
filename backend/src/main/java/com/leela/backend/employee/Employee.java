
package com.leela.backend.employee;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_code", unique = true, nullable = false, length = 30)
    private String employeeCode;

    @JsonIgnore
    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @JsonIgnore
    @Column(name = "role_id", nullable = false)
    private Long roleId;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Name must contain only letters and spaces")
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Email
    @NotBlank
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile must contain exactly 10 digits")
    @Column(length = 10)
    private String mobile;

    @NotBlank
    @Column(nullable = false, length = 80)
    private String department;

    @NotBlank
    @Column(nullable = false, length = 80)
    private String role;

    @NotNull
    @PastOrPresent
    @Column(name = "joining_date", nullable = false)
    private LocalDate joiningDate;

    @NotNull
    @DecimalMin(value = "0.01", message = "Salary must be greater than zero")
    @Column(name = "annual_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal annualSalary;

    @NotBlank
    @Column(nullable = false, length = 20)
    private String status = "Active";

    @Transient
    @Pattern(regexp = "^[0-9]{4}-[0-9]{4}-[0-9]{4}$", message = "Aadhaar must be XXXX-XXXX-XXXX")
    private String aadhaarNumber;
    @Transient
    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]$", message = "PAN must be ABCDE1234F")
    private String panNumber;
    @Transient
    @PastOrPresent
    private LocalDate dateOfBirth;
    @Transient
    @NotBlank
    private String gender;
    @Transient
    private String address;

    protected Employee() {
    }

    public Long getId() { return id; }
    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public LocalDate getJoiningDate() { return joiningDate; }
    public void setJoiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; }
    public BigDecimal getAnnualSalary() { return annualSalary; }
    public void setAnnualSalary(BigDecimal annualSalary) { this.annualSalary = annualSalary; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAadhaarNumber() { return aadhaarNumber; }
    public void setAadhaarNumber(String value) { this.aadhaarNumber = value; }
    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String value) { this.panNumber = value; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate value) { this.dateOfBirth = value; }
    public String getGender() { return gender; }
    public void setGender(String value) { this.gender = value; }
    public String getAddress() { return address; }
    public void setAddress(String value) { this.address = value; }
}
