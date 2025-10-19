// Espera o documento HTML carregar completamente antes de rodar o script
document.addEventListener('DOMContentLoaded', function() {

    // --- Seletores de Elementos ---
    const seletor = document.getElementById('seletorVitima'); // Pode ser null nas novas páginas
    
    // Elementos do Timer (Comuns a todas as páginas)
    const btnStartTimer = document.getElementById('btnStartTimer');
    const btnReset = document.getElementById('btnReset');
    const timerDisplay = document.getElementById('timerDisplay');
    const inputTotalTime = document.getElementById('inputTotalTime');
    const inputDegradeTime = document.getElementById('inputDegradeTime');

    // Elementos das Notas (Só existem em comando.html e tecnicos.html)
    const noteInput = document.getElementById('noteInput');
    const addNoteButton = document.getElementById('addNoteButton');
    const notesDisplay = document.getElementById('notesDisplay');
    
    // --- Variáveis de Estado ---
    let timerInterval = null; 
    let totalTimeInSeconds = 0;
    let degradationTimeInSeconds = 0; // Tempo a ser ATINGIDO para a degradação/evento
    let currentTimeInSeconds = 0; // Começa em 0 para contagem crescente
    let degradationAlertSent = false;
    let fiveMinuteWarningMark = 0; // Tempo a ser ATINGIDO para o aviso
    const fiveMinuteMarkInSeconds = 5 * 60; // 300 segundos (para cálculo)
    let notes = []; // Array para guardar as notas { text: "...", timestamp: "MM:SS" }

    // --- LÓGICA DE MOSTRAR/ESCONDER VÍTIMA (Só roda se o seletor existir) ---
    if (seletor) {
        seletor.addEventListener('change', function() {
            const idVitimaSelecionada = seletor.value;
            const todosConteudos = document.querySelectorAll('.conteudo-vitima');
            
            todosConteudos.forEach(function(conteudo) {
                conteudo.classList.remove('active');
            });

            if (idVitimaSelecionada) {
                const vitimaParaMostrar = document.getElementById(idVitimaSelecionada);
                if (vitimaParaMostrar) {
                    vitimaParaMostrar.classList.add('active');
                }
            }
        });
    }

    // --- LÓGICA DO TIMER (CONTADOR CRESCENTE) ---

    // Função que atualiza o relógio a cada segundo
    function updateTimerDisplay() {
        currentTimeInSeconds++; // Incrementa o tempo decorrido

        // Formata os segundos para MM:SS
        let minutes = Math.floor(currentTimeInSeconds / 60);
        let seconds = currentTimeInSeconds % 60;
        minutes = minutes < 10 ? '0' + minutes : minutes; // Adiciona zero à esquerda min
        seconds = seconds < 10 ? '0' + seconds : seconds; // Adiciona zero à esquerda seg

        timerDisplay.textContent = `${minutes}:${seconds}`;

        // --- VERIFICAÇÕES DE EVENTOS ---
        
        // 1. Alerta de Degradação/Evento (Quando o tempo ATINGE o valor definido)
        if (currentTimeInSeconds === degradationTimeInSeconds && !degradationAlertSent) {
            const alertMessage = seletor ? 
                "ALERTA DE DEGRADAÇÃO! O estado da vítima mudou. Reavalie os parâmetros!" :
                "ALERTA DE EVENTO! Tempo definido atingido.";
            alert(alertMessage);
            degradationAlertSent = true;
        }

        // 2. Aviso de 5 Minutos Restantes (Quando o tempo ATINGE Total - 5 min)
        // Só faz sentido se o tempo total for maior que 5 min
        if (totalTimeInSeconds > fiveMinuteMarkInSeconds && currentTimeInSeconds === fiveMinuteWarningMark) {
            timerDisplay.classList.add('timer-warning');
            // Poderia adicionar um alerta aqui também se quisesse
            // alert("Aviso: Faltam 5 minutos para o tempo total!"); 
        }

        // 3. Fim do Tempo (Quando o tempo ATINGE o total definido)
        if (currentTimeInSeconds >= totalTimeInSeconds) { // Usa >= para garantir que pare
            clearInterval(timerInterval); 
            timerInterval = null;
            // Garante que o display mostre exatamente o tempo total
            let finalMinutes = Math.floor(totalTimeInSeconds / 60);
            let finalSeconds = totalTimeInSeconds % 60;
            finalMinutes = finalMinutes < 10 ? '0' + finalMinutes : finalMinutes;
            finalSeconds = finalSeconds < 10 ? '0' + finalSeconds : finalSeconds;
            timerDisplay.textContent = `${finalMinutes}:${finalSeconds}`;
            
            timerDisplay.classList.remove('timer-warning'); // Remove o aviso caso termine
            btnStartTimer.disabled = true; // Mantém desabilitado
            inputTotalTime.disabled = true;
            inputDegradeTime.disabled = true;
            alert("TEMPO TOTAL ESGOTADO!");
        }
    }

    // Função para INICIAR o simulado
    function startSimulator() {
        let totalMinutes = parseInt(inputTotalTime.value);
        let degradeMinutes = parseInt(inputDegradeTime.value);

        if (isNaN(totalMinutes) || isNaN(degradeMinutes) || totalMinutes <= 0 || degradeMinutes <= 0) {
            alert("Por favor, insira valores válidos para os tempos (maiores que zero)."); return;
        }
        if (degradeMinutes > totalMinutes) {
            alert("O tempo de alerta/evento não pode ser maior que o tempo total."); return;
        }

        totalTimeInSeconds = totalMinutes * 60;
        degradationTimeInSeconds = degradeMinutes * 60;
        fiveMinuteWarningMark = totalTimeInSeconds - fiveMinuteMarkInSeconds; // Calcula o marco para o aviso
        currentTimeInSeconds = 0; // Começa em zero
        degradationAlertSent = false; 

        timerDisplay.classList.remove('timer-warning');
        timerDisplay.textContent = "00:00"; // Display inicial

        btnStartTimer.disabled = true;
        inputTotalTime.disabled = true;
        inputDegradeTime.disabled = true;

        if (timerInterval) clearInterval(timerInterval);
        // Roda a função uma vez imediatamente para mostrar 00:01 logo ao clicar
        updateTimerDisplay(); 
        timerInterval = setInterval(updateTimerDisplay, 1000); 
    }

    // --- LÓGICA DO RESET (Comum, agora inclui resetar notas) ---
    function resetSimulator() {
        // Limpa checkboxes
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach(cb => cb.checked = false);

        // Para timer
        clearInterval(timerInterval);
        timerInterval = null;

        // Reseta tempos
        currentTimeInSeconds = 0;
        totalTimeInSeconds = 0;
        degradationTimeInSeconds = 0;
        fiveMinuteWarningMark = 0;
        degradationAlertSent = false;

        // Reseta display e botões
        timerDisplay.textContent = "--:--";
        timerDisplay.classList.remove('timer-warning');
        btnStartTimer.disabled = false;
        inputTotalTime.disabled = false;
        inputDegradeTime.disabled = false;
        inputTotalTime.value = "30";
        inputDegradeTime.value = "10";

        // Limpa notas
        notes = [];
        renderNotes(); 
        if (noteInput) noteInput.value = ""; 
    }

    // --- LÓGICA DAS NOTAS (Só roda se os elementos existirem) ---
    function renderNotes() {
        if (!notesDisplay) return; 

        notesDisplay.innerHTML = ""; 

        if (notes.length === 0) {
            notesDisplay.innerHTML = "<p>Nenhuma nota adicionada ainda.</p>";
            return;
        }

        for (let i = notes.length - 1; i >= 0; i--) {
            const note = notes[i];
            const noteElement = document.createElement('div');
            noteElement.classList.add('note-entry');
            const sanitizedText = document.createTextNode(note.text).textContent;
            noteElement.innerHTML = `<strong>[${note.timestamp}]</strong> ${sanitizedText}`;
            notesDisplay.appendChild(noteElement);
        }
    }

    function addNote() {
        if (!noteInput || !timerDisplay) return; 

        const text = noteInput.value.trim();
        const timestamp = timerDisplay.textContent; // Pega o tempo ATUAL (crescente) do display

        // Não adiciona nota se o texto estiver vazio ou o timer não iniciado
        if (text === "" || timestamp === "--:--") {
            alert("Por favor, digite uma nota e inicie o simulador para registrar o tempo.");
            return;
        }

        notes.push({ text: text, timestamp: timestamp });
        noteInput.value = ""; 
        renderNotes(); 
    }

    if (addNoteButton) {
        addNoteButton.addEventListener('click', addNote);
    }

    // --- Adiciona os 'ouvintes' aos botões de controle do timer ---
    btnStartTimer.addEventListener('click', startSimulator);
    btnReset.addEventListener('click', resetSimulator);

    // Inicializa a exibição das notas
    renderNotes(); 

}); // Fim do 'DOMContentLoaded'