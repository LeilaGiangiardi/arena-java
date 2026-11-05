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

@WebServlet("/api/cadastro")
public class CadastroServlet extends HttpServlet {

    private UsuarioDAO usuarioDAO;

    @Override
    public void init() throws ServletException {
        // Inicializa a camada DAO quando a Servlet entra em memória
        this.usuarioDAO = new UsuarioDAO();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Configura o tipo de resposta como JSON e a codificação como UTF-8
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();

        // 1. Captura os parâmetros enviados pelo Front-end
        String nome = request.getParameter("nome");
        String email = request.getParameter("email");
        String github = request.getParameter("github");
        String senha = request.getParameter("senha");

        // 2. Validação simples de campos obrigatórios
        if (nome == null || email == null || senha == null || 
            nome.trim().isEmpty() || email.trim().isEmpty() || senha.trim().isEmpty()) {
            
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST); // HTTP 400
            out.print("{\"sucesso\": false, \"mensagem\": \"Campos obrigatórios (nome, email, senha) estão ausentes.\"}");
            out.flush();
            return;
        }

        // 3. Verifica se já existe um usuário com o mesmo e-mail
        Usuario usuarioExistente = usuarioDAO.buscarPorEmail(email);
        if (usuarioExistente != null) {
            response.setStatus(HttpServletResponse.SC_CONFLICT); // HTTP 409
            out.print("{\"sucesso\": false, \"mensagem\": \"Este e-mail já está cadastrado no Arena Java.\"}");
            out.flush();
            return;
        }

        // 4. Cria a instância de Usuario (cargo padrão e 0 XP)
        Usuario novoUsuario = new Usuario(nome, email, github, senha);

        // 5. Tenta persistir no banco de dados através do DAO
        boolean cadastrou = usuarioDAO.cadastrar(novoUsuario);

        if (cadastrou) {
            response.setStatus(HttpServletResponse.SC_CREATED); // HTTP 201
            out.print("{\"sucesso\": true, \"mensagem\": \"Calouro cadastrado com sucesso na Arena Java!\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // HTTP 500
            out.print("{\"sucesso\": false, \"mensagem\": \"Erro interno ao cadastrar usuário no banco de dados.\"}");
        }

        out.flush();
    }
}