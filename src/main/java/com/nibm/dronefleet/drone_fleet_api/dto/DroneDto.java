package com.nibm.dronefleet.drone_fleet_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record DroneDto(
        Long id,
        
        @NotBlank(message = "Drone model is required")
        String model,
        
        @Min(0) @Max(100)
        Integer batteryPercentage,
        
        String status
) {}