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

    // Busca toda a trilha do usuario em 1 unica consulta pelo e-mail
    public List<ModuloDTO> listarTrilhaPorEmail(String email) {
        List<ModuloDTO> modulos = new ArrayList<>();

        String sql = "SELECT m.id, m.nome, m.descricao, m.xp_bonus_conclusao, " +
                     "COUNT(DISTINCT p.id) AS total_questoes, " +
                     "COUNT(DISTINCT CASE WHEN r.acertou = true THEN r.pergunta_id END) AS respondidas " +
                     "FROM modulos m " +
                     "INNER JOIN usuarios u ON u.email = ? " +
                     "LEFT JOIN perguntas p ON p.modulo_id = m.id " +
                     "LEFT JOIN respostas_usuarios r ON r.pergunta_id = p.id AND r.usuario_id = u.id " +
                     "GROUP BY m.id, m.nome, m.descricao, m.xp_bonus_conclusao " +
                     "ORDER BY m.id ASC";

        try (Connection conexao = ConexaoJDBC.conectar();
             PreparedStatement stmt = conexao.prepareStatement(sql)) {

            stmt.setString(1, email);

            try (ResultSet rs = stmt.executeQuery()) {
                boolean moduloAnteriorConcluido = true; // O Módulo 1 é sempre aberto

                while (rs.next()) {
                    int totalQuestoes = rs.getInt("total_questoes");
                    int respondidas = rs.getInt("respondidas");
                    int notaDeCorte = (int) Math.ceil(totalQuestoes * 0.6);
                    boolean concluido = totalQuestoes > 0 && respondidas >= notaDeCorte;

                    ModuloDTO mod = new ModuloDTO();
                    mod.setId(rs.getInt("id"));
                    mod.setNome(rs.getString("nome"));
                    mod.setDescricao(rs.getString("descricao"));
                    mod.setXpBonus(rs.getInt("xp_bonus_conclusao"));
                    mod.setTotalQuestoes(totalQuestoes);
                    mod.setQuestoesRespondidas(respondidas);
                    mod.setConcluido(concluido);
                    mod.setBloqueado(!moduloAnteriorConcluido);

                    modulos.add(mod);
                    moduloAnteriorConcluido = concluido;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return modulos;
    }

    public List<ModuloDTO> listarTrilhaDoUsuario(int usuarioId) {
        List<ModuloDTO> modulos = new ArrayList<>();

        String sql = "SELECT m.id, m.nome, m.descricao, m.xp_bonus_conclusao, " +
                     "COUNT(DISTINCT p.id) AS total_questoes, " +
                     "COUNT(DISTINCT CASE WHEN r.acertou = true THEN r.pergunta_id END) AS respondidas " +
                     "FROM modulos m " +
                     "LEFT JOIN perguntas p ON p.modulo_id = m.id " +
                     "LEFT JOIN respostas_usuarios r ON r.pergunta_id = p.id AND r.usuario_id = ? " +
                     "GROUP BY m.id, m.nome, m.descricao, m.xp_bonus_conclusao " +
                     "ORDER BY m.id ASC";

        try (Connection conexao = ConexaoJDBC.conectar();
             PreparedStatement stmt = conexao.prepareStatement(sql)) {

            stmt.setInt(1, usuarioId);

            try (ResultSet rs = stmt.executeQuery()) {
                boolean moduloAnteriorConcluido = true;

                while (rs.next()) {
                    int totalQuestoes = rs.getInt("total_questoes");
                    int respondidas = rs.getInt("respondidas");
                    int notaDeCorte = (int) Math.ceil(totalQuestoes * 0.6);
                    boolean concluido = totalQuestoes > 0 && respondidas >= notaDeCorte;

                    ModuloDTO mod = new ModuloDTO();
                    mod.setId(rs.getInt("id"));
                    mod.setNome(rs.getString("nome"));
                    mod.setDescricao(rs.getString("descricao"));
                    mod.setXpBonus(rs.getInt("xp_bonus_conclusao"));
                    mod.setTotalQuestoes(totalQuestoes);
                    mod.setQuestoesRespondidas(respondidas);
                    mod.setConcluido(concluido);
                    mod.setBloqueado(!moduloAnteriorConcluido);

                    modulos.add(mod);
                    moduloAnteriorConcluido = concluido;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return modulos;
    }
}