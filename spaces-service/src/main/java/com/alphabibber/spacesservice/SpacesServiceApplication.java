package com.alphabibber.spacesservice;

import com.alphabibber.spacesservice.model.Space;
import com.alphabibber.spacesservice.model.User;
import com.alphabibber.spacesservice.service.SpaceService;
import com.alphabibber.spacesservice.service.UserService;
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

	@Autowired
	UserService userService;

	public static void main(String[] args) {
		SpringApplication.run(SpacesServiceApplication.class, args);
	}

	@Override
	public void run(String... args) {

		log.info("DataSource = " + dataSource);

		var starterSpace = new Space("Free For All");
		var host = new User("host");
		var participant = new User("participant");

		// Begin transition to new state
		starterSpace.addHost(host);
		spaceService.saveSpace(starterSpace);
		userService.saveUser(participant);
		// State should be:
		//
		// starterSpace space and host are associated, both are saved in database accordingly (even though
		// we only persisted starterSpace space to the DB)
		//
		// participant is saved in users db but no association yet

		// Begin transition to new state
		starterSpace.addParticipant(participant);
		spaceService.saveSpace(starterSpace);
		// State should be:
		//
		// starterSpace space and participant user are now associated via participants relation (both entries are
		// updated). Both are saved to DB (even though we only persisted starterSpace space to DB).

		// Begin transition to new state
		starterSpace.removeParticipant(participant);
		spaceService.saveSpace(starterSpace);
		// State should be:
		//
		// Association between participant and starterSpace is removed, however both entries still exist.

		// Begin transition to new state
		userService.deleteUserById(host.getId());
		// State should be:
		//
		// starterSpace still exists in DB
		// association between host and starterSpace was deleted
		// host user was deleted from users db
	}

}

