package com.nibm.dronefleet.drone_fleet_api.service;

import com.nibm.dronefleet.drone_fleet_api.dto.PilotDto;
import com.nibm.dronefleet.drone_fleet_api.entity.Pilot;
import com.nibm.dronefleet.drone_fleet_api.exception.ResourceNotFoundException;
import com.nibm.dronefleet.drone_fleet_api.repository.PilotRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PilotService {

    private final PilotRepository pilotRepository;

    public PilotService(PilotRepository pilotRepository) {
        this.pilotRepository = pilotRepository;
    }

    public PilotDto createPilot(PilotDto pilotDto) {
        Pilot pilot = new Pilot();
        pilot.setName(pilotDto.name());
        pilot.setLicenseNumber(pilotDto.licenseNumber());
        pilot.setCertificationLevel(pilotDto.certificationLevel());

        Pilot savedPilot = pilotRepository.save(pilot);
        return mapToDto(savedPilot);
    }

    public List<PilotDto> getAllPilots() {
        return pilotRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PilotDto getPilotById(Long id) {
        Pilot pilot = pilotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pilot", "id", id));
        return mapToDto(pilot);
    }

    public PilotDto updatePilot(Long id, PilotDto pilotDto) {
        Pilot pilot = pilotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pilot", "id", id));

        pilot.setName(pilotDto.name());
        pilot.setLicenseNumber(pilotDto.licenseNumber());
        pilot.setCertificationLevel(pilotDto.certificationLevel());

        Pilot updatedPilot = pilotRepository.save(pilot);
        return mapToDto(updatedPilot);
    }

    public void deletePilot(Long id) {
        Pilot pilot = pilotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pilot", "id", id));
        pilotRepository.delete(pilot);
    }

    // Helper method to convert Entity to DTO
    public PilotDto mapToDto(Pilot pilot) {
        return new PilotDto(
                pilot.getId(),
                pilot.getName(),
                pilot.getLicenseNumber(),
                pilot.getCertificationLevel()
        );
    }
}