package com.nibm.dronefleet.drone_fleet_api.repository;

import com.nibm.dronefleet.drone_fleet_api.entity.FlightMission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FlightMissionRepository extends JpaRepository<FlightMission, Long> {
}