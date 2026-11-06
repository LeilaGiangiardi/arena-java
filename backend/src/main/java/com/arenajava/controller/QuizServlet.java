package com.arenajava.controller;

import com.arenajava.dao.PerguntaDAO;
import com.arenajava.model.Pergunta;
import com.google.gson.Gson;
import com.arenajava.util.ConexaoJDBC;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.util.List;

@WebServlet("/api/quiz")
public class QuizServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Configura o retorno para JSON e acentuação correta para o front-end
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        // Evita bloqueios de CORS ao testar com o arquivo HTML local
        response.setHeader("Access-Control-Allow-Origin", "*");

        // Pega o módulo da URL. Ex: /api/quiz?moduloId=1
        String moduloParam = request.getParameter("moduloId");
        int moduloId = 1; // Módulo padrão (O Despertar do Bytecode)
        
        if (moduloParam != null && !moduloParam.isEmpty()) {
            try {
                moduloId = Integer.parseInt(moduloParam);
            } catch (NumberFormatException e) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"erro\": \"ID de módulo inválido.\"}");
                return;
            }
        }

        try (Connection conexao = ConexaoJDBC.conectar()) { 
            PerguntaDAO dao = new PerguntaDAO(conexao);
            List<Pergunta> perguntas = dao.buscarPorModulo(moduloId);

            if (perguntas.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"erro\": \"Nenhuma pergunta cadastrada para este módulo.\"}");
            } else {
                // Transforma a lista de objetos Java em um texto JSON perfeito
                Gson gson = new Gson();
                String json = gson.toJson(perguntas);
                
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write(json);
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"erro\": \"Erro de infraestrutura ao buscar perguntas.\"}");
            e.printStackTrace();
        }
    }
}