package com.arenajava.model;

public class ModuloDTO {
    private int id;
    private String nome;
    private String descricao;
    private int xpBonus;
    private int totalQuestoes;
    private int questoesRespondidas;
    private boolean concluido;
    private boolean bloqueado;

    // Getters e Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public int getXpBonus() { return xpBonus; }
    public void setXpBonus(int xpBonus) { this.xpBonus = xpBonus; }
    public int getTotalQuestoes() { return totalQuestoes; }
    public void setTotalQuestoes(int totalQuestoes) { this.totalQuestoes = totalQuestoes; }
    public int getQuestoesRespondidas() { return questoesRespondidas; }
    public void setQuestoesRespondidas(int questoesRespondidas) { this.questoesRespondidas = questoesRespondidas; }
    public boolean isConcluido() { return concluido; }
    public void setConcluido(boolean concluido) { this.concluido = concluido; }
    public boolean isBloqueado() { return bloqueado; }
    public void setBloqueado(boolean bloqueado) { this.bloqueado = bloqueado; }
}