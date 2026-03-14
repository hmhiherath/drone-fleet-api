package com.nibm.dronefleet.drone_fleet_api.controller;

import com.nibm.dronefleet.drone_fleet_api.dto.PilotDto;
import com.nibm.dronefleet.drone_fleet_api.service.PilotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pilots")
@CrossOrigin(origins = "*")
@Tag(name = "Pilot Management", description = "Endpoints for managing drone pilots")
public class PilotController {

    private final PilotService pilotService;

    public PilotController(PilotService pilotService) {
        this.pilotService = pilotService;
    }

    @PostMapping
    @Operation(summary = "Add a new pilot")
    public ResponseEntity<PilotDto> createPilot(@Valid @RequestBody PilotDto pilotDto) {
        return new ResponseEntity<>(pilotService.createPilot(pilotDto), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all pilots")
    public ResponseEntity<List<PilotDto>> getAllPilots() {
        return ResponseEntity.ok(pilotService.getAllPilots());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a pilot by ID")
    public ResponseEntity<PilotDto> getPilotById(@PathVariable Long id) {
        return ResponseEntity.ok(pilotService.getPilotById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing pilot")
    public ResponseEntity<PilotDto> updatePilot(@PathVariable Long id, @Valid @RequestBody PilotDto pilotDto) {
        return ResponseEntity.ok(pilotService.updatePilot(id, pilotDto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a pilot")
    public ResponseEntity<Void> deletePilot(@PathVariable Long id) {
        pilotService.deletePilot(id);
        return ResponseEntity.noContent().build();
    }
}