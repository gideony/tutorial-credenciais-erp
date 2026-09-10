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
            e.target.reset();
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