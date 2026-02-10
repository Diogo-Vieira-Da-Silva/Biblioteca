  const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Middleware CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware para servir arquivos estáticos (HTML, CSS, JS da pasta public/)
app.use(express.static(path.join(__dirname, "public")));

// Conexão com o banco MySQL via pool (via XAMPP)
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "diogovieira@0307",
  database: "livros",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verificar conexão inicial
db.getConnection((err, connection) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
  } else {
    console.log('Conectado ao banco de dados MySQL');
    connection.release();
  }
});

app.post('/usuarios', (req, res) => {
  const { id, cpf, nome } = req.body;
  
  console.log('Recebido:', { id, cpf, nome });
  
  // Verificar se já existe usuário com mesmo id OU cpf
  db.query('SELECT * FROM usuarios WHERE id = ? OR cpf = ?', [id, cpf], (err, results) => {
    if (err) {
      console.error('Erro ao verificar usuário:', err);
      return res.status(500).send('Erro ao verificar usuário: ' + err.message);
    }
    
    if (results.length > 0) {
      // id ou cpf já existe - verificar se TUDO é igual
      const usuario = results[0];
      if (usuario.id === id && usuario.cpf === cpf && usuario.nome_e_sobrenome === nome) {
        // Tudo igual - entrar na conta existente
        console.log('Conta encontrada - entrando!');
        return res.send('ENTRAR|Entrando na conta...');
      } else {
        // id ou cpf duplicado mas nome diferente - ERRO
        console.log('id/cpf já registrado!');
        return res.status(400).send('ERRO|id/cpf já registrado, crie um novo ou digite seu nome corretamente.');
      }
    }
    
    // Nenhum dado encontrado - criar nova conta
    db.query('INSERT INTO usuarios (id, cpf, nome_e_sobrenome) VALUES (?, ?, ?)', [id, cpf, nome], (err, result) => {
      if (err) {
        console.error('Erro ao inserir:', err);
        return res.status(500).send('Erro ao cadastrar usuário: ' + err.message);
      }
      console.log('Nova conta criada!');
      res.send('CRIAR|Conta nova criada!');
    });
  });
});

app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      console.error('Erro ao buscar:', err);
      return res.status(500).send('Erro ao buscar usuários');
    }
    
    // Retorna HTML formatado
    let html = '<h1>Usuários Cadastrados</h1>';
    html += '<table border="1"><tr><th>ID</th><th>CPF</th><th>Nome</th></tr>';
    results.forEach(user => {
      html += `<tr><td>${user.id}</td><td>${user.cpf}</td><td>${user.nome_e_sobrenome}</td></tr>`;
    });
    html += '</table>';
    html += '<br><a href="/">Voltar ao formulário</a>';
    res.send(html);
  });
});

// Rota para cadastrar livros
app.post('/livros', (req, res) => {
  const { titulo, autor, genero, ano, status, nota, usuario_id } = req.body;
  
  console.log('Recebido livro:', { titulo, autor, genero, ano, status, nota, usuario_id });
  
  if (!usuario_id) {
    console.error('Erro: usuario_id está vazio!');
    return res.status(400).send('Erro: ID do usuário não fornecido');
  }
  
  // Verificar se já existe livro com o mesmo título para este usuário
  db.query('SELECT * FROM books WHERE titulo = ? AND usuario_id = ?', [titulo, usuario_id], (err, results) => {
    if (err) {
      console.error('Erro ao verificar livro existente:', err);
      return res.status(500).send('Erro ao verificar livro: ' + err.message);
    }
    
    if (results.length > 0) {
      console.log('Livro com título já existente!');
      return res.status(400).send('ERRO|Esse livro já está registrado, corrija o título ou adicione outro livro');
    }
    
    // Se não existir, inserir novo livro
    db.query('INSERT INTO books (titulo, autor, genero, ano_de_publicacao, status_leitura, nota, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [titulo, autor, genero, ano, status, nota, usuario_id], (err, result) => {
      if (err) {
        console.error('Erro ao inserir livro:', err);
        return res.status(500).send('Erro ao cadastrar livro: ' + err.message);
      }
      console.log('Livro cadastrado com sucesso! ID:', result.insertId);
      res.send('Livro cadastrado com sucesso!');
    });
  });
});

