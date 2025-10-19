// Espera o documento HTML carregar completamente antes de rodar o script
document.addEventListener('DOMContentLoaded', function() {

    // Pega o elemento <select> (o menu dropdown)
    const seletor = document.getElementById('seletorVitima');

    // Adiciona um "ouvinte" que dispara uma função toda vez que você *mudar* a opção do select
    seletor.addEventListener('change', function() {
        
        // 1. Pega o valor da opção selecionada (ex: "vitima1" ou "vitima2")
        const idVitimaSelecionada = seletor.value;

        // 2. Esconde TODAS as vítimas primeiro
        // Pega todos os elementos que têm a classe "conteudo-vitima"
        const todosConteudos = document.querySelectorAll('.conteudo-vitima');
        todosConteudos.forEach(function(conteudo) {
            conteudo.classList.remove('active'); // Remove a classe 'active'
        });

        // 3. Mostra APENAS a vítima selecionada
        if (idVitimaSelecionada) {
            // Pega o elemento DIV específico pelo ID (ex: #vitima1)
            const vitimaParaMostrar = document.getElementById(idVitimaSelecionada);
            if (vitimaParaMostrar) {
                vitimaParaMostrar.classList.add('active'); // Adiciona a classe 'active' para mostrá-lo
            }
        }
    });

});