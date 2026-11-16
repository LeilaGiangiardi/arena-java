# Etapa 1: Compila o projeto usando Maven com Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Roda no Tomcat 10 com Java 21
FROM tomcat:10.1-jdk21-temurin
RUN rm -rf /usr/local/tomcat/webapps/*

# Copia para ROOT.war (responde em /api/auth) e tambem para backend.war (responde em /backend/api/auth)
COPY --from=build /app/target/*.war /usr/local/tomcat/webapps/ROOT.war
COPY --from=build /app/target/*.war /usr/local/tomcat/webapps/backend.war

EXPOSE 8080
CMD ["catalina.sh", "run"]