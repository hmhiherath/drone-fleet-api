# ==========================================
# Stage 1: Build the Spring Boot Application
# ==========================================
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

# Set the working directory inside the container
WORKDIR /build

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Package the application (skip tests to speed up the build)
RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Run the Application
# ==========================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy ONLY the built JAR file from the builder stage
COPY --from=builder /build/target/*.jar app.jar

# Expose port 8080 for the API
EXPOSE 8080

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]