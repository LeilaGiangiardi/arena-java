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

@WebServlet("/api/perfil")
public class PerfilServlet extends HttpServlet {
    private UsuarioDAO dao = new UsuarioDAO();
    private Gson gson = new Gson();

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        JsonObject jsonResp = new JsonObject();
        String email = req.getParameter("email");

        if (email == null || email.isEmpty()) {
            jsonResp.addProperty("sucesso", false);
            resp.getWriter().write(jsonResp.toString());
            return;
        }

        Usuario usuario = dao.buscarPorEmail(email);
        if (usuario != null) {
            jsonResp.addProperty("sucesso", true);
            jsonResp.addProperty("nome", usuario.getNome());
            jsonResp.addProperty("email", usuario.getEmail());
            jsonResp.addProperty("xp", usuario.getXp());
            jsonResp.addProperty("cargo", usuario.getCargo());
            jsonResp.addProperty("ofensiva", usuario.getOfensiva());
            jsonResp.addProperty("avatar", usuario.getAvatar() != null ? usuario.getAvatar() : usuario.getNome());
        } else {
            jsonResp.addProperty("sucesso", false);
        }

        resp.getWriter().write(jsonResp.toString());
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
            String novoNome = jsonReq.get("nome").getAsString().trim();
            String novoAvatar = jsonReq.get("avatar").getAsString().trim();

            if (novoNome.isEmpty()) {
                jsonResp.addProperty("sucesso", false);
                resp.getWriter().write(jsonResp.toString());
                return;
            }

            boolean atualizado = dao.atualizarPerfil(email, novoNome, novoAvatar);
            jsonResp.addProperty("sucesso", atualizado);
            jsonResp.addProperty("nome", novoNome);
            jsonResp.addProperty("avatar", novoAvatar);
        } catch (Exception e) {
            e.printStackTrace();
            jsonResp.addProperty("sucesso", false);
        }

        resp.getWriter().write(jsonResp.toString());
    }
}