package com.nibm.dronefleet.drone_fleet_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FlightMissionRequestDto(
        @NotNull(message = "Pilot ID is required")
        Long pilotId,
        
        @NotNull(message = "Drone ID is required")
        Long droneId,
        
        @NotBlank(message = "Destination coordinates are required")
        String destinationCoordinates,
        
        String missionStatus
) {}