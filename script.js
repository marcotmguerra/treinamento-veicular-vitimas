// Espera o documento HTML carregar completamente antes de rodar o script
document.addEventListener('DOMContentLoaded', function() {

    // --- Seletores de Elementos ---
    const seletor = document.getElementById('seletorVitima');
    
    // Elementos do Timer
    const btnStartTimer = document.getElementById('btnStartTimer');
    const btnReset = document.getElementById('btnReset');
    const timerDisplay = document.getElementById('timerDisplay');
    const inputTotalTime = document.getElementById('inputTotalTime');
    const inputDegradeTime = document.getElementById('inputDegradeTime');
    
    // --- Variáveis de Estado do Timer ---
    let timerInterval = null; // Guarda o 'setInterval' para podermos pará-lo
    let totalTimeInSeconds = 0;
    let degradationTimeInSeconds = 0; // Tempo DECORRIDO para a degradação
    let currentTimeInSeconds = 0;
    let degradationAlertSent = false;
    const fiveMinuteMarkInSeconds = 5 * 60; // 300 segundos

    // --- LÓGICA DE MOSTRAR/ESCONDER VÍTIMA (Seu código original) ---
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

    // --- NOVA LÓGICA DO TIMER ---

    // Função que atualiza o relógio a cada segundo
    function updateTimerDisplay() {
        currentTimeInSeconds--; // Decrementa o tempo restante

        // Formata os segundos para MM:SS
        let minutes = Math.floor(currentTimeInSeconds / 60);
        let seconds = currentTimeInSeconds % 60;
        seconds = seconds < 10 ? '0' + seconds : seconds; // Adiciona o zero à esquerda

        timerDisplay.textContent = `${minutes}:${seconds}`;

        // --- VERIFICAÇÕES DE EVENTOS ---

        // 1. Alerta de Degradação (Verifica tempo DECORRIDO)
        const elapsedTimeInSeconds = totalTimeInSeconds - currentTimeInSeconds;
        
        // Compara o tempo decorrido com o tempo de degradação
        if (elapsedTimeInSeconds === degradationTimeInSeconds && !degradationAlertSent) {
            
            // REVELA A COLUNA "AVALIAÇÃO TARDIA"
            document.body.classList.add('show-tardia');
            
            // ENVIA O ALERTA
            alert("ALERTA DE DEGRADAÇÃO! O estado da vítima mudou. Reavalie os parâmetros!");
            
            degradationAlertSent = true; // Garante que o alerta só dispare uma vez
        }

        // 2. Aviso de 5 Minutos Restantes (Verifica tempo RESTANTE)
        if (currentTimeInSeconds === fiveMinuteMarkInSeconds) {
            timerDisplay.classList.add('timer-warning');
        }

        // 3. Fim do Tempo
        if (currentTimeInSeconds <= 0) {
            clearInterval(timerInterval); 
            timerInterval = null;
            timerDisplay.textContent = "00:00";
            // Desativa os botões e inputs caso o tempo acabe
            btnStartTimer.disabled = true;
            inputTotalTime.disabled = true;
            inputDegradeTime.disabled = true;
            alert("TEMPO TOTAL ESGOTADO!");
        }
    }

    // Função para INICIAR o simulado
    function startSimulator() {
        // 1. Pega os valores dos inputs (em minutos)
        let totalMinutes = parseInt(inputTotalTime.value);
        let degradeMinutes = parseInt(inputDegradeTime.value);

        // 2. Validação
        if (isNaN(totalMinutes) || isNaN(degradeMinutes) || totalMinutes <= 0 || degradeMinutes <= 0) {
            alert("Por favor, insira valores válidos para os tempos (maiores que zero).");
            return;
        }
        if (degradeMinutes > totalMinutes) {
            alert("O tempo de degradação não pode ser maior que o tempo total.");
            return;
        }

        // 3. Converte para segundos e define as variáveis
        totalTimeInSeconds = totalMinutes * 60;
        degradationTimeInSeconds = degradeMinutes * 60;
        currentTimeInSeconds = totalTimeInSeconds;
        degradationAlertSent = false; // Reseta o alerta

        // 4. Reseta o visual
        timerDisplay.classList.remove('timer-warning');
        // Formata o display inicial corretamente
        let startMinutes = Math.floor(currentTimeInSeconds / 60);
        let startSeconds = currentTimeInSeconds % 60;
        timerDisplay.textContent = `${startMinutes < 10 ? '0' + startMinutes : startMinutes}:${startSeconds < 10 ? '0' + startSeconds : startSeconds}`;


        // 5. Desativa os inputs e o botão de iniciar
        btnStartTimer.disabled = true;
        inputTotalTime.disabled = true;
        inputDegradeTime.disabled = true;

        // 6. Inicia o relógio (o loop principal)
        if (timerInterval) clearInterval(timerInterval); // Limpa timer antigo se houver
        timerInterval = setInterval(updateTimerDisplay, 1000); // Roda a cada 1 segundo
    }

    // --- LÓGICA DO RESET ---
    function resetSimulator() {
        // 1. Limpa todos os checkboxes
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach(cb => cb.checked = false);

        // 2. Para qualquer timer que esteja a correr
        clearInterval(timerInterval);
        timerInterval = null;

        // 3. Reseta as variáveis de tempo
        currentTimeInSeconds = 0;
        totalTimeInSeconds = 0;
        degradationTimeInSeconds = 0;
        degradationAlertSent = false;

        // 4. Reseta o visual do relógio e botões
        timerDisplay.textContent = "--:--";
        timerDisplay.classList.remove('timer-warning');
        btnStartTimer.disabled = false;
        inputTotalTime.disabled = false;
        inputDegradeTime.disabled = false;

        // 5. ESCONDE A COLUNA "AVALIAÇÃO TARDIA"
        document.body.classList.remove('show-tardia');
        
        // 6. Reseta os valores dos inputs para os padrões
        inputTotalTime.value = "30";
        inputDegradeTime.value = "10";
    }

    // --- Adiciona os 'ouvintes' aos botões ---
    btnStartTimer.addEventListener('click', startSimulator);
    btnReset.addEventListener('click', resetSimulator);

}); // Fim do 'DOMContentLoaded'
