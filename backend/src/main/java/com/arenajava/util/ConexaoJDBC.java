package com.arenajava.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexaoJDBC {

    public static Connection conectar() throws SQLException {
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

            return DriverManager.getConnection(url, user, pass);
        } catch (ClassNotFoundException e) {
            throw new SQLException("Driver do PostgreSQL não encontrado.", e);
        }
    }
}