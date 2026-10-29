
package com.leela.backend.employee;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EmployeeRepository
        extends JpaRepository<Employee, Long>,
                JpaSpecificationExecutor<Employee> {

    Optional<Employee> findByEmployeeCode(String employeeCode);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmployeeCode(String employeeCode);

    Optional<Employee> findTopByEmployeeCodeStartingWithOrderByEmployeeCodeDesc(String prefix);

    @Query(value = "select id from departments where upper(code) = upper(:value) or upper(name) = upper(:value) limit 1", nativeQuery = true)
    Optional<Long> findDepartmentId(@Param("value") String value);

    @Query(value = "select id from roles where upper(name) = upper(:value) limit 1", nativeQuery = true)
    Optional<Long> findRoleId(@Param("value") String value);
}