// Rota para listar livros de um usuário específico (retorna JSON)
app.get('/livros/usuario/:usuario_id', (req, res) => {
  const usuario_id = req.params.usuario_id;
  
  db.query('SELECT * FROM books WHERE usuario_id = ? ORDER BY id DESC', [usuario_id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar livros:', err);
      return res.status(500).json({ erro: 'Erro ao buscar livros' });
    }
    
    console.log('Livros do usuário', usuario_id, ':', results.length);
    res.json(results);
  });
});

// Rota para excluir livro
app.delete('/livros/:id', (req, res) => {
  const id = req.params.id;
  
  db.query('DELETE FROM books WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Erro ao excluir livro:', err);
      return res.status(500).send('Erro ao excluir livro: ' + err.message);
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).send('Livro não encontrado');
    }
    
    console.log('Livro ID', id, 'excluído com sucesso!');
    res.send('Livro excluído com sucesso!');
  });
});

// Rota para listar livros (com JOIN)
app.get('/books', (req, res) => {
  const usuario_id = req.query.usuario_id;
  db.query('SELECT b.*, u.nome_e_sobrenome FROM books b JOIN usuarios u ON b.usuario_id = u.id', (err, results) => {
    if (err) {
      console.error('Erro ao buscar livros:', err);
      return res.status(500).send('Erro ao buscar livros');
    }
    
    console.log('Livros encontrados (JOIN):', results.length);
    
    // Debug: também buscar livros sem usuario_id
    db.query('SELECT * FROM books', (err2, allBooks) => {
      if (!err2) {
        console.log('Total de livros na tabela:', allBooks.length);
        if (allBooks.length > results.length) {
          console.log('ALERTA: Existem livros sem usuario_id válido!');
        }
      }
    });
    
    // Retorna HTML formatado
    let html = '<h1 class="border border-primary rounded p-4 text-center">Livros Cadastrados</h1>';
    html += '<div class="container mt-5"><div class="row justify-content-center"><div class="col-md-12">';
    html += '<table border="1" class="table table-striped">';
    html += '<tr><th>ID</th><th>Título</th><th>Autor</th><th>Gênero</th><th>Ano</th><th>Status</th><th>Nota</th><th>Usuário</th></tr>';
    if (results.length === 0) {
      html += '<tr><td colspan="8" class="text-center">Nenhum livro cadastrado</td></tr>';
    } else {
      results.forEach(livro => {
        html += `<tr><td>${livro.id}</td><td>${livro.titulo || ''}</td><td>${livro.autor || ''}</td><td>${livro.genero || ''}</td><td>${livro.ano_de_publicacao || ''}</td><td>${livro.status_leitura || ''}</td><td>${livro.nota || ''}</td><td>${livro.nome_e_sobrenome || ''}</td></tr>`;
      });
    }
    html += '</table>';
    html += '<br><a href="/livros.html' + (usuario_id ? '?usuario_id=' + usuario_id : '') + '" class="btn btn-primary">Voltar ao cadastro</a>';
    html += '</div></div></div>';
    html += '<link rel="stylesheet" href="/style.css">';
    res.send(html);
  });
});

// Rota de DEBUG para ver todos os livros (sem JOIN)
app.get('/debug-livros', (req, res) => {
  db.query('SELECT * FROM books', (err, results) => {
    if (err) {
      console.error('Erro ao buscar livros:', err);
      return res.status(500).send('Erro ao buscar livros');
    }
    
    console.log('Todos os livros:', results);
    
    let html = '<h1>DEBUG - Todos os Livros</h1>';
    html += '<table border="1">';
    html += '<tr><th>ID</th><th>Titulo</th><th>Autor</th><th>usuario_id</th></tr>';
    results.forEach(livro => {
      html += `<tr><td>${livro.id}</td><td>${livro.titulo || ''}</td><td>${livro.autor || ''}</td><td>${livro.usuario_id || 'NULL'}</td></tr>`;
    });
    html += '</table>';
    html += '<br><a href="/books">Ver lista normal</a>';
    res.send(html);
  });
});

app.listen(3000, () =>
  console.log("Servidor rodando em http://localhost:3000")
);

