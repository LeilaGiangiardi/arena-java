package com.arenajava.dao;

import com.arenajava.model.Usuario;
import com.arenajava.util.ConexaoJDBC;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class UsuarioDAO {

    public boolean cadastrar(Usuario usuario) {
        String sql = "INSERT INTO usuarios (nome, email, senha_hash, avatar) VALUES (?, ?, ?, ?)";

        try (Connection conexao = ConexaoJDBC.conectar();
                PreparedStatement stmt = conexao.prepareStatement(sql)) {

            stmt.setString(1, usuario.getNome());
            stmt.setString(2, usuario.getEmail());
            stmt.setString(3, usuario.getSenhaHash());
            stmt.setString(4, usuario.getAvatar() != null ? usuario.getAvatar() : usuario.getNome());

            int linhasAfetadas = stmt.executeUpdate();
            return linhasAfetadas > 0;

        } catch (SQLException e) {
            System.err.println("Erro ao cadastrar usuário no banco.");
            e.printStackTrace();
            return false;
        }
    }

    public Usuario buscarPorEmail(String email) {
        // Calcula em tempo real os acertos reais e o total de perguntas da Arena (100)
        String sql = "SELECT u.*, " +
                "(SELECT COUNT(*) FROM perguntas) AS total_perguntas_arena, " +
                "(SELECT COUNT(DISTINCT r.pergunta_id) FROM respostas_usuarios r WHERE r.usuario_id = u.id AND r.acertou = true) AS acertos_reais " +
                "FROM usuarios u WHERE u.email = ?";
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
                    usuario.setSenhaHash(rs.getString("senha_hash"));
                    usuario.setXp(rs.getInt("xp"));
                    usuario.setCargo(rs.getString("cargo"));
                    usuario.setCriadoEm(rs.getTimestamp("criado_em"));

                    usuario.setOfensiva(rs.getInt("ofensiva"));
                    usuario.setQuestoesAcertadas(rs.getInt("acertos_reais"));
                    usuario.setTotalQuestoes(rs.getInt("total_perguntas_arena"));
                    usuario.setDominio(rs.getString("dominio"));
                    usuario.setAvatar(rs.getString("avatar"));
                }
            }
        } catch (SQLException e) {
            System.err.println("Erro ao buscar usuário por e-mail.");
            e.printStackTrace();
        }
        return usuario;
    }

    public List<Usuario> listarTop5Ranking() {
        List<Usuario> lista = new ArrayList<>();
        
        // Filtra o usuario admin direto no banco para nao aparecer no ranking
        String sql = "SELECT nome, cargo, xp, avatar FROM usuarios " +
                     "WHERE LOWER(nome) NOT IN ('Admin Arena') " +
                     "AND LOWER(COALESCE(cargo, '')) NOT LIKE '%admin%' " +
                     "AND LOWER(email) NOT LIKE 'admin%' " +
                     "ORDER BY xp DESC, nome ASC";

        try (Connection conexao = ConexaoJDBC.conectar();
                PreparedStatement stmt = conexao.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Usuario user = new Usuario();
                user.setNome(rs.getString("nome"));
                user.setCargo(rs.getString("cargo"));
                user.setXp(rs.getInt("xp"));
                user.setAvatar(rs.getString("avatar"));
                lista.add(user);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    public String registrarRespostaQuestao(String email, int perguntaId, int xpVariacao, String novoCargo,
            boolean acertou) {
        
        // OTIMIZADO: Busca o ID do usuario e checa se a pergunta ja foi respondida em 1 unica consulta
        String sqlBuscaUsuarioEResposta = "SELECT u.id, r.acertou " +
                "FROM usuarios u " +
                "LEFT JOIN respostas_usuarios r ON r.usuario_id = u.id AND r.pergunta_id = ? " +
                "WHERE u.email = ?";

        String sqlInsertResposta = "INSERT INTO respostas_usuarios (usuario_id, pergunta_id, acertou) VALUES (?, ?, ?)";
        String sqlUpdateResposta = "UPDATE respostas_usuarios SET acertou = ?, respondido_em = CURRENT_TIMESTAMP WHERE usuario_id = ? AND pergunta_id = ?";

        String sqlUpdateXP = "UPDATE usuarios SET " +
                "xp = GREATEST(0, xp + ?), cargo = ?, " +
                "questoes_acertadas = (SELECT COUNT(DISTINCT pergunta_id) FROM respostas_usuarios WHERE usuario_id = ? AND acertou = true), " +
                "total_questoes = (SELECT COUNT(*) FROM perguntas), " +
                "ofensiva = CASE WHEN ultima_atividade < CURRENT_DATE OR ultima_atividade IS NULL THEN ofensiva + 1 ELSE ofensiva END, " +
                "ultima_atividade = CURRENT_DATE " +
                "WHERE id = ?";

        String sqlProgressoModulo = "SELECT p.modulo_id, " +
                "(SELECT COUNT(*) FROM perguntas WHERE modulo_id = p.modulo_id) AS total_mod, " +
                "(SELECT COUNT(DISTINCT r.pergunta_id) FROM respostas_usuarios r JOIN perguntas p2 ON r.pergunta_id = p2.id WHERE p2.modulo_id = p.modulo_id AND r.usuario_id = ? AND r.acertou = true) AS acertos_mod " +
                "FROM perguntas p WHERE p.id = ?";

        String sqlConcluirModulo = "INSERT INTO modulos_concluidos (usuario_id, modulo_id) " +
                "SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM modulos_concluidos WHERE usuario_id = ? AND modulo_id = ?)";

        try (Connection conn = ConexaoJDBC.conectar()) {
            int usuarioId = -1;
            Boolean acertouAnteriormente = null;

            // 1. Busca o usuario e verifica a resposta anterior de uma so vez
            try (PreparedStatement stmtBusca = conn.prepareStatement(sqlBuscaUsuarioEResposta)) {
                stmtBusca.setInt(1, perguntaId);
                stmtBusca.setString(2, email);
                try (ResultSet rs = stmtBusca.executeQuery()) {
                    if (rs.next()) {
                        usuarioId = rs.getInt("id");
                        boolean valorAcertou = rs.getBoolean("acertou");
                        if (!rs.wasNull()) {
                            acertouAnteriormente = valorAcertou;
                        }
                    }
                }
            }

            if (usuarioId == -1)
                return "ERRO";

            // Se já tinha acertado antes, impede farm de XP nem abre transacao de escrita
            if (acertouAnteriormente != null && acertouAnteriormente) {
                return "DUPLICADO";
            }

            conn.setAutoCommit(false);

            // Se é inédita, insere; se tinha errado antes, atualiza na revisão
            if (acertouAnteriormente == null) {
                try (PreparedStatement stmtInsert = conn.prepareStatement(sqlInsertResposta)) {
                    stmtInsert.setInt(1, usuarioId);
                    stmtInsert.setInt(2, perguntaId);
                    stmtInsert.setBoolean(3, acertou);
                    stmtInsert.executeUpdate();
                }
            } else {
                try (PreparedStatement stmtUpd = conn.prepareStatement(sqlUpdateResposta)) {
                    stmtUpd.setBoolean(1, acertou);
                    stmtUpd.setInt(2, usuarioId);
                    stmtUpd.setInt(3, perguntaId);
                    stmtUpd.executeUpdate();
                }
            }

            // 2. Atualiza XP (+XP no acerto, -5 XP no erro), Cargo e Ofensiva
            try (PreparedStatement stmtUpdate = conn.prepareStatement(sqlUpdateXP)) {
                stmtUpdate.setInt(1, xpVariacao);
                stmtUpdate.setString(2, novoCargo);
                stmtUpdate.setInt(3, usuarioId);
                stmtUpdate.setInt(4, usuarioId);
                stmtUpdate.executeUpdate();
            }

            // 3. Verifica se atingiu >= 60% de acertos no módulo para desbloquear o próximo
            boolean concluiuModuloAgora = false;
            try (PreparedStatement stmtProg = conn.prepareStatement(sqlProgressoModulo)) {
                stmtProg.setInt(1, usuarioId);
                stmtProg.setInt(2, perguntaId);
                try (ResultSet rs = stmtProg.executeQuery()) {
                    if (rs.next()) {
                        int moduloId = rs.getInt("modulo_id");
                        int totalMod = rs.getInt("total_mod");
                        int acertosMod = rs.getInt("acertos_mod");
                        int notaDeCorte = (int) Math.ceil(totalMod * 0.6); // 60% de acertos

                        if (totalMod > 0 && acertosMod >= notaDeCorte) {
                            try (PreparedStatement stmtConc = conn.prepareStatement(sqlConcluirModulo)) {
                                stmtConc.setInt(1, usuarioId);
                                stmtConc.setInt(2, moduloId);
                                stmtConc.setInt(3, usuarioId);
                                stmtConc.setInt(4, moduloId);
                                concluiuModuloAgora = (stmtConc.executeUpdate() > 0);
                            }
                        }
                    }
                }
            }

            conn.commit();
            return concluiuModuloAgora ? "MODULO_CONCLUIDO" : "SUCESSO";

        } catch (Exception e) {
            e.printStackTrace();
            return "ERRO";
        }
    }

    public boolean atualizarPerfil(String email, String novoNome, String novoAvatar) {
        String sql = "UPDATE usuarios SET nome = ?, avatar = ? WHERE email = ?";

        try (Connection conn = ConexaoJDBC.conectar();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, novoNome);
            stmt.setString(2, novoAvatar);
            stmt.setString(3, email);

            return stmt.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}