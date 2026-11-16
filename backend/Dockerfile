# Etapa 1: Compila o código Java 21 com Maven
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Coloca o arquivo .war dentro do Tomcat 10 (com Java 21) na rota /backend
FROM tomcat:10.1-jdk21-temurin
RUN rm -rf /usr/local/tomcat/webapps/*
COPY --from=build /app/target/*.war /usr/local/tomcat/webapps/backend.war
EXPOSE 8080
CMD ["catalina.sh", "run"]