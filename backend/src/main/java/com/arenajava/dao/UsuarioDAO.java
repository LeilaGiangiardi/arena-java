package com.arenajava.dao;

import com.arenajava.model.Usuario;
import com.arenajava.util.ConexaoJDBC;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UsuarioDAO {

    /**
     * Insere um novo usuário no banco de dados.
     * Os campos 'id', 'xp', 'cargo' e 'criado_em' são gerados automaticamente pelo PostgreSQL.
     */
    public boolean cadastrar(Usuario usuario) {
        String sql = "INSERT INTO usuarios (nome, email, github, senha_hash) VALUES (?, ?, ?, ?)";

        try (Connection conexao = ConexaoJDBC.conectar();
             PreparedStatement stmt = conexao.prepareStatement(sql)) {

            stmt.setString(1, usuario.getNome());
            stmt.setString(2, usuario.getEmail());
            stmt.setString(3, usuario.getGithub());
            stmt.setString(4, usuario.getSenhaHash());

            int linhasAfetadas = stmt.executeUpdate();
            return linhasAfetadas > 0;

        } catch (SQLException e) {
            System.err.println("Erro ao cadastrar usuário no banco.");
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Busca um usuário pelo email (essencial para o Login).
     */
    public Usuario buscarPorEmail(String email) {
        String sql = "SELECT * FROM usuarios WHERE email = ?";
        Usuario usuario = null;

        try (Connection conexao = ConexaoJDBC.conectar();
             PreparedStatement stmt = conexao.prepareStatement(sql)) {

            stmt.setString(1, email);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    usuario = new Usuario();
                    usuario.setId(rs.getInt("id"));
                    usuario.setNome(rs.getString("nome"));
                    usuario.setEmail(rs.getString("email"));
                    usuario.setGithub(rs.getString("github"));
                    usuario.setSenhaHash(rs.getString("senha_hash"));
                    usuario.setXp(rs.getInt("xp"));
                    usuario.setCargo(rs.getString("cargo"));
                    usuario.setCriadoEm(rs.getTimestamp("criado_em"));
                }
            }
        } catch (SQLException e) {
            System.err.println("Erro ao buscar usuário por e-mail.");
            e.printStackTrace();
        }
        return usuario;
    }
}