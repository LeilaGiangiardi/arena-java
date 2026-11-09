package com.arenajava.controller;

import com.arenajava.dao.UsuarioDAO;
import com.arenajava.model.Usuario;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;

@WebServlet("/api/progresso")
public class ProgressoServlet extends HttpServlet {
    private UsuarioDAO dao = new UsuarioDAO();
    private Gson gson = new Gson();

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        JsonObject jsonResp = new JsonObject();

        try {
            BufferedReader reader = req.getReader();
            JsonObject jsonReq = gson.fromJson(reader, JsonObject.class);
            
            String email = jsonReq.get("email").getAsString();
            int perguntaId = jsonReq.get("perguntaId").getAsInt(); // NOVO: Puxa o ID da Pergunta
            int xpGanhoNaQuestao = jsonReq.get("xpGanho").getAsInt();
            boolean acertou = jsonReq.get("acertou").getAsBoolean();
            
            Usuario usuario = dao.buscarPorEmail(email);
            if (usuario == null) {
                jsonResp.addProperty("sucesso", false);
                resp.getWriter().write(jsonResp.toString());
                return;
            }

            int xpTotalFuturo = usuario.getXp() + xpGanhoNaQuestao;
            String novoCargo = calcularCargo(xpTotalFuturo);
            boolean subiuDeNivel = !novoCargo.equals(usuario.getCargo());
            
            // Verifica no banco
            String resultado = dao.registrarRespostaQuestao(email, perguntaId, xpGanhoNaQuestao, novoCargo, acertou);
            
            if ("SUCESSO".equals(resultado)) {
                jsonResp.addProperty("sucesso", true);
                jsonResp.addProperty("novoXp", xpTotalFuturo);
                jsonResp.addProperty("novoCargo", novoCargo);
                jsonResp.addProperty("subiuDeNivel", subiuDeNivel);
            } else if ("DUPLICADO".equals(resultado)) {
                jsonResp.addProperty("sucesso", false);
                jsonResp.addProperty("jaRespondida", true);
            } else {
                jsonResp.addProperty("sucesso", false);
            }

        } catch (Exception e) {
            e.printStackTrace();
            jsonResp.addProperty("sucesso", false);
        }

        resp.getWriter().write(jsonResp.toString());
    }

    private String calcularCargo(int xpTotal) {
        if (xpTotal >= 5000) return "Compilador Humano 🧠";
        if (xpTotal >= 3000) return "Mestre do Stack Overflow 🧙‍♂️";
        if (xpTotal >= 1500) return "Refém da Inteligência Artificial 🤖";
        if (xpTotal >= 500) return "Caçador de Ponto e Vírgula (;) 🔍";
        if (xpTotal >= 200) return "Criador de bugs 🐛";
        return "Derrubador de Servidor 💥";
    }
}