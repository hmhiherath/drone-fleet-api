package com.nibm.dronefleet.drone_fleet_api.controller;

import com.nibm.dronefleet.drone_fleet_api.dto.DroneDto;
import com.nibm.dronefleet.drone_fleet_api.service.DroneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drones")
@CrossOrigin(origins = "*") 
@Tag(name = "Drone Inventory", description = "Endpoints for managing the drone hardware fleet")
public class DroneController {

    private final DroneService droneService;

    public DroneController(DroneService droneService) {
        this.droneService = droneService;
    }

    @PostMapping
    @Operation(summary = "Register a new drone")
    public ResponseEntity<DroneDto> registerDrone(@Valid @RequestBody DroneDto droneDto) {
        return new ResponseEntity<>(droneService.registerDrone(droneDto), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all drones")
    public ResponseEntity<List<DroneDto>> getAllDrones() {
        return ResponseEntity.ok(droneService.getAllDrones());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a drone by ID")
    public ResponseEntity<DroneDto> getDroneById(@PathVariable Long id) {
        return ResponseEntity.ok(droneService.getDroneById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update drone details or status")
    public ResponseEntity<DroneDto> updateDrone(@PathVariable Long id, @Valid @RequestBody DroneDto droneDto) {
        return ResponseEntity.ok(droneService.updateDrone(id, droneDto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Decommission a drone")
    public ResponseEntity<Void> deleteDrone(@PathVariable Long id) {
        droneService.deleteDrone(id);
        return ResponseEntity.noContent().build(); // Returns HTTP 204
    }
}