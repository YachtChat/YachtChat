package com.alphabibber.spacesservice;

import com.alphabibber.spacesservice.model.Space;
import com.alphabibber.spacesservice.service.SpaceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.sql.DataSource;

@SpringBootApplication
public class SpacesServiceApplication implements CommandLineRunner {

	private static final Logger log = LoggerFactory.getLogger(SpacesServiceApplication.class);

	@Autowired
	DataSource dataSource;

	@Autowired
	SpaceService spaceService;

	public static void main(String[] args) {
		SpringApplication.run(SpacesServiceApplication.class, args);
	}

	@Override
	public void run(String... args) {
		log.info("DataSource = " + dataSource);

		Space freeForAll = new Space("Free for all");
		spaceService.createSpace(freeForAll);
	}

}

