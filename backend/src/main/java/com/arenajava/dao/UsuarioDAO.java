package com.arenajava.dao;

import com.arenajava.model.Usuario;
import com.arenajava.util.ConexaoJDBC;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UsuarioDAO {

    public boolean cadastrar(Usuario usuario) {
        String sql = "INSERT INTO usuarios (nome, email, github, senha_hash) VALUES (?, ?, ?, ?)";

        try (Connection conexao = ConexaoJDBC.conectar();
                PreparedStatement stmt = conexao.prepareStatement(sql)) {

            stmt.setString(1, usuario.getNome());
            stmt.setString(2, usuario.getEmail());
            stmt.setString(3, usuario.getGithub() != null ? usuario.getGithub() : "");
            stmt.setString(4, usuario.getSenhaHash());

            int linhasAfetadas = stmt.executeUpdate();
            return linhasAfetadas > 0;

        } catch (SQLException e) {
            System.err.println("Erro ao cadastrar usuário no banco.");
            e.printStackTrace();
            return false;
        }
    }

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

                    usuario.setOfensiva(rs.getInt("ofensiva"));
                    usuario.setQuestoesAcertadas(rs.getInt("questoes_acertadas"));
                    usuario.setTotalQuestoes(rs.getInt("total_questoes"));
                    usuario.setDominio(rs.getString("dominio"));
                }
            }
        } catch (SQLException e) {
            System.err.println("Erro ao buscar usuário por e-mail.");
            e.printStackTrace();
        }
        return usuario;
    }

    // Método mantido com este nome para não quebrar o Servlet, mas agora busca TODOS os usuários
    public java.util.List<Usuario> listarTop5Ranking() {
        java.util.List<Usuario> lista = new java.util.ArrayList<>();
        
        // MUDANÇA AQUI: Sem LIMIT 5 e com desempate alfabético (nome ASC)
        String sql = "SELECT nome, cargo, xp FROM usuarios ORDER BY xp DESC, nome ASC";

        try (Connection conexao = ConexaoJDBC.conectar();
                PreparedStatement stmt = conexao.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Usuario user = new Usuario();
                user.setNome(rs.getString("nome"));
                user.setCargo(rs.getString("cargo"));
                user.setXp(rs.getInt("xp"));
                lista.add(user);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    public String registrarRespostaQuestao(String email, int perguntaId, int xpGanho, String novoCargo, boolean acertou) {
        String sqlUsuarioId = "SELECT id FROM usuarios WHERE email = ?";
        String sqlInsertResposta = "INSERT INTO respostas_usuarios (usuario_id, pergunta_id, acertou) VALUES (?, ?, ?)";
        String sqlUpdateXP = "UPDATE usuarios SET " +
                             "xp = xp + ?, cargo = ?, " +
                             "questoes_acertadas = questoes_acertadas + ?, " +
                             "total_questoes = total_questoes + 1, " +
                             "ofensiva = CASE WHEN ultima_atividade < CURRENT_DATE OR ultima_atividade IS NULL THEN ofensiva + 1 ELSE ofensiva END, " +
                             "ultima_atividade = CURRENT_DATE " +
                             "WHERE id = ?";

        try (Connection conn = ConexaoJDBC.conectar()) {
            // 1. Busca o ID numérico do usuário através do e-mail
            int usuarioId = -1;
            try (PreparedStatement stmtBusca = conn.prepareStatement(sqlUsuarioId)) {
                stmtBusca.setString(1, email);
                try (ResultSet rs = stmtBusca.executeQuery()) {
                    if (rs.next()) usuarioId = rs.getInt("id");
                }
            }
            
            if (usuarioId == -1) return "ERRO";

            // Inicia a Transação (só salva se tudo der certo)
            conn.setAutoCommit(false);

            // 2. Tenta inserir na tabela de histórico
            try (PreparedStatement stmtInsert = conn.prepareStatement(sqlInsertResposta)) {
                stmtInsert.setInt(1, usuarioId);
                stmtInsert.setInt(2, perguntaId);
                stmtInsert.setBoolean(3, acertou);
                stmtInsert.executeUpdate();
            } catch (SQLException e) {
                conn.rollback(); // Cancela tudo
                // Código 23505 no Postgres significa "Unique Violation" (Já respondeu!)
                if (e.getSQLState() != null && e.getSQLState().equals("23505")) {
                    return "DUPLICADO"; 
                }
                return "ERRO";
            }

            // 3. Atualiza os atributos do Usuário
            try (PreparedStatement stmtUpdate = conn.prepareStatement(sqlUpdateXP)) {
                stmtUpdate.setInt(1, xpGanho);
                stmtUpdate.setString(2, novoCargo);
                stmtUpdate.setInt(3, acertou ? 1 : 0);
                stmtUpdate.setInt(4, usuarioId);
                stmtUpdate.executeUpdate();
            }

            conn.commit(); // Confirma as alterações no banco
            return "SUCESSO";

        } catch (Exception e) {
            e.printStackTrace();
            return "ERRO";
        }
    }
}