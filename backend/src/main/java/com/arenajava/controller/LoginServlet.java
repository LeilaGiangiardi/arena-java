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

@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {

    private UsuarioDAO usuarioDAO;

    @Override
    public void init() throws ServletException {
        this.usuarioDAO = new UsuarioDAO();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String email = request.getParameter("email");
        String senha = request.getParameter("senha");

        // 1. Validação simples
        if (email == null || senha == null || email.trim().isEmpty() || senha.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST); // 400
            out.print("{\"sucesso\": false, \"mensagem\": \"E-mail e senha são obrigatórios.\"}");
            out.flush();
            return;
        }

        // 2. Busca o usuário no banco
        Usuario usuario = usuarioDAO.buscarPorEmail(email);

        // 3. Valida se o usuário existe e se a senha bate
        // Nota: Em um sistema real, aqui compararíamos o hash da senha (ex: BCrypt). 
        if (usuario == null || !usuario.getSenhaHash().equals(senha)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
            out.print("{\"sucesso\": false, \"mensagem\": \"Credenciais inválidas. Tente novamente.\"}");
            out.flush();
            return;
        }

        // 4. Sucesso! Retorna os dados do calouro para o front-end montar o Dashboard
        response.setStatus(HttpServletResponse.SC_OK); // 200
        
        // Montando um JSON manual com os dados do jogador (cargo, XP, etc)
        String jsonResposta = String.format(
            "{\"sucesso\": true, \"mensagem\": \"Login realizado com sucesso!\", \"usuario\": {\"nome\": \"%s\", \"cargo\": \"%s\", \"xp\": %d}}",
            usuario.getNome(), usuario.getCargo(), usuario.getXp()
        );
        
        out.print(jsonResposta);
        out.flush();
    }
}