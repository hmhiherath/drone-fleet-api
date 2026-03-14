package com.nibm.dronefleet.drone_fleet_api.dto;

import jakarta.validation.constraints.NotBlank;

public record PilotDto(
        Long id,
        
        @NotBlank(message = "Pilot name cannot be empty")
        String name,
        
        @NotBlank(message = "License number is required")
        String licenseNumber,
        
        String certificationLevel
) {}