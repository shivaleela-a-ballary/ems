package com.leela.backend.employee;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record TransferRequest(
        @NotBlank String newDepartment,
        @NotNull LocalDate transferDate,
        String reason
) {}
