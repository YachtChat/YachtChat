package com.alphabibber.spacesservice;

import com.alphabibber.spacesservice.model.Space;
import com.alphabibber.spacesservice.repository.SpaceRepository;
import com.alphabibber.spacesservice.service.SpaceService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SpacesServiceApplication implements CommandLineRunner {

	private final SpaceService spaceService;
	private final SpaceRepository spaceRepository;

	public SpacesServiceApplication(
			SpaceService spaceService,
			SpaceRepository spaceRepository
	) {
		this.spaceService = spaceService;
		this.spaceRepository = spaceRepository;
	}

	public static void main(String[] args) {
		SpringApplication.run(SpacesServiceApplication.class, args);
	}

	@Override
	public void run(String... args) {
		if (spaceRepository.findAllByName("Free For All").isEmpty()) {
			var starterSpace = new Space("Free For All", true);
			spaceService.saveSpace(starterSpace);
		}
	}

}
