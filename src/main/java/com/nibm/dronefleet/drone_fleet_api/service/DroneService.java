package com.nibm.dronefleet.drone_fleet_api.service;

import com.nibm.dronefleet.drone_fleet_api.dto.DroneDto;
import com.nibm.dronefleet.drone_fleet_api.entity.Drone;
import com.nibm.dronefleet.drone_fleet_api.exception.ResourceNotFoundException;
import com.nibm.dronefleet.drone_fleet_api.repository.DroneRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DroneService {

    private final DroneRepository droneRepository;

    public DroneService(DroneRepository droneRepository) {
        this.droneRepository = droneRepository;
    }

    public DroneDto registerDrone(DroneDto droneDto) {
        Drone drone = new Drone();
        drone.setModel(droneDto.model());
        drone.setBatteryPercentage(droneDto.batteryPercentage());
        drone.setStatus(droneDto.status() != null ? droneDto.status() : "IDLE");

        Drone savedDrone = droneRepository.save(drone);
        return mapToDto(savedDrone);
    }

    public List<DroneDto> getAllDrones() {
        return droneRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DroneDto getDroneById(Long id) {
        Drone drone = droneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Drone", "id", id));
        return mapToDto(drone);
    }

    public DroneDto updateDrone(Long id, DroneDto droneDto) {
        Drone drone = droneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Drone", "id", id));

        drone.setModel(droneDto.model());
        drone.setBatteryPercentage(droneDto.batteryPercentage());
        drone.setStatus(droneDto.status());

        Drone updatedDrone = droneRepository.save(drone);
        return mapToDto(updatedDrone);
    }

    public void deleteDrone(Long id) {
        Drone drone = droneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Drone", "id", id));
        droneRepository.delete(drone);
    }

    public DroneDto mapToDto(Drone drone) {
        return new DroneDto(
                drone.getId(),
                drone.getModel(),
                drone.getBatteryPercentage(),
                drone.getStatus()
        );
    }
}