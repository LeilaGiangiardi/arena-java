package com.arenajava.dao;

import com.arenajava.model.Pergunta;
import com.arenajava.util.ConexaoJDBC;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class PerguntaDAO {

    private Connection conexao;

    // Construtor que recebe a conexão com o banco de dados
    public PerguntaDAO(Connection conexao) {
        this.conexao = conexao;
    }

    public List<Pergunta> buscarPorModulo(int moduloId, String email) {
        List<Pergunta> lista = new ArrayList<>();

        // A MÁGICA: Cruza as perguntas com o histórico do usuário
        String sql = "SELECT p.*, " +
                "CASE WHEN r.id IS NOT NULL THEN true ELSE false END as ja_respondida " +
                "FROM perguntas p " +
                "LEFT JOIN respostas_usuarios r ON p.id = r.pergunta_id AND r.usuario_id = (SELECT id FROM usuarios WHERE email = ?) "
                +
                "WHERE p.modulo_id = ? " +
                "ORDER BY p.id ASC";

        try (Connection conn = ConexaoJDBC.conectar();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);
            stmt.setInt(2, moduloId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Pergunta p = new Pergunta();
                    p.setId(rs.getInt("id"));
                    p.setModuloId(rs.getInt("modulo_id"));
                    p.setNivel(rs.getInt("nivel"));
                    p.setTipoPergunta(rs.getInt("tipo_pergunta"));
                    p.setEnunciado(rs.getString("enunciado"));
                    p.setCodigoSnippet(rs.getString("codigo_snippet"));
                    p.setOpcaoA(rs.getString("opcao_a"));
                    p.setOpcaoB(rs.getString("opcao_b"));
                    p.setOpcaoC(rs.getString("opcao_c"));
                    p.setOpcaoD(rs.getString("opcao_d"));
                    p.setRespostaCorreta(rs.getString("resposta_correta"));
                    p.setValidacaoRegex(rs.getString("validacao_regex"));
                    p.setFeedbackErro(rs.getString("feedback_erro"));
                    p.setXpRecompensa(rs.getInt("xp_recompensa"));

                    // NOVO: Preenche a flag se ele já respondeu
                    p.setJaRespondida(rs.getBoolean("ja_respondida"));

                    lista.add(p);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return lista;
    }
}