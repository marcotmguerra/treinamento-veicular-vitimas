// Espera o documento HTML carregar completamente antes de rodar o script
document.addEventListener('DOMContentLoaded', function() {

    // --- Seletores de Elementos ---
    const seletor = document.getElementById('seletorVitima');
    const btnStartTimer = document.getElementById('btnStartTimer');
    const btnReset = document.getElementById('btnReset');
    const timerDisplay = document.getElementById('timerDisplay');
    const inputTotalTime = document.getElementById('inputTotalTime');
    const inputDegradeTime = document.getElementById('inputDegradeTime');
    const noteInput = document.getElementById('noteInput');
    const addNoteButton = document.getElementById('addNoteButton');
    const notesDisplay = document.getElementById('notesDisplay');
    
    // --- Variáveis de Estado ---
    let timerInterval = null; 
    let totalTimeInSeconds = 0;
    let degradationTimeInSeconds = 0;
    let currentTimeInSeconds = 0;
    let degradationAlertSent = false;
    let fiveMinuteWarningMark = 0;
    const fiveMinuteMarkInSeconds = 5 * 60;
    let notes = [];

    // --- LÓGICA DE MOSTRAR/ESCONDER VÍTIMA ---
    if (seletor) {
        seletor.addEventListener('change', function() {
            const idVitimaSelecionada = seletor.value;
            const todosConteudos = document.querySelectorAll('.conteudo-vitima');
            todosConteudos.forEach(conteudo => conteudo.classList.remove('active'));
            if (idVitimaSelecionada) {
                const vitimaParaMostrar = document.getElementById(idVitimaSelecionada);
                if (vitimaParaMostrar) {
                    vitimaParaMostrar.classList.add('active');
                    // Ao selecionar nova vítima, reseta para a aba primária
                    resetToPrimaryTab(vitimaParaMostrar); 
                }
            }
        });
    }

    // --- NOVA LÓGICA DAS ABAS DE AVALIAÇÃO ---
    const allTabButtons = document.querySelectorAll('.tab-button');

    allTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Encontra o container pai da vítima atual
            const currentVictimContainer = this.closest('.conteudo-vitima');
            if (!currentVictimContainer) return;

            // Encontra os botões e conteúdos DENTRO do container da vítima atual
            const currentTabs = currentVictimContainer.querySelectorAll('.tab-button');
            const currentContents = currentVictimContainer.querySelectorAll('.tab-content');
            
            // Pega o alvo (ex: 'primary-assessment' ou 'secondary-assessment') do botão clicado
            const targetContentClass = this.getAttribute('data-target');

            // Remove 'active' de todos os botões e conteúdos desta vítima
            currentTabs.forEach(tab => tab.classList.remove('active'));
            currentContents.forEach(content => content.classList.remove('active'));

            // Adiciona 'active' ao botão clicado
            this.classList.add('active');

            // Adiciona 'active' ao conteúdo correspondente
            const targetContent = currentVictimContainer.querySelector(`.tab-content.${targetContentClass}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // Função auxiliar para resetar para a aba primária ao mudar de vítima
    function resetToPrimaryTab(victimContainer) {
         const tabs = victimContainer.querySelectorAll('.tab-button');
         const contents = victimContainer.querySelectorAll('.tab-content');
         
         tabs.forEach(tab => tab.classList.remove('active'));
         contents.forEach(content => content.classList.remove('active'));

         // Ativa o primeiro botão (Primária) e seu conteúdo
         const primaryTabButton = victimContainer.querySelector('.tab-button[data-target="primary-assessment"]');
         const primaryTabContent = victimContainer.querySelector('.tab-content.primary-assessment');
         
         if (primaryTabButton) primaryTabButton.classList.add('active');
         if (primaryTabContent) primaryTabContent.classList.add('active');
    }
    // --- FIM LÓGICA DAS ABAS ---


    // --- LÓGICA DO TIMER (CONTADOR CRESCENTE) ---
    function updateTimerDisplay() {
        // (Lógica do timer crescente - idêntica à versão anterior)
        if (currentTimeInSeconds >= totalTimeInSeconds) return; // Para se já atingiu o total

        currentTimeInSeconds++; 

        let minutes = Math.floor(currentTimeInSeconds / 60);
        let seconds = currentTimeInSeconds % 60;
        minutes = minutes < 10 ? '0' + minutes : minutes; 
        seconds = seconds < 10 ? '0' + seconds : seconds; 

        timerDisplay.textContent = `${minutes}:${seconds}`;

        // Alerta de Degradação/Evento
        if (currentTimeInSeconds === degradationTimeInSeconds && !degradationAlertSent) {
            const alertMessage = seletor ? 
                "ALERTA DE DEGRADAÇÃO! O estado da vítima mudou. Reavalie os parâmetros!" :
                "ALERTA DE EVENTO! Tempo definido atingido.";
            alert(alertMessage);
            degradationAlertSent = true;
        }

        // Aviso de 5 Minutos Restantes
        if (totalTimeInSeconds > fiveMinuteMarkInSeconds && currentTimeInSeconds === fiveMinuteWarningMark) {
            timerDisplay.classList.add('timer-warning');
        }

        // Fim do Tempo
        if (currentTimeInSeconds >= totalTimeInSeconds) { 
            clearInterval(timerInterval); 
            timerInterval = null;
            let finalMinutes = Math.floor(totalTimeInSeconds / 60);
            let finalSeconds = totalTimeInSeconds % 60;
            finalMinutes = finalMinutes < 10 ? '0' + finalMinutes : finalMinutes;
            finalSeconds = finalSeconds < 10 ? '0' + finalSeconds : finalSeconds;
            timerDisplay.textContent = `${finalMinutes}:${finalSeconds}`;
            
            timerDisplay.classList.remove('timer-warning'); 
            btnStartTimer.disabled = true; 
            inputTotalTime.disabled = true;
            inputDegradeTime.disabled = true;
            alert("TEMPO TOTAL ESGOTADO!");
        }
    }

    function startSimulator() {
        // (Lógica de startSimulator - idêntica à versão anterior)
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
        fiveMinuteWarningMark = totalTimeInSeconds - fiveMinuteMarkInSeconds; 
        currentTimeInSeconds = 0; 
        degradationAlertSent = false; 

        timerDisplay.classList.remove('timer-warning');
        timerDisplay.textContent = "00:00"; 

        btnStartTimer.disabled = true;
        inputTotalTime.disabled = true;
        inputDegradeTime.disabled = true;

        if (timerInterval) clearInterval(timerInterval);
        // Roda a função uma vez imediatamente para mostrar 00:01 logo ao clicar
        // Correção: Não chamar update logo de cara para começar em 00:00
        // updateTimerDisplay(); 
        timerInterval = setInterval(updateTimerDisplay, 1000); 
    }

    // --- LÓGICA DO RESET ---
    function resetSimulator() {
        // (Lógica de resetSimulator - idêntica à versão anterior)
         const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach(cb => cb.checked = false);

        clearInterval(timerInterval);
        timerInterval = null;

        currentTimeInSeconds = 0;
        totalTimeInSeconds = 0;
        degradationTimeInSeconds = 0;
        fiveMinuteWarningMark = 0;
        degradationAlertSent = false;

        timerDisplay.textContent = "--:--";
        timerDisplay.classList.remove('timer-warning');
        btnStartTimer.disabled = false;
        inputTotalTime.disabled = false;
        inputDegradeTime.disabled = false;
        inputTotalTime.value = "30";
        inputDegradeTime.value = "10";

        notes = [];
        renderNotes(); 
        if (noteInput) noteInput.value = ""; 

        // Reseta todas as vítimas visíveis para a aba primária
        const allVictimContainers = document.querySelectorAll('.conteudo-vitima');
        allVictimContainers.forEach(container => resetToPrimaryTab(container));
    }

    // --- LÓGICA DAS NOTAS ---
    function renderNotes() {
        // (Lógica de renderNotes - idêntica à versão anterior)
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
        // (Lógica de addNote - idêntica à versão anterior)
        if (!noteInput || !timerDisplay) return; 
        const text = noteInput.value.trim();
        const timestamp = timerDisplay.textContent; 
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
