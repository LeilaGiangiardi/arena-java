package com.arenajava.util;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.sql.Connection;
import java.sql.SQLException;

public class ConexaoJDBC {

    private static final HikariDataSource dataSource;

    static {
        try {
            Class.forName("org.postgresql.Driver");
            String url = System.getenv("DB_URL") != null 
                    ? System.getenv("DB_URL") 
                    : "jdbc:postgresql://localhost:5432/arena_java";
            String user = System.getenv("DB_USER") != null 
                    ? System.getenv("DB_USER") 
                    : "postgres";
            String pass = System.getenv("DB_PASS") != null 
                    ? System.getenv("DB_PASS") 
                    : "sua_senha_local";

            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(url);
            config.setUsername(user);
            config.setPassword(pass);
            config.setDriverClassName("org.postgresql.Driver");

            // Configuracoes otimizadas para o Neon (Serverless Postgres)
            config.setMaximumPoolSize(5);
            config.setMinimumIdle(1);
            config.setIdleTimeout(120000);       // 2 minutos
            config.setMaxLifetime(240000);       // 4 minutos (evita queda por inatividade do Neon)
            config.setConnectionTimeout(20000);  // 20 segundos
            config.addDataSourceProperty("prepareThreshold", "0");

            dataSource = new HikariDataSource(config);
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("Driver do PostgreSQL não encontrado.", e);
        }
    }

    public static Connection conectar() throws SQLException {
        return dataSource.getConnection();
    }
}