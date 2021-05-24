# Spaces Service

## Documentation

You can find the full collection of API requests in [this](https://app.getpostman.com/join-team?invite_code=7d6333bc962ad38d9143887704a3e17c) Postman Workspace. I suggest downloading the Desktop App for the best Experience.

The Database Schema can be found [here](#).

## Installation

* Local (assumes you're in project root directory of NotZoom) and without Docker
    * You need to install Maven
        * cd spaces-service/
        * mvn clean compile
        * mvn spring-boot:run
    
* Local with Docker
    * You need to install Docker
        * cd spaces-service/
        * docker build -t spaces-service .
        * docker run -p 8081:8081 spaces-service