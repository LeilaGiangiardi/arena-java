package com.arenajava.controller;

import com.arenajava.dao.PerguntaDAO;
import com.arenajava.model.Pergunta;
import com.google.gson.Gson;
import com.arenajava.util.ConexaoJDBC; // Ajuste conforme a sua classe de conexão

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
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // Configura o cabeçalho para aceitar requisições de outras origens (CORS) e garantir acentuação UTF-8
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        // Pega os parâmetros enviados pela URL do front-end (ex: /api/quiz?moduloId=1&email=aluno@bsi.edu.br)
        String moduloParam = req.getParameter("moduloId");
        String email = req.getParameter("email");

        int moduloId = (moduloParam != null && !moduloParam.isEmpty()) ? Integer.parseInt(moduloParam) : 1;

        try (Connection conn = ConexaoJDBC.conectar()) {
            PerguntaDAO dao = new PerguntaDAO(conn);
            
            // Busca as perguntas do módulo cruzando com o histórico do usuário
            List<Pergunta> perguntas = dao.buscarPorModulo(moduloId, email);

            if (perguntas.isEmpty()) {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                resp.getWriter().write("{\"erro\": \"Nenhuma pergunta encontrada para este módulo.\"}");
            } else {
                // Serializa a lista de objetos Java em formato JSON limpo para o JavaScript ler
                Gson gson = new Gson();
                String json = gson.toJson(perguntas);

                resp.setStatus(HttpServletResponse.SC_OK);
                resp.getWriter().write(json);
            }

        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"erro\": \"Erro interno no servidor ao carregar o quiz.\"}");
        }
    }
}