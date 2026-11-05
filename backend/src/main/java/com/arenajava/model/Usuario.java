package com.arenajava.model;

import java.sql.Timestamp;

public class Usuario {
    
    private Integer id;
    private String nome;
    private String email;
    private String github;
    private String senhaHash;
    private int xp;
    private String cargo;
    private Timestamp criadoEm;

    public Usuario() {
    }
    /**
     * Construtor utilitário para cadastrar um novo usuário.
     * Não inclui id, xp, cargo e criadoEm porque estes são gerados automaticamente pelo PostgreSQL.
     */
    public Usuario(String nome, String email, String github, String senhaHash) {
        this.nome = nome;
        this.email = email;
        this.github = github;
        this.senhaHash = senhaHash;
        this.xp = 0;
        this.cargo = "Derrubador de Servidor";
    }

    /**
     * Construtor completo para reidratar o objeto quando os dados vêm do banco via JDBC.
     */
    public Usuario(Integer id, String nome, String email, String github, String senhaHash, int xp, String cargo, Timestamp criadoEm) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.github = github;
        this.senhaHash = senhaHash;
        this.xp = xp;
        this.cargo = cargo;
        this.criadoEm = criadoEm;
    }

    // Getters e Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public Timestamp getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Timestamp criadoEm) {
        this.criadoEm = criadoEm;
    }

    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", email='" + email + '\'' +
                ", xp=" + xp +
                ", cargo='" + cargo + '\'' +
                '}';
    }
}