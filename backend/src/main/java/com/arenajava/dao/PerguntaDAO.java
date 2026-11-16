package com.arenajava.dao;

import com.arenajava.model.Pergunta;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class PerguntaDAO {

    private Connection conexao;

    public PerguntaDAO(Connection conexao) {
        this.conexao = conexao;
    }

    public List<Pergunta> buscarPorModulo(int moduloId, String email) {
        List<Pergunta> lista = new ArrayList<>();

        // status_questao: 0 = Inédita, 10 = Errou anteriormente, 20 = Acertou anteriormente
        String sql = "SELECT p.*, " +
                "CASE WHEN r.id IS NOT NULL THEN true ELSE false END as ja_respondida, " +
                "CASE WHEN r.id IS NULL THEN 0 WHEN r.acertou = true THEN 20 ELSE 10 END as status_questao " +
                "FROM perguntas p " +
                "LEFT JOIN respostas_usuarios r ON p.id = r.pergunta_id AND r.usuario_id = (SELECT id FROM usuarios WHERE email = ?) " +
                "WHERE p.modulo_id = ? " +
                "ORDER BY p.id ASC";

        try (PreparedStatement stmt = this.conexao.prepareStatement(sql)) {

            stmt.setString(1, email);
            stmt.setInt(2, moduloId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Pergunta p = new Pergunta();
                    p.setId(rs.getInt("id"));
                    p.setModuloId(rs.getInt("modulo_id"));
                    p.setNivel(rs.getInt("status_questao"));
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