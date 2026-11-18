package com.arenajava.util;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class ConexaoJDBC {

    private static final Properties props = new Properties();

    static {
        try (InputStream input = ConexaoJDBC.class.getClassLoader().getResourceAsStream("db.properties")) {
            if (input == null) {
                System.err.println("Arquivo db.properties não encontrado em src/main/resources!");
            } else {
                props.load(input);
                Class.forName("org.postgresql.Driver");
            }
        } catch (IOException | ClassNotFoundException e) {
            System.err.println("Erro ao carregar configurações do banco:");
            e.printStackTrace();
        }
    }

    public static Connection conectar() {
        try {
            String url = props.getProperty("db.url");
            String usuario = props.getProperty("db.user");
            String senha = props.getProperty("db.password");

            return DriverManager.getConnection(url, usuario, senha);
        } catch (SQLException e) {
            System.err.println("Erro ao conectar no PostgreSQL. Verifique o db.properties.");
            e.printStackTrace();
            return null;
        }
    }
}