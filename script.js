document.addEventListener('DOMContentLoaded', () => {
    const erpSystems = [
        "SGP", "IXC", "Hubsoft", "MKAuth",
        "Gesprov", "ReceitaNet", "BeesWeb", "MKSolutions",
        "MikWeb", "Altarede", "Controllr", "RadiusNet",
        "Ispfy", "Atlaz", "TopSapp", "Quaza",
        "Vigo", "RBXSoft"
    ];

    const erpGrid = document.getElementById('erpGrid');
    const instructionText = document.getElementById('instructionText');
    const tutorialContent = document.getElementById('tutorialContent');
    const tutorialTitle = document.getElementById('tutorialTitle');
    const tutorialContainer = document.getElementById('tutorialContainer');

    const tutorials = {
        "SGP": `
            <p><strong>Passo 1:</strong> Acesse Administração > Integrações > Tokens.</p>
            <p><strong>Passo 2:</strong> Clique em "Adicionar token" no canto superior direito. Em descrição, digite "Azos". Em aplicações, clique no botão "+" e digite "Azos" nos dois campos.</p>
            <p><strong>Passo 3:</strong> Após salvar, o token será gerado. Seu App: Azos / Seu Token: a chave gerada / Sua URL: o endereço do navegador (ex.: https://seusgp.com.br).</p>
            <p><strong>Dica:</strong> crie credenciais exclusivas para a Azos. Em caso de duvidas, entre em contato com o suporte.</p>
            <img src="images/sgp-passo-a-passo.png" alt="SGP - Passo a passo" class="tutorial-image">
        `
    };

    // Generate buttons
    erpSystems.forEach(system => {
        const button = document.createElement('button');
        button.className = 'erp-button';
        button.textContent = system;
        button.addEventListener('click', () => handleErpClick(system, button));
        erpGrid.appendChild(button);
    });

    function handleErpClick(systemName, clickedButton) {
        // Remove active class from all buttons
        document.querySelectorAll('.erp-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to clicked button
        clickedButton.classList.add('active');

        // Update tutorial section
        instructionText.classList.add('hidden');
        tutorialContent.classList.remove('hidden');
        tutorialTitle.textContent = `${systemName} — Passo a passo`;

        const tutorialSteps = document.querySelector('.tutorial-steps');
        if (tutorials[systemName]) {
            tutorialSteps.innerHTML = tutorials[systemName];
        } else {
            tutorialSteps.innerHTML = `<p>Siga os passos indicados para encontrar as credenciais no seu sistema.</p>`;
        }

        // Smooth scroll to the tutorial container
        tutorialContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});