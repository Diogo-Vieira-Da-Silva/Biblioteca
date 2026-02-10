
 console.log('script.js externo carregado!');

// Armazenar livros em memória
let livrosDoUsuario = [];

// Função para adicionar botão de livro
function adicionarBotaoLivro(livro) {
    const container = document.getElementById('livrosList');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'd-flex align-items-center';
    div.id = 'livro-' + livro.id;
    
    div.innerHTML = `
        <button class="btn btn-outline-danger btn-sm me-1" onclick="mostrarLivro(${livro.id})">
            ${livro.titulo}
        </button>
        <button class="btn btn-outline-secondary btn-sm" onclick="excluirLivro(${livro.id})" title="Excluir">
            ✕
        </button>
    `;
    
    container.appendChild(div);
}

// Função para mostrar informações do livro no modal
window.mostrarLivro = function(livroId) {
    const livro = livrosDoUsuario.find(l => l.id === livroId);
    if (!livro) return;
    
    document.getElementById('livroModalTitle').textContent = livro.titulo;
    document.getElementById('livroModalBody').innerHTML = `
        <p><strong>Autor:</strong> ${livro.autor}</p>
        <p><strong>Gênero:</strong> ${livro.genero}</p>
        <p><strong>Ano:</strong> ${livro.ano_de_publicacao}</p>
        <p><strong>Status:</strong> ${livro.status_leitura}</p>
        <p><strong>Nota:</strong> ${livro.nota}</p>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('livroModal'));
    modal.show();
};

// Função para excluir livro
window.excluirLivro = function(livroId) {
    if (!confirm('Tem certeza que deseja excluir este livro?')) return;
    
    fetch('/livros/' + livroId, {
        method: 'DELETE'
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        // Remover botão da interface
        const div = document.getElementById('livro-' + livroId);
        if (div) div.remove();
        // Remover da memória
        livrosDoUsuario = livrosDoUsuario.filter(l => l.id !== livroId);
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao excluir livro: ' + error);
    });
};

// Carregar livros do usuário
function carregarLivros(usuarioId) {
    fetch('/livros/usuario/' + usuarioId)
    .then(response => response.json())
    .then(data => {
        livrosDoUsuario = data;
        const container = document.getElementById('livrosList');
        if (container) container.innerHTML = '';
        data.forEach(livro => adicionarBotaoLivro(livro));
    })
    .catch(error => {
        console.error('Erro ao carregar livros:', error);
    });
}

// Event listener para formulário de usuário (só executa se o formulário existir)
const usuarioForm = document.getElementById('usuarioForm');
if (usuarioForm) {
  usuarioForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        id: document.getElementById('id').value,
        cpf: document.getElementById('cpf').value,
        nome: document.getElementById('nome').value
    };

    // Validar CPF: deve ter exatamente 11 números
    if (!/^\d{11}$/.test(formData.cpf)) {
        alert('CPF deve conter exatamente 11 números!');
        return;
    }

    console.log('Enviando dados:', formData);

    fetch('/usuarios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.text())
    .then(data => {
        console.log('Resposta:', data);
        
        const prefix = data.split('|')[0];
        const message = data.split('|')[1] || data;
        
        if (prefix === 'CRIAR') {
            alert(message);
            document.getElementById('usuarioForm').reset();
            window.location.href = '/livros.html?usuario_id=' + encodeURIComponent(formData.id);
        } else if (prefix === 'ENTRAR') {
            alert(message);
            window.location.href = '/livros.html?usuario_id=' + encodeURIComponent(formData.id);
        } else if (prefix === 'ERRO') {
            alert(message);
        } else {
            alert(data);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro: ' + error);
    });
  });
}

// Event listener para formulário de livros (só executa se o formulário existir)
const livroForm = document.getElementById('livroForm');
if (livroForm) {
  livroForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        genero: document.getElementById('genero').value,
        ano: document.getElementById('ano').value,
        status: document.getElementById('status').value,
        nota: document.getElementById('nota').value,
        usuario_id: document.getElementById('usuario_id').value
    };

    console.log('Enviando dados do livro:', formData);

    fetch('/livros', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.text())
    .then(data => {
        console.log('Resposta:', data);
        alert(data);
        document.getElementById('livroForm').reset();
        // Recarregar livros
        carregarLivros(formData.usuario_id);
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro: ' + error);
    });
  });
}

// Preencher usuario_id da URL ao carregar a página de livros
if (window.location.pathname === '/livros.html') {
    const urlParams = new URLSearchParams(window.location.search);
    const usuarioId = urlParams.get('usuario_id');
    if (usuarioId) {
        document.getElementById('usuario_id').value = usuarioId;
        console.log('usuario_id preenchido:', usuarioId);
        // Carregar livros do usuário
        carregarLivros(usuarioId);
    } else {
        console.warn('Nenhum usuario_id encontrado na URL!');
    }
    
    // Mostrar o usuario_id na tela para debug
    const usuarioIdDisplay = document.getElementById('usuario_id');
    if (usuarioIdDisplay) {
        usuarioIdDisplay.parentElement.innerHTML += `<div class="alert alert-info mt-2">ID do Usuário: <strong>${usuarioIdDisplay.value || 'NÃO DEFINIDO'}</strong></div>`;
    }
}
