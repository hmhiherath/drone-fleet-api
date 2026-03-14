package com.nibm.dronefleet.drone_fleet_api.dto;

public record FlightMissionResponseDto(
        Long id,
        PilotDto pilot,
        DroneDto drone,
        String destinationCoordinates,
        String missionStatus
) {}