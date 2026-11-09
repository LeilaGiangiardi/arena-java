package com.arenajava.controller;

import com.arenajava.dao.ModuloDAO;
import com.arenajava.dao.UsuarioDAO;
import com.arenajava.model.ModuloDTO;
import com.arenajava.model.Usuario;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/api/trilha")
public class TrilhaServlet extends HttpServlet {
    
    private UsuarioDAO usuarioDAO = new UsuarioDAO();
    private ModuloDAO moduloDAO = new ModuloDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        String email = request.getParameter("email");

        if (email == null || email.isEmpty()) {
            out.print("{\"sucesso\": false}");
            return;
        }

        Usuario usuario = usuarioDAO.buscarPorEmail(email);
        if (usuario != null) {
            List<ModuloDTO> trilha = moduloDAO.listarTrilhaDoUsuario(usuario.getId());
            
            // Gerador de JSON Manual seguro
            StringBuilder json = new StringBuilder("{\"sucesso\": true, \"modulos\": [");
            for (int i = 0; i < trilha.size(); i++) {
                ModuloDTO m = trilha.get(i);
                json.append("{")
                    .append("\"id\": ").append(m.getId()).append(", ")
                    .append("\"nome\": \"").append(m.getNome()).append("\", ")
                    .append("\"descricao\": \"").append(m.getDescricao() != null ? m.getDescricao().replace("\"", "\\\"") : "").append("\", ")
                    .append("\"xpBonus\": ").append(m.getXpBonus()).append(", ")
                    .append("\"totalQuestoes\": ").append(m.getTotalQuestoes()).append(", ")
                    .append("\"questoesRespondidas\": ").append(m.getQuestoesRespondidas()).append(", ")
                    .append("\"concluido\": ").append(m.isConcluido()).append(", ")
                    .append("\"bloqueado\": ").append(m.isBloqueado())
                    .append("}");
                if (i < trilha.size() - 1) json.append(", ");
            }
            json.append("]}");
            out.print(json.toString());
        } else {
            out.print("{\"sucesso\": false}");
        }
        out.flush();
    }
}