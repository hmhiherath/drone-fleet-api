package com.nibm.dronefleet.drone_fleet_api.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "drones")
public class Drone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String model;

    private Integer batteryPercentage;

    private String status; // e.g., IDLE, IN_FLIGHT, MAINTENANCE

    public Drone() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getBatteryPercentage() { return batteryPercentage; }
    public void setBatteryPercentage(Integer batteryPercentage) { this.batteryPercentage = batteryPercentage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}