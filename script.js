// Espera o documento HTML carregar completamente antes de rodar o script
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Carregado. Iniciando script..."); // Debug: Confirma que o script começa

    // --- Seletores de Elementos ---
    const seletor = document.getElementById('seletorVitima');
    console.log("Seletor de Vítima:", seletor ? "Encontrado" : "NÃO ENCONTRADO"); // Debug

    const btnStartTimer = document.getElementById('btnStartTimer');
    console.log("Botão Start Timer:", btnStartTimer ? "Encontrado" : "NÃO ENCONTRADO"); // Debug

    const btnReset = document.getElementById('btnReset');
    console.log("Botão Reset:", btnReset ? "Encontrado" : "NÃO ENCONTRADO"); // Debug

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
            console.log("Seleção de vítima mudou para:", this.value); // Debug
            const idVitimaSelecionada = this.value; 
            const todosConteudos = document.querySelectorAll('.conteudo-vitima');
            
            todosConteudos.forEach(conteudo => {
                conteudo.classList.remove('active');
            });

            if (idVitimaSelecionada) {
                const vitimaParaMostrar = document.getElementById(idVitimaSelecionada);
                if (vitimaParaMostrar) {
                    console.log("Mostrando vítima:", idVitimaSelecionada); // Debug
                    vitimaParaMostrar.classList.add('active');
                    resetToPrimaryTab(vitimaParaMostrar); 
                    closeAllDetails(vitimaParaMostrar); 
                } else {
                    console.error("Erro: Elemento da vítima não encontrado para ID:", idVitimaSelecionada); // Debug Error
                }
            }
        });
        console.log("Listener do seletor de vítima ADICIONADO."); // Debug
    } else {
         console.log("Seletor de vítima NÃO encontrado nesta página."); // Debug Info
    }

    // --- LÓGICA DAS ABAS DE AVALIAÇÃO ---
    const allTabButtons = document.querySelectorAll('.tab-button');
    console.log(`Encontrados ${allTabButtons.length} botões de aba.`); // Debug

    allTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log("Botão de aba clicado:", this.textContent); // Debug
            const currentVictimContainer = this.closest('.conteudo-vitima');
            if (!currentVictimContainer) {
                console.error("Erro: Container da vítima não encontrado para a aba."); // Debug Error
                return;
            }

            const currentTabs = currentVictimContainer.querySelectorAll('.tab-button');
            const currentContents = currentVictimContainer.querySelectorAll('.tab-content');
            const targetContentClass = this.getAttribute('data-target');
            console.log("Alvo da aba:", targetContentClass); // Debug

            currentTabs.forEach(tab => tab.classList.remove('active'));
            currentContents.forEach(content => content.classList.remove('active'));

            this.classList.add('active');
            const targetContent = currentVictimContainer.querySelector(`.tab-content.${targetContentClass}`);
            if (targetContent) {
                console.log("Mostrando conteúdo da aba:", targetContentClass); // Debug
                targetContent.classList.add('active');
            } else {
                 console.error("Erro: Conteúdo da aba não encontrado para:", targetContentClass); // Debug Error
            }
            closeAllDetails(currentVictimContainer); 
        });
    });
     console.log("Listeners dos botões de aba ADICIONADOS."); // Debug

    // Função auxiliar para resetar para a aba primária
    function resetToPrimaryTab(victimContainer) {
         if (!victimContainer) return;
         console.log("Resetando para aba primária em:", victimContainer.id); // Debug
         const tabs = victimContainer.querySelectorAll('.tab-button');
         const contents = victimContainer.querySelectorAll('.tab-content');
         
         tabs.forEach(tab => tab.classList.remove('active'));
         contents.forEach(content => content.classList.remove('active'));

         const primaryTabButton = victimContainer.querySelector('.tab-button[data-target="primary-assessment"]');
         const primaryTabContent = victimContainer.querySelector('.tab-content.primary-assessment');
         
         if (primaryTabButton) primaryTabButton.classList.add('active');
         if (primaryTabContent) primaryTabContent.classList.add('active');
    }

    // --- LÓGICA PARA FECHAR <DETAILS> ---
    function closeAllDetails(container) {
        if (!container) return;
        const detailsElements = container.querySelectorAll('.assessment-detail');
        detailsElements.forEach(detail => {
            detail.removeAttribute('open');
        });
    }

    const allDetails = document.querySelectorAll('.assessment-detail');
    console.log(`Encontrados ${allDetails.length} elementos <details>.`); // Debug
    allDetails.forEach(detail => {
        detail.addEventListener('toggle', function(event) {
            if (this.open) {
                const parentTabContent = this.closest('.tab-content');
                if (!parentTabContent) return;

                const otherOpenDetails = parentTabContent.querySelectorAll('details[open]');
                otherOpenDetails.forEach(otherDetail => {
                    if (otherDetail !== this) { 
                        otherDetail.removeAttribute('open');
                    }
                });
            }
        });
    });
    console.log("Listeners dos <details> ADICIONADOS."); // Debug

    // --- LÓGICA DO TIMER (CONTADOR CRESCENTE) ---
    function updateTimerDisplay() {
        if (!timerInterval) return; 

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
             console.log("Tempo Total Esgotado."); // Debug
             alert("TEMPO TOTAL ESGOTADO!");
             return; 
        }

        currentTimeInSeconds++; 

        let minutes = Math.floor(currentTimeInSeconds / 60);
        let seconds = currentTimeInSeconds % 60;
        minutes = minutes < 10 ? '0' + minutes : minutes; 
        seconds = seconds < 10 ? '0' + seconds : seconds; 

        timerDisplay.textContent = `${minutes}:${seconds}`;

        // Alerta de Degradação/Evento
        if (currentTimeInSeconds === degradationTimeInSeconds && !degradationAlertSent) {
            console.log("Alerta de Degradação/Evento disparado."); // Debug
            const alertMessage = seletor ? 
                "ALERTA DE DEGRADAÇÃO! O estado da vítima mudou. Reavalie os parâmetros!" :
                "ALERTA DE EVENTO! Tempo definido atingido.";
            alert(alertMessage);
            degradationAlertSent = true;
        }

        // Aviso de 5 Minutos Restantes
        if (fiveMinuteWarningMark > 0 && currentTimeInSeconds === fiveMinuteWarningMark) { 
            console.log("Aviso de 5 minutos restantes ativado."); // Debug
            timerDisplay.classList.add('timer-warning');
        }
    }

    function startSimulator() {
        console.log("Iniciando Simulado..."); // Debug
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
        fiveMinuteWarningMark = (totalTimeInSeconds > fiveMinuteMarkInSeconds) ? totalTimeInSeconds - fiveMinuteMarkInSeconds : -1; 
        currentTimeInSeconds = 0; 
        degradationAlertSent = false; 

        timerDisplay.classList.remove('timer-warning');
        timerDisplay.textContent = "00:00"; 

        btnStartTimer.disabled = true;
        inputTotalTime.disabled = true;
        inputDegradeTime.disabled = true;

        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(updateTimerDisplay, 1000); 
        console.log("Timer iniciado. Total:", totalTimeInSeconds, "Degradação:", degradationTimeInSeconds); // Debug
    }

    // --- LÓGICA DO RESET ---
    function resetSimulator() {
        console.log("Resetando Simulador..."); // Debug
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

        const allVictimContainers = document.querySelectorAll('.conteudo-vitima');
        allVictimContainers.forEach(container => {
             resetToPrimaryTab(container);
             closeAllDetails(container); 
        });
        console.log("Reset Completo."); // Debug
    }

    // --- LÓGICA DAS NOTAS ---
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
        const timestamp = timerDisplay.textContent; 
        if (text === "" || timestamp === "--:--") {
            alert("Por favor, digite uma nota e inicie o simulador para registrar o tempo.");
            return;
        }
        console.log("Adicionando nota:", text, "Timestamp:", timestamp); // Debug
        notes.push({ text: text, timestamp: timestamp });
        noteInput.value = ""; 
        renderNotes(); 
    }
    if (addNoteButton) { 
        addNoteButton.addEventListener('click', addNote); 
        console.log("Listener do botão de nota ADICIONADO."); // Debug
    } else {
        console.log("Botão de nota NÃO encontrado nesta página."); // Debug Info
    }

    // --- Adiciona os 'ouvintes' aos botões de controle do timer ---
    if(btnStartTimer) {
        btnStartTimer.addEventListener('click', startSimulator);
        console.log("Listener do botão Start ADICIONADO."); // Debug
    } else {
         console.error("ERRO CRÍTICO: Botão Start Timer (btnStartTimer) NÃO ENCONTRADO!"); // Debug Error
    }
    
    if(btnReset) {
        btnReset.addEventListener('click', resetSimulator);
        console.log("Listener do botão Reset ADICIONADO."); // Debug
    } else {
        console.error("ERRO CRÍTICO: Botão Reset (btnReset) NÃO ENCONTRADO!"); // Debug Error
    }

    // Inicializa a exibição das notas e fecha details
    try {
        renderNotes(); 
        const allVictimContainersOnInit = document.querySelectorAll('.conteudo-vitima');
        allVictimContainersOnInit.forEach(container => closeAllDetails(container));
        console.log("Inicialização finalizada."); // Debug
    } catch (e) {
        console.error("Erro durante a inicialização final:", e); // Debug Error
    }

}); // Fim do 'DOMContentLoaded'
