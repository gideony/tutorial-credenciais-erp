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

        // Smooth scroll to the tutorial container
        tutorialContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});
