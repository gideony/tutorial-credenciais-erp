document.addEventListener('DOMContentLoaded', async () => {
    const erpGrid = document.getElementById('erpGrid');
    const instructionText = document.getElementById('instructionText');
    const tutorialContent = document.getElementById('tutorialContent');
    const tutorialTitle = document.getElementById('tutorialTitle');
    const tutorialContainer = document.getElementById('tutorialContainer');

    let tutorials = {};

    try {
        // Load Settings
        const settingsRes = await fetch('content/settings.json');
        if (settingsRes.ok) {
            const settings = await settingsRes.json();
            if (settings.title) document.getElementById('pageTitle').textContent = settings.title;
            if (settings.subtitle) document.getElementById('pageSubtitle').textContent = settings.subtitle;
            if (settings.footer_text) document.getElementById('footerText').textContent = settings.footer_text;
        }

        // Load Tutorials and Systems
        const tutorialsRes = await fetch('content/tutorials.json');
        if (tutorialsRes.ok) {
            const data = await tutorialsRes.json();

            // Build the tutorials mapping and buttons dynamically
            if (data.systems && Array.isArray(data.systems)) {
                data.systems.forEach(system => {
                    // Populate tutorials map
                    if (system.content || system.image) {
                        let htmlContent = system.content ? marked.parse(system.content) : '';
                        if (system.image) {
                             htmlContent += `\n<img src="${system.image}" alt="${system.name} - Passo a passo" class="tutorial-image">`;
                        }
                        tutorials[system.name] = htmlContent;
                    }

                    // Create button
                    const button = document.createElement('button');
                    button.className = 'erp-button';
                    button.textContent = system.name;
                    button.addEventListener('click', () => handleErpClick(system.name, button));
                    erpGrid.appendChild(button);
                });
            }
        }
    } catch (err) {
        console.error("Failed to load CMS content", err);
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