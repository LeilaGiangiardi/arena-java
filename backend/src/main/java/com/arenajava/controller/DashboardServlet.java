package com.arenajava.controller;

import com.arenajava.dao.UsuarioDAO;
import com.arenajava.model.Usuario;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/api/dashboard")
public class DashboardServlet extends HttpServlet {
    
    private UsuarioDAO usuarioDAO = new UsuarioDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String email = request.getParameter("email");
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        if (email == null || email.isEmpty()) {
            out.print("{\"sucesso\": false}");
            return;
        }

        Usuario usuarioLogado = usuarioDAO.buscarPorEmail(email);
        List<Usuario> ranking = usuarioDAO.listarTop5Ranking();

        if (usuarioLogado != null) {
            // Construção manual de JSON seguro para não depender de pacotes externos
            StringBuilder json = new StringBuilder();
            json.append("{\"sucesso\": true, ");
            
            // Dados Estatísticas
            json.append("\"estatisticas\": {")
                .append("\"nome\": \"").append(usuarioLogado.getNome()).append("\", ")
                .append("\"xp\": ").append(usuarioLogado.getXp()).append(", ")
                .append("\"cargo\": \"").append(usuarioLogado.getCargo()).append("\", ")
                .append("\"ofensiva\": ").append(usuarioLogado.getOfensiva()).append(", ")
                .append("\"questoesAcertadas\": ").append(usuarioLogado.getQuestoesAcertadas()).append(", ")
                .append("\"totalQuestoes\": ").append(usuarioLogado.getTotalQuestoes()).append(", ")
                .append("\"dominio\": \"").append(usuarioLogado.getDominio()).append("\"")
                .append("}, ");
            
            // Dados Ranking
            json.append("\"ranking\": [");
            for (int i = 0; i < ranking.size(); i++) {
                Usuario u = ranking.get(i);
                json.append("{")
                    .append("\"nome\": \"").append(u.getNome()).append("\", ")
                    .append("\"cargo\": \"").append(u.getCargo()).append("\", ")
                    .append("\"xp\": ").append(u.getXp())
                    .append("}");
                if (i < ranking.size() - 1) json.append(", ");
            }
            json.append("]}");
            
            out.print(json.toString());
        } else {
            out.print("{\"sucesso\": false}");
        }
        out.flush();
    }
}