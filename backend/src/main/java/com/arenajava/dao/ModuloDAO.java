package com.arenajava.dao;

import com.arenajava.model.ModuloDTO;
import com.arenajava.util.ConexaoJDBC;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ModuloDAO {

    public List<ModuloDTO> listarTrilhaDoUsuario(int usuarioId) {
        List<ModuloDTO> modulos = new ArrayList<>();

        // 1. Remove conclusão caso algum módulo tenha menos de 60% de acertos reais
        String sqlClean = "DELETE FROM modulos_concluidos mc " +
                "WHERE mc.usuario_id = ? AND (" +
                "  SELECT COUNT(DISTINCT r.pergunta_id) FROM respostas_usuarios r " +
                "  JOIN perguntas p ON r.pergunta_id = p.id " +
                "  WHERE p.modulo_id = mc.modulo_id AND r.usuario_id = ? AND r.acertou = true" +
                ") < CEIL((SELECT COUNT(*) FROM perguntas p2 WHERE p2.modulo_id = mc.modulo_id) * 0.6)";

        // 2. Insere conclusão automaticamente apenas se tiver >= 60% de acertos reais
        String sqlSync = "INSERT INTO modulos_concluidos (usuario_id, modulo_id) " +
                "SELECT ?, m.id FROM modulos m " +
                "WHERE (SELECT COUNT(*) FROM perguntas p WHERE p.modulo_id = m.id) > 0 " +
                "AND (SELECT COUNT(DISTINCT r.pergunta_id) FROM respostas_usuarios r JOIN perguntas p ON r.pergunta_id = p.id WHERE p.modulo_id = m.id AND r.usuario_id = ? AND r.acertou = true) " +
                ">= CEIL((SELECT COUNT(*) FROM perguntas p WHERE p.modulo_id = m.id) * 0.6) " +
                "AND NOT EXISTS (SELECT 1 FROM modulos_concluidos mc WHERE mc.usuario_id = ? AND mc.modulo_id = m.id)";

        // 3. Conta APENAS as questões ACERTADAS (r.acertou = true) para exibir na barra da Trilha (ex: 7/10)
        String sql = "SELECT m.id, m.nome, m.descricao, m.xp_bonus_conclusao, " +
                     "(SELECT COUNT(*) FROM perguntas p WHERE p.modulo_id = m.id) AS total_questoes, " +
                     "(SELECT COUNT(DISTINCT r.pergunta_id) FROM respostas_usuarios r JOIN perguntas p ON r.pergunta_id = p.id WHERE p.modulo_id = m.id AND r.usuario_id = ? AND r.acertou = true) AS respondidas, " +
                     "(SELECT COUNT(*) FROM modulos_concluidos mc WHERE mc.modulo_id = m.id AND mc.usuario_id = ?) AS concluido " +
                     "FROM modulos m ORDER BY m.id ASC";

        try (Connection conexao = ConexaoJDBC.conectar()) {

            try (PreparedStatement stmtClean = conexao.prepareStatement(sqlClean)) {
                stmtClean.setInt(1, usuarioId);
                stmtClean.setInt(2, usuarioId);
                stmtClean.executeUpdate();
            } catch (SQLException e) {
                System.err.println("Aviso ao limpar modulos_concluidos: " + e.getMessage());
            }

            try (PreparedStatement stmtSync = conexao.prepareStatement(sqlSync)) {
                stmtSync.setInt(1, usuarioId);
                stmtSync.setInt(2, usuarioId);
                stmtSync.setInt(3, usuarioId);
                stmtSync.executeUpdate();
            } catch (SQLException e) {
                System.err.println("Aviso ao sincronizar modulos_concluidos: " + e.getMessage());
            }

            try (PreparedStatement stmt = conexao.prepareStatement(sql)) {
                stmt.setInt(1, usuarioId);
                stmt.setInt(2, usuarioId);

                try (ResultSet rs = stmt.executeQuery()) {
                    boolean moduloAnteriorConcluido = true; // O Módulo 1 é sempre aberto

                    while (rs.next()) {
                        ModuloDTO mod = new ModuloDTO();
                        mod.setId(rs.getInt("id"));
                        mod.setNome(rs.getString("nome"));
                        mod.setDescricao(rs.getString("descricao"));
                        mod.setXpBonus(rs.getInt("xp_bonus_conclusao"));
                        mod.setTotalQuestoes(rs.getInt("total_questoes"));
                        mod.setQuestoesRespondidas(rs.getInt("respondidas"));
                        mod.setConcluido(rs.getInt("concluido") > 0);
                        mod.setBloqueado(!moduloAnteriorConcluido);

                        modulos.add(mod);
                        moduloAnteriorConcluido = mod.isConcluido();
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return modulos;
    }
}