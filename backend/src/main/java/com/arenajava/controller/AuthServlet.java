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

@WebServlet("/api/auth")
public class AuthServlet extends HttpServlet {
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
            
            String acao = jsonReq.get("acao").getAsString();
            String email = jsonReq.get("email").getAsString();
            String senha = jsonReq.get("senha").getAsString();
            
            if ("login".equals(acao)) {
                Usuario usuario = dao.buscarPorEmail(email);
                
                // CORREÇÃO: A checagem de nulo (usuario != null) precisa vir PRIMEIRO
                if (usuario != null && usuario.getSenhaHash() != null && usuario.getSenhaHash().equals(senha)) {
                    jsonResp.addProperty("sucesso", true);
                    jsonResp.addProperty("mensagem", "Login aprovado!");
                    jsonResp.addProperty("email", usuario.getEmail());
                    jsonResp.addProperty("nome", usuario.getNome());
                    jsonResp.addProperty("cargo", usuario.getCargo());
                    jsonResp.addProperty("xp", usuario.getXp());
                } else {
                    jsonResp.addProperty("sucesso", false);
                    jsonResp.addProperty("mensagem", "Credenciais inválidas.");
                }
            } 
            else if ("cadastrar".equals(acao)) {
                if (dao.buscarPorEmail(email) != null) {
                    jsonResp.addProperty("sucesso", false);
                    jsonResp.addProperty("mensagem", "Este e-mail já está em uso.");
                } else {
                    // Pega o nome. Se não vier no JSON por algum motivo, usa "Aluno"
                    String nome = jsonReq.has("nome") ? jsonReq.get("nome").getAsString() : "Aluno";
                    
                    Usuario novoUsuario = new Usuario();
                    novoUsuario.setNome(nome);
                    novoUsuario.setEmail(email);
                    novoUsuario.setSenhaHash(senha);
                    novoUsuario.setGithub(""); // Evita quebrar o PostgreSQL com campos nulos
                    
                    if (dao.cadastrar(novoUsuario)) {
                        jsonResp.addProperty("sucesso", true);
                        jsonResp.addProperty("mensagem", "Conta criada com sucesso!");
                        
                        // Devolve os dados para login instantâneo
                        jsonResp.addProperty("email", email);
                        jsonResp.addProperty("nome", nome);
                        jsonResp.addProperty("cargo", "Criador de bugs 🐛");
                        jsonResp.addProperty("xp", 0);
                    } else {
                        jsonResp.addProperty("sucesso", false);
                        jsonResp.addProperty("mensagem", "Erro interno ao salvar no banco.");
                    }
                }
            }
        } catch (Exception e) {
            // Em vez do Java travar em silêncio, ele devolve o motivo exato
            e.printStackTrace();
            jsonResp.addProperty("sucesso", false);
            jsonResp.addProperty("mensagem", "Erro interno de Servidor. Consulte o log.");
        }

        resp.getWriter().write(jsonResp.toString());
    }
}