# 🇲🇿 SERNIC - Plataforma de Candidaturas ao Concurso Público

Sistema web moderno e responsivo desenvolvido com **React 19**, **Vite 8**, **Node.js 24** e base de dados **SQLite**, recriando fielmente o portal do **SERVIÇO NACIONAL DE INVESTIGAÇÃO CRIMINAL (SERNIC)** com recursos avançados de temas, troca de idiomas e gestão de candidaturas.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** React 19, Vite 8, Lucide React, Vanilla CSS Modular (Design System responsivo).
- **Backend:** Node.js 24, Express 5.
- **Base de Dados:** SQLite (via `better-sqlite3` em modo WAL de alta performance).
- **Tipografia:** Google Fonts (*Plus Jakarta Sans* e *Inter*).

---

## ✨ Funcionalidades Implementadas

### 1. Novo Título Institucional
- Substituição de `"SISTEMA DE INFORMAÇÃO E GESTÃO DE RECURSOS HUMANOS"` por **`"PLATAFORMA DE CANDIDATURAS AO SERNIC"`**.
- Estrutura completa de cabeçalho:
  - *SERVIÇO NACIONAL DE INVESTIGAÇÃO CRIMINAL*
  - *DIRECÇÃO GERAL*
  - *DIRECÇÃO DE RECURSOS HUMANOS*
  - *PLATAFORMA DE CANDIDATURAS AO SERNIC*

### 2. Troca de Idioma (PT / EN)
- Botão no canto superior direito (`PT ⌵`).
- Ao clicar, abre o menu suspenso conforme a **Imagem 2**, exibindo a opção de alternar para **`EN`** (e vice-versa).
- Tradução dinâmica instantânea de todos os textos, rótulos, botões, modais e rodapé.

### 3. Modos de Tema (Claro, Escuro e Padrão Vermelho)
- **Tema Padrão (Imagem 1 - Predefinido):** Fundo vermelho oficial SERNIC (`#c32026`), cartão de login branco com sombras suaves, textos brancos e botões vermelhos. Ícone de contraste (`◐`).
- **Modo Escuro (Imagem 3):** Fundo azul meia-noite (`#121824`), cartão em ardósia escura (`#1a2536`), campos escuros com texto branco e ícone de Lua (`🌙`).
- **Modo Claro / Branco (Imagem 4):** Fundo branco limpo (`#f8fafc`), títulos em tom ardósia de alto contraste e ícone de Sol (`☀️`).

### 4. Paleta de Cores e Modo Aleatório (Imagem 5)
- Ícone de Paleta (`🎨`) no topo abre o painel flutuante com:
  - **TEMAS PREDEFINIDOS:** Grelha com 18 círculos de cores (azuis, verdes, vermelhos, roxos, grafite, âmbar, etc.).
  - **Indicador Concêntrico:** A cor actualmente seleccionada exibe anel duplo idêntico ao modelo da Imagem 5.
  - **COR PERSONALIZADA:** Seletor de cores nativo com amostra em tempo real (`Escolher cor...`).
  - **🎲 Cores Aleatórias:** Interruptor estilo iOS com animação suave do dado. Quando activo, transita automaticamente entre cores vibrantes e permite clicar no dado para sortear instantaneamente.

### 5. Logótipo de Qualidade Extrema
- Logótipo oficial do SERNIC renderizado em alta definição (`1024x1024`) com fundo transparente anti-serrilhado, integrando-se em qualquer cor de fundo.

### 6. Autenticação e Base de Dados SQLite
- **Tabelas criadas automaticamente:**
  - `users` (contas de acesso de candidatos e administradores).
  - `candidaturas` (processos submetidos com código de protocolo oficial).
  - `logs_acesso` (registo de auditoria de tentativas de login).
  - `configuracoes` (persistência das opções de tema e idioma).
- **Modais interativos:**
  - *Esqueceu a Senha?*: Validação e envio de código seguro.
  - *Solicitar Acesso*: Formulário completo de inscrição para novas vagas (Investigador Criminal, Perito Forense, etc.).
  - *Painel do Candidato*: Acesso pós-login exibindo o estado da candidatura e protocolo.

---

## 🔑 Credenciais para Demonstração

| Perfil | NUIT / Utilizador | Senha | Acesso |
| :--- | :--- | :--- | :--- |
| **Candidato Teste** | `100234567` | `sernic2026` | Painel do Candidato com candidatura ativa |
| **Candidata Demo** | `candidato` | `123456` | Conta padrão de demonstração |
| **Administração** | `admin` | `admin123` | Direcção de Recursos Humanos |

---

## 💻 Como Executar

O servidor de backend (porta `3001`) e o Vite (porta `5173`) rodam em simultâneo:

```bash
# Iniciar backend Express + frontend Vite
npm run dev

# Abrir no navegador
http://localhost:5173/
```
