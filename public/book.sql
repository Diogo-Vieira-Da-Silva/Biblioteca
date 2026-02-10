DROP DATABASE IF EXISTS livros;
CREATE DATABASE livros;
USE livros;

CREATE TABLE usuarios (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE,
    nome_e_sobrenome VARCHAR(100) NOT NULL
);

CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    genero VARCHAR(50) NOT NULL,

    status_leitura ENUM('Lendo', 'Ainda não li', 'Finalizado') NOT NULL,

    nota ENUM(
        '0 ESTRELAS',
        '1 ESTRELA',
        '2 ESTRELAS',
        '3 ESTRELAS',
        '4 ESTRELAS',
        '5 ESTRELAS',
        'Ainda não li'
    ) NOT NULL,

    complemento_nota VARCHAR(100),

    ano_de_publicacao YEAR NOT NULL,

    usuario_id VARCHAR(50) NOT NULL,

    CONSTRAINT fk_books_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

   