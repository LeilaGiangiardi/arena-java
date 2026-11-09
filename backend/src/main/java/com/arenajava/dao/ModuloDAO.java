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
        
        // Esta query busca o módulo, conta as perguntas totais e as respondidas pelo usuário
        String sql = "SELECT m.id, m.nome, m.descricao, m.xp_bonus_conclusao, " +
                     "(SELECT COUNT(*) FROM perguntas p WHERE p.modulo_id = m.id) AS total_questoes, " +
                     "(SELECT COUNT(DISTINCT r.pergunta_id) FROM respostas_usuarios r JOIN perguntas p ON r.pergunta_id = p.id WHERE p.modulo_id = m.id AND r.usuario_id = ?) AS respondidas, " +
                     "(SELECT COUNT(*) FROM modulos_concluidos mc WHERE mc.modulo_id = m.id AND mc.usuario_id = ?) AS concluido " +
                     "FROM modulos m ORDER BY m.id ASC";

        try (Connection conexao = ConexaoJDBC.conectar();
             PreparedStatement stmt = conexao.prepareStatement(sql)) {

            stmt.setInt(1, usuarioId);
            stmt.setInt(2, usuarioId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                boolean moduloAnteriorConcluido = true; // O primeiro módulo é sempre aberto

                while (rs.next()) {
                    ModuloDTO mod = new ModuloDTO();
                    mod.setId(rs.getInt("id"));
                    mod.setNome(rs.getString("nome"));
                    mod.setDescricao(rs.getString("descricao"));
                    mod.setXpBonus(rs.getInt("xp_bonus_conclusao"));
                    mod.setTotalQuestoes(rs.getInt("total_questoes"));
                    mod.setQuestoesRespondidas(rs.getInt("respondidas"));
                    mod.setConcluido(rs.getInt("concluido") > 0);
                    
                    // Lógica do Cadeado: Se o módulo anterior não foi concluído, este fica bloqueado
                    mod.setBloqueado(!moduloAnteriorConcluido);
                    
                    modulos.add(mod);

                    // Atualiza a flag para o próximo módulo do loop
                    moduloAnteriorConcluido = mod.isConcluido(); 
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return modulos;
    }
}