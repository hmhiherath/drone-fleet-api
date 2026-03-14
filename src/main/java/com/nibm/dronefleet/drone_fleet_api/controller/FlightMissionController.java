package com.nibm.dronefleet.drone_fleet_api.controller;

import com.nibm.dronefleet.drone_fleet_api.dto.FlightMissionRequestDto;
import com.nibm.dronefleet.drone_fleet_api.dto.FlightMissionResponseDto;
import com.nibm.dronefleet.drone_fleet_api.service.FlightMissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/missions")
@CrossOrigin(origins = "*")
@Tag(name = "Flight Missions", description = "Endpoints for scheduling and managing delivery missions")
public class FlightMissionController {

    private final FlightMissionService missionService;

    public FlightMissionController(FlightMissionService missionService) {
        this.missionService = missionService;
    }

    @PostMapping
    @Operation(summary = "Schedule a new flight mission")
    public ResponseEntity<FlightMissionResponseDto> scheduleMission(@Valid @RequestBody FlightMissionRequestDto requestDto) {
        return new ResponseEntity<>(missionService.scheduleMission(requestDto), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all scheduled and completed missions")
    public ResponseEntity<List<FlightMissionResponseDto>> getAllMissions() {
        return ResponseEntity.ok(missionService.getAllMissions());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get mission details by ID")
    public ResponseEntity<FlightMissionResponseDto> getMissionById(@PathVariable Long id) {
        return ResponseEntity.ok(missionService.getMissionById(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel a flight mission")
    public ResponseEntity<Void> cancelMission(@PathVariable Long id) {
        missionService.cancelMission(id);
        return ResponseEntity.noContent().build();
    }
}