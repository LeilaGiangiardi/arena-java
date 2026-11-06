package com.arenajava.dao;

import com.arenajava.model.Pergunta;
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

    public List<Pergunta> buscarPorModulo(int moduloId) {
        List<Pergunta> perguntas = new ArrayList<>();
        
        // Busca as perguntas e ordena por nível de dificuldade para criar a trilha
        String sql = "SELECT * FROM perguntas WHERE modulo_id = ? ORDER BY nivel ASC, id ASC";

        try (PreparedStatement stmt = conexao.prepareStatement(sql)) {
            
            stmt.setInt(1, moduloId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Pergunta p = new Pergunta();
                    
                    // Mapeamento dos metadados
                    p.setId(rs.getInt("id"));
                    p.setModuloId(rs.getInt("modulo_id"));
                    p.setNivel(rs.getInt("nivel"));
                    p.setXpRecompensa(rs.getInt("xp_recompensa"));
                    p.setTipoPergunta(rs.getInt("tipo_pergunta"));
                    
                    // Mapeamento do conteúdo visual
                    p.setEnunciado(rs.getString("enunciado"));
                    p.setCodigoSnippet(rs.getString("codigo_snippet"));
                    
                    // Mapeamento das opções (podem vir nulas do banco nos tipos 2 e 3)
                    p.setOpcaoA(rs.getString("opcao_a"));
                    p.setOpcaoB(rs.getString("opcao_b"));
                    p.setOpcaoC(rs.getString("opcao_c"));
                    p.setOpcaoD(rs.getString("opcao_d"));
                    p.setRespostaCorreta(rs.getString("resposta_correta"));
                    
                    // Mapeamento das validações híbridas
                    p.setValidacaoRegex(rs.getString("validacao_regex"));
                    p.setTestesUnitariosOcultos(rs.getString("testes_unitarios_ocultos"));
                    
                    // O diferencial do Arena Java
                    p.setFeedbackErro(rs.getString("feedback_erro"));
                    
                    perguntas.add(p);
                }
            }
        } catch (SQLException e) {
            System.err.println("Erro ao buscar perguntas do módulo " + moduloId + ": " + e.getMessage());
        }
        
        return perguntas;
    }
}