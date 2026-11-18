package com.arenajava.util;

import java.io.InputStream;
import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class ConexaoJDBC {

    private static String url;
    private static String usuario;
    private static String senha;
    private static Connection conexaoCompartilhada;

    static {
        try (InputStream input = ConexaoJDBC.class.getClassLoader().getResourceAsStream("db.properties")) {
            if (input != null) {
                Properties props = new Properties();
                props.load(input);
                url = props.getProperty("db.url");
                usuario = props.getProperty("db.user");
                senha = props.getProperty("db.password");
                Class.forName("org.postgresql.Driver");
            } else {
                System.err.println("Arquivo db.properties não encontrado em src/main/resources!");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static synchronized Connection conectar() throws SQLException {
        if (conexaoCompartilhada == null || conexaoCompartilhada.isClosed() || !conexaoCompartilhada.isValid(2)) {
            conexaoCompartilhada = DriverManager.getConnection(url, usuario, senha);
        }

        // Retorna um proxy que mantém a conexão física aberta no Render mesmo após o try-with-resources fechar
        return (Connection) Proxy.newProxyInstance(
                ConexaoJDBC.class.getClassLoader(),
                new Class<?>[]{Connection.class},
                (proxy, method, args) -> {
                    if ("close".equals(method.getName())) {
                        if (!conexaoCompartilhada.getAutoCommit()) {
                            conexaoCompartilhada.setAutoCommit(true);
                        }
                        return null;
                    }
                    return method.invoke(conexaoCompartilhada, args);
                }
        );
    }
}