package com.nibm.dronefleet.drone_fleet_api.service;

import com.nibm.dronefleet.drone_fleet_api.dto.FlightMissionRequestDto;
import com.nibm.dronefleet.drone_fleet_api.dto.FlightMissionResponseDto;
import com.nibm.dronefleet.drone_fleet_api.entity.Drone;
import com.nibm.dronefleet.drone_fleet_api.entity.FlightMission;
import com.nibm.dronefleet.drone_fleet_api.entity.Pilot;
import com.nibm.dronefleet.drone_fleet_api.exception.ResourceNotFoundException;
import com.nibm.dronefleet.drone_fleet_api.repository.DroneRepository;
import com.nibm.dronefleet.drone_fleet_api.repository.FlightMissionRepository;
import com.nibm.dronefleet.drone_fleet_api.repository.PilotRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FlightMissionService {

    private final FlightMissionRepository missionRepository;
    private final PilotRepository pilotRepository;
    private final DroneRepository droneRepository;
    private final PilotService pilotService;
    private final DroneService droneService;

    public FlightMissionService(FlightMissionRepository missionRepository, 
                                PilotRepository pilotRepository, 
                                DroneRepository droneRepository,
                                PilotService pilotService,
                                DroneService droneService) {
        this.missionRepository = missionRepository;
        this.pilotRepository = pilotRepository;
        this.droneRepository = droneRepository;
        this.pilotService = pilotService;
        this.droneService = droneService;
    }

    public FlightMissionResponseDto scheduleMission(FlightMissionRequestDto requestDto) {
        // 1. Verify Pilot exists
        Pilot pilot = pilotRepository.findById(requestDto.pilotId())
                .orElseThrow(() -> new ResourceNotFoundException("Pilot", "id", requestDto.pilotId()));

        // 2. Verify Drone exists
        Drone drone = droneRepository.findById(requestDto.droneId())
                .orElseThrow(() -> new ResourceNotFoundException("Drone", "id", requestDto.droneId()));

        // 3. Create the mission
        FlightMission mission = new FlightMission();
        mission.setPilot(pilot);
        mission.setDrone(drone);
        mission.setDestinationCoordinates(requestDto.destinationCoordinates());
        mission.setMissionStatus(requestDto.missionStatus() != null ? requestDto.missionStatus() : "SCHEDULED");

        FlightMission savedMission = missionRepository.save(mission);
        return mapToResponseDto(savedMission);
    }

    public List<FlightMissionResponseDto> getAllMissions() {
        return missionRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public FlightMissionResponseDto getMissionById(Long id) {
        FlightMission mission = missionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FlightMission", "id", id));
        return mapToResponseDto(mission);
    }

    public void cancelMission(Long id) {
        FlightMission mission = missionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FlightMission", "id", id));
        missionRepository.delete(mission);
    }

    private FlightMissionResponseDto mapToResponseDto(FlightMission mission) {
        return new FlightMissionResponseDto(
                mission.getId(),
                pilotService.mapToDto(mission.getPilot()),
                droneService.mapToDto(mission.getDrone()),
                mission.getDestinationCoordinates(),
                mission.getMissionStatus()
        );
    }
}