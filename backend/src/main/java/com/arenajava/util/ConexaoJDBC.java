package com.arenajava.util;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.sql.Connection;
import java.sql.SQLException;

public class ConexaoJDBC {

    private static HikariDataSource dataSource;

    private static synchronized HikariDataSource getDataSource() {
        if (dataSource == null || dataSource.isClosed()) {
            try {
                Class.forName("org.postgresql.Driver");

                String url = (System.getenv("DB_URL") != null && !System.getenv("DB_URL").trim().isEmpty())
                        ? System.getenv("DB_URL").trim()
                        : "jdbc:postgresql://ep-round-cell-b6owee1n-pooler.c-2.sa-east-1.aws.neon.tech:5432/neondb?sslmode=require";

                String user = (System.getenv("DB_USER") != null && !System.getenv("DB_USER").trim().isEmpty())
                        ? System.getenv("DB_USER").trim()
                        : "neondb_owner";

                String pass = (System.getenv("DB_PASS") != null && !System.getenv("DB_PASS").trim().isEmpty())
                        ? System.getenv("DB_PASS").trim()
                        : "npg_tUA7SOHLd9jy";

                HikariConfig config = new HikariConfig();
                config.setJdbcUrl(url);
                config.setUsername(user);
                config.setPassword(pass);
                config.setDriverClassName("org.postgresql.Driver");

                // Configurações otimizadas para o Neon (Serverless Postgres)
                config.setMaximumPoolSize(5);
                config.setMinimumIdle(1);
                config.setIdleTimeout(120000);            // 2 minutos
                config.setMaxLifetime(240000);            // 4 minutos
                config.setKeepaliveTime(60000);           // Mantém a conexão viva a cada 1 min
                config.setConnectionTimeout(30000);       // 30 segundos (tempo para o Neon acordar se estiver hibernando)
                config.setValidationTimeout(5000);        // 5 segundos para validar se a conexão está ativa
                config.setInitializationFailTimeout(-1);  // Impede travamento do pool se o banco estiver dormindo na partida
                config.addDataSourceProperty("prepareThreshold", "0");

                dataSource = new HikariDataSource(config);
            } catch (ClassNotFoundException e) {
                throw new RuntimeException("Driver do PostgreSQL não encontrado.", e);
            }
        }
        return dataSource;
    }

    public static Connection conectar() throws SQLException {
        return getDataSource().getConnection();
    }
}