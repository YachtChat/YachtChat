package com.alphabibber.spacesservice;

import com.alphabibber.spacesservice.model.Space;
import com.alphabibber.spacesservice.service.SpaceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.sql.DataSource;

@SpringBootApplication
public class SpacesServiceApplication implements CommandLineRunner {

	private final DataSource dataSource;
	private final SpaceService spaceService;

	private static final Logger log = LoggerFactory.getLogger(SpacesServiceApplication.class);

	public SpacesServiceApplication(
			DataSource dataSource,
			SpaceService spaceService
	) {
		this.dataSource = dataSource;
		this.spaceService = spaceService;
	}

	public static void main(String[] args) {
		SpringApplication.run(SpacesServiceApplication.class, args);
	}

	@Override
	public void run(String... args) {

		log.info("DataSource = " + dataSource);

		var starterSpace = new Space("Free For All", true);
		spaceService.saveSpace(starterSpace);

	}

}
