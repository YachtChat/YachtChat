FROM maven:3.6.3-jdk-11

ARG JAR_FILE=target/*.jar
ADD ${JAR_FILE} app.jar

EXPOSE 8081

ENTRYPOINT ["exec", "java","-jar","/app.jar"]
