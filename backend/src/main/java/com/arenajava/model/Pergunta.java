package com.arenajava.model;

public class Pergunta {

    private int id;
    private int moduloId;
    private int nivel;
    private int xpRecompensa;
    private int tipoPergunta; // 1 = Múltipla Escolha, 2 = Aberta, 3 = IDE
    private boolean jaRespondida;
    private String enunciado;
    private String codigoSnippet;

    // Alternativas (podem ser null se o tipo for 2 ou 3)
    private String opcaoA;
    private String opcaoB;
    private String opcaoC;
    private String opcaoD;
    private String respostaCorreta;

    // Validações híbridas
    private String validacaoRegex;
    private String testesUnitariosOcultos;

    // O coração educacional do sistema
    private String feedbackErro;

    // Construtor vazio (necessário para o DAO instanciar e preencher)
    public Pergunta() {
    }

    public boolean isJaRespondida() {
        return jaRespondida;
    }

    public void setJaRespondida(boolean jaRespondida) {
        this.jaRespondida = jaRespondida;
    }

    // Getters e Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getModuloId() {
        return moduloId;
    }

    public void setModuloId(int moduloId) {
        this.moduloId = moduloId;
    }

    public int getNivel() {
        return nivel;
    }

    public void setNivel(int nivel) {
        this.nivel = nivel;
    }

    public int getXpRecompensa() {
        return xpRecompensa;
    }

    public void setXpRecompensa(int xpRecompensa) {
        this.xpRecompensa = xpRecompensa;
    }

    public int getTipoPergunta() {
        return tipoPergunta;
    }

    public void setTipoPergunta(int tipoPergunta) {
        this.tipoPergunta = tipoPergunta;
    }

    public String getEnunciado() {
        return enunciado;
    }

    public void setEnunciado(String enunciado) {
        this.enunciado = enunciado;
    }

    public String getCodigoSnippet() {
        return codigoSnippet;
    }

    public void setCodigoSnippet(String codigoSnippet) {
        this.codigoSnippet = codigoSnippet;
    }

    public String getOpcaoA() {
        return opcaoA;
    }

    public void setOpcaoA(String opcaoA) {
        this.opcaoA = opcaoA;
    }

    public String getOpcaoB() {
        return opcaoB;
    }

    public void setOpcaoB(String opcaoB) {
        this.opcaoB = opcaoB;
    }

    public String getOpcaoC() {
        return opcaoC;
    }

    public void setOpcaoC(String opcaoC) {
        this.opcaoC = opcaoC;
    }

    public String getOpcaoD() {
        return opcaoD;
    }

    public void setOpcaoD(String opcaoD) {
        this.opcaoD = opcaoD;
    }

    public String getRespostaCorreta() {
        return respostaCorreta;
    }

    public void setRespostaCorreta(String respostaCorreta) {
        this.respostaCorreta = respostaCorreta;
    }

    public String getValidacaoRegex() {
        return validacaoRegex;
    }

    public void setValidacaoRegex(String validacaoRegex) {
        this.validacaoRegex = validacaoRegex;
    }

    public String getTestesUnitariosOcultos() {
        return testesUnitariosOcultos;
    }

    public void setTestesUnitariosOcultos(String testesUnitariosOcultos) {
        this.testesUnitariosOcultos = testesUnitariosOcultos;
    }

    public String getFeedbackErro() {
        return feedbackErro;
    }

    public void setFeedbackErro(String feedbackErro) {
        this.feedbackErro = feedbackErro;
    }
}