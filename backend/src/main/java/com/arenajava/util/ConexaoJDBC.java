package com.arenajava.util;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class ConexaoJDBC {

    private static String url;
    private static String usuario;
    private static String senha;

    static {
        try (InputStream input = ConexaoJDBC.class.getClassLoader().getResourceAsStream("db.properties")) {
            if (input != null) {
                Properties props = new Properties();
                props.load(input);
                url = props.getProperty("db.url");
                usuario = props.getProperty("db.user");
                senha = props.getProperty("db.password");
                Class.forName("org.postgresql.Driver");
                DriverManager.setLoginTimeout(15);
            } else {
                System.err.println("Arquivo db.properties não encontrado em src/main/resources!");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static Connection conectar() throws SQLException {
        return DriverManager.getConnection(url, usuario, senha);
    }
}