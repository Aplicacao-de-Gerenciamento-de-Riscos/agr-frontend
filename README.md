# 🌐 Aplicação de Gerenciamento de Riscos - Frontend

Este repositório contém a aplicação frontend para o gerenciamento de riscos, desenvolvida em **Angular 12.2.17**.

---

## 📋 Pré-requisitos

Antes de rodar o projeto, você precisa ter os seguintes itens instalados:

- 🌐 **Node.js (v16)** - [Download aqui](https://nodejs.org/)
- 🅰️ **Angular CLI (v12.2.17)** - [Guia de instalação](https://angular.io/cli)

Para verificar as versões instaladas:

```bash
node -v
ng version
```

---

## ⚙️ Configurando a URL da API do Backend

Para o frontend se comunicar corretamente com o backend, configure a URL da API nos seguintes arquivos:

1. **Arquivo `src/environments/environment.ts`** (para ambiente de desenvolvimento):

   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8080'  // URL da API do backend
   };
   ```

2. **Arquivo `src/environments/environment.prod.ts`** (para ambiente de produção):

   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://sua-api-em-producao.com'  // URL da API do backend em produção
   };
   ```

---

## 🚀 Rodando a Aplicação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/Aplicacao-de-Gerenciamento-de-Riscos/agr-frontend.git
   cd agr-frontend
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Inicie a aplicação:**

   ```bash
   ng serve
   ```

4. **Acesse a aplicação em:**

   ```
   http://localhost:4200
   ```

---

## 🛠️ Gerando o Build de Produção

Para gerar o build otimizado para produção, execute:

```bash
ng build --prod
```

Os arquivos compilados ficarão na pasta `dist/`.

---

## 📦 Estrutura do Projeto

```
agr-frontend/
│-- src/
│   ├── app/             # Módulos e componentes principais
│   ├── assets/          # Imagens e recursos estáticos
│   ├── environments/    # Configurações de ambiente
│   ├── index.html       # HTML principal
│   └── styles.css       # Estilos globais
├── angular.json         # Configuração do Angular
├── package.json         # Dependências do projeto
└── README.md            # Documentação do projeto
```
