package com.arenajava.util;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class ConexaoJDBC {

    public static Connection conectar() {
        Properties props = new Properties();
        
        try (InputStream input = ConexaoJDBC.class.getClassLoader().getResourceAsStream("db.properties")) {
            if (input == null) {
                System.err.println("❌ Arquivo db.properties não encontrado em src/main/resources!");
                return null;
            }
            props.load(input);

            String url = props.getProperty("db.url");
            String usuario = props.getProperty("db.user");
            String senha = props.getProperty("db.password");

            Class.forName("org.postgresql.Driver");
            Connection conexao = DriverManager.getConnection(url, usuario, senha);
            System.out.println("✅ Conexão estabelecida via db.properties com sucesso!");
            return conexao;

        } catch (IOException e) {
            System.err.println("❌ Erro ao ler o arquivo de configuração db.properties.");
            e.printStackTrace();
            return null;
        } catch (ClassNotFoundException e) {
            System.err.println("❌ Driver PostgreSQL não encontrado.");
            e.printStackTrace();
            return null;
        } catch (SQLException e) {
            System.err.println("❌ Erro ao conectar no PostgreSQL. Verifique usuário e senha no db.properties.");
            e.printStackTrace();
            return null;
        }
    }

    public static void main(String[] args) {
        conectar();
    }
}