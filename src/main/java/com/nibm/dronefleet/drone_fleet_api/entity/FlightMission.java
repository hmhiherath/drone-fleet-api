package com.nibm.dronefleet.drone_fleet_api.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "flight_missions")
public class FlightMission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relationship to Pilot
    @ManyToOne(optional = false)
    @JoinColumn(name = "pilot_id", nullable = false)
    private Pilot pilot;

    // Relationship to Drone
    @ManyToOne(optional = false)
    @JoinColumn(name = "drone_id", nullable = false)
    private Drone drone;

    @Column(nullable = false)
    private String destinationCoordinates;

    private String missionStatus; // e.g., SCHEDULED, IN_PROGRESS, COMPLETED

    public FlightMission() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Pilot getPilot() { return pilot; }
    public void setPilot(Pilot pilot) { this.pilot = pilot; }

    public Drone getDrone() { return drone; }
    public void setDrone(Drone drone) { this.drone = drone; }

    public String getDestinationCoordinates() { return destinationCoordinates; }
    public void setDestinationCoordinates(String destinationCoordinates) { this.destinationCoordinates = destinationCoordinates; }

    public String getMissionStatus() { return missionStatus; }
    public void setMissionStatus(String missionStatus) { this.missionStatus = missionStatus; }
}