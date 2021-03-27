package com.alphabibber.websocketservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WebsocketServiceApplication {
	// Guides used to build this:
	// https://programmer.ink/think/building-a-simple-multi-person-chat-system-based-on-springboot-websocket.html
	// https://www.baeldung.com/java-websockets
	public static void main(String[] args) {
		SpringApplication.run(WebsocketServiceApplication.class, args);
	}

}
