document.addEventListener('DOMContentLoaded', async () => {
    const erpGrid = document.getElementById('erpGrid');
    const instructionText = document.getElementById('instructionText');
    const tutorialContent = document.getElementById('tutorialContent');
    const tutorialTitle = document.getElementById('tutorialTitle');
    const tutorialContainer = document.getElementById('tutorialContainer');

    let tutorials = {};

    try {
        const response = await fetch('/api/erps');
        if (response.ok) {
            const erpSystems = await response.json();

            // Generate buttons and tutorial mapping
            erpSystems.forEach(system => {
                if (system.message || system.image) {
                    let htmlContent = system.message ? system.message : '';
                    if (system.image) {
                         htmlContent += `\n<img src="${system.image}" alt="${system.name} - Passo a passo" class="tutorial-image">`;
                    }
                    tutorials[system.name] = { title: system.title, html: htmlContent };
                }

                const button = document.createElement('button');
                button.className = 'erp-button';
                button.textContent = system.name;
                button.addEventListener('click', () => handleErpClick(system.name, button));
                erpGrid.appendChild(button);
            });
        }
    } catch(e) {
        console.error("Failed to fetch ERPs", e);
    }

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

        const tutorialSteps = document.querySelector('.tutorial-steps');
        if (tutorials[systemName]) {
            tutorialTitle.textContent = tutorials[systemName].title || `${systemName} — Passo a passo`;
            tutorialSteps.innerHTML = tutorials[systemName].html;
        } else {
            tutorialTitle.textContent = `${systemName} — Passo a passo`;
            tutorialSteps.innerHTML = `<p>Siga os passos indicados para encontrar as credenciais no seu sistema.</p>`;
        }

        // Smooth scroll to the tutorial container
        tutorialContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});