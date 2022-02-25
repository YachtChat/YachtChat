FROM maven:3.6.3-jdk-11

ARG VIRTUAL_PORT
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

EXPOSE ${VIRTUAL_PORT}

ENTRYPOINT ["java","-jar","/app.jar"]

