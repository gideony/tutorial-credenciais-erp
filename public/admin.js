let currentErps = [];

async function loadErps() {
    try {
        const response = await fetch('/api/erps');
        const erps = await response.json();
        currentErps = erps;

        const select = document.getElementById('erpSelect');
        // keep the first option and remove the rest
        select.innerHTML = '<option value="">-- Criar Novo ERP --</option>';

        erps.forEach((erp, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = erp.name;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Erro ao carregar ERPs:', err);
    }
}

document.getElementById('erpSelect').addEventListener('change', (e) => {
    const selectedIndex = e.target.value;
    const form = document.getElementById('erpForm');
    const deleteBtn = document.getElementById('deleteBtn');
    const formTitle = document.getElementById('formTitle');
    const erpNameInput = document.getElementById('erpName');

    if (selectedIndex === "") {
        // Create new mode
        form.reset();
        deleteBtn.style.display = 'none';
        formTitle.textContent = 'Cadastrar Novo ERP';
        erpNameInput.readOnly = false;
    } else {
        // Edit mode
        const erp = currentErps[selectedIndex];
        document.getElementById('erpName').value = erp.name;
        document.getElementById('erpTitle').value = erp.title;
        document.getElementById('erpMessage').value = erp.message;

        deleteBtn.style.display = 'block';
        formTitle.textContent = 'Editar ERP: ' + erp.name;
        erpNameInput.readOnly = true; // prevent changing the name which is our ID
    }
});

document.getElementById('deleteBtn').addEventListener('click', async () => {
    const selectedIndex = document.getElementById('erpSelect').value;
    if (selectedIndex === "") return;

    const erp = currentErps[selectedIndex];
    if (confirm(`Tem certeza que deseja remover o ERP: ${erp.name}?`)) {
        const statusMsg = document.getElementById('statusMessage');
        statusMsg.textContent = "Removendo...";
        statusMsg.style.color = "var(--text-gray)";

        try {
            const response = await fetch(`/api/erps/${encodeURIComponent(erp.name)}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                statusMsg.textContent = "ERP removido com sucesso!";
                statusMsg.style.color = "var(--primary-green)";
                document.getElementById('erpForm').reset();
                document.getElementById('deleteBtn').style.display = 'none';
                document.getElementById('formTitle').textContent = 'Cadastrar Novo ERP';
                document.getElementById('erpName').readOnly = false;
                await loadErps();
            } else {
                statusMsg.textContent = "Erro ao remover ERP.";
                statusMsg.style.color = "red";
            }
        } catch (err) {
            console.error(err);
            statusMsg.textContent = "Erro de conexão ao remover.";
            statusMsg.style.color = "red";
        }
    }
});

document.getElementById('erpForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const statusMsg = document.getElementById('statusMessage');

    statusMsg.textContent = "Salvando...";
    statusMsg.style.color = "var(--text-gray)";

    try {
        const response = await fetch('/api/erps', {
            method: 'POST',
            body: formData // sending as multipart/form-data
        });

        if (response.ok) {
            statusMsg.textContent = "ERP salvo com sucesso!";
            statusMsg.style.color = "var(--primary-green)";

            // If it was a new ERP, clear the form, otherwise keep it populated
            const selectedIndex = document.getElementById('erpSelect').value;
            if (selectedIndex === "") {
                e.target.reset();
            }

            await loadErps();
        } else {
            statusMsg.textContent = "Erro ao salvar ERP.";
            statusMsg.style.color = "red";
        }
    } catch (err) {
        console.error(err);
        statusMsg.textContent = "Erro de conexão ao salvar.";
        statusMsg.style.color = "red";
    }
});

// Load initial data
loadErps();