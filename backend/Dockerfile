# Etapa 1: Compila o código Java com Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Coloca o arquivo .war dentro do Tomcat 10 na rota /backend
FROM tomcat:10.1-jdk17-temurin
RUN rm -rf /usr/local/tomcat/webapps/*
COPY --from=build /app/target/*.war /usr/local/tomcat/webapps/backend.war
EXPOSE 8080
CMD ["catalina.sh", "run"]