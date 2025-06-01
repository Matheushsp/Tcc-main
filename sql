-- Criar banco de dados
CREATE DATABASE cardapio_db;

-- Usar o banco de dados
\c cardapio_db;

-- Criar tabela de produtos
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    imagem TEXT NOT NULL
);

-- Criar tabela de pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_nome VARCHAR(100) NOT NULL,
    cliente_telefone VARCHAR(20) NOT NULL,
    itens JSONB NOT NULL, -- Lista de produtos comprados
    total DECIMAL(10,2) NOT NULL,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




CREATE DATABASE cardapio_db;

CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    quantidade INT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    endereco TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



INSERT INTO produtos (nome, descricao, preco, imagem) 
VALUES ('Cookies Smash', 'Cookies de chocolate intenso', 18.00, 'img/cookies-smash.jpg');



INSERT INTO pedidos (cliente_nome, cliente_telefone, itens, total) 
VALUES (
    'João Silva', 
    '+55 11 98765-4321', 
    '[{"id": 1, "nome": "Cookies Smash", "quantidade": 2, "preco": 18.00}]'::jsonb, 
    36.00
);
