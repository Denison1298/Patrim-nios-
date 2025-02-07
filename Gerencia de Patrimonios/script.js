let patrimonios = JSON.parse(localStorage.getItem("patrimonios")) || [];

function salvarDados() {
    localStorage.setItem("patrimonios", JSON.stringify(patrimonios));
}

function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(tabName).classList.remove('hidden');
    if (tabName === 'dashboard') {
        atualizarDashboard();
    } else if (tabName === 'patrimonios') {
        atualizarTabela();
    }
}

function adicionarPatrimonio(tipo) {
    const inputId = tipo === 'Roteador' ? 'patrimonioRoteador' : 'patrimonioOnu';
    const valor = document.getElementById(inputId).value.trim();

    if (!valor) {
        mostrarToast('error', 'Informe um código válido!');
        return;
    }

    if (patrimonios.some(p => p.valor === valor)) {
        mostrarToast('error', `O patrimônio "${valor}" já foi adicionado!`);
        return;
    }

    patrimonios.push({ tipo, valor, dataHora: new Date().toLocaleString("pt-BR") });
    salvarDados();
    atualizarTabela();
    document.getElementById(inputId).value = '';
    mostrarToast('success', `Patrimônio "${valor}" adicionado com sucesso!`);
}

function atualizarTabela() {
    const tbody = document.getElementById("listaPatrimonios");
    tbody.innerHTML = patrimonios.map((pat, index) => `
        <tr>
            <td>${pat.tipo}</td>
            <td>${pat.valor}</td>
            <td>${pat.dataHora}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="confirmarRemocao(${index})">Remover</button>
            </td>
        </tr>
    `).join('');
}

function confirmarRemocao(index) {
    if (confirm("Tem certeza que deseja remover este patrimônio?")) {
        patrimonios.splice(index, 1);
        salvarDados();
        atualizarTabela();
        mostrarToast('success', 'Patrimônio removido com sucesso!');
    }
}

function limparPatrimonios() {
    if (confirm("Tem certeza que deseja limpar todos os patrimônios?")) {
        patrimonios = [];
        salvarDados();
        atualizarTabela();
        mostrarToast('success', 'Todos os patrimônios foram limpos com sucesso!');
    }
}

function ocultarPatrimonios() {
    const tbody = document.getElementById("listaPatrimonios");
    tbody.classList.toggle("hidden");
    const ocultarBtn = document.querySelector("button[onclick='ocultarPatrimonios()']");
    ocultarBtn.textContent = tbody.classList.contains("hidden") ? "Mostrar Patrimônios" : "Ocultar Patrimônios Anteriores";
}

function atualizarDashboard() {
    const totalRoteador = patrimonios.filter(p => p.tipo === 'Roteador').length;
    const totalOnu = patrimonios.filter(p => p.tipo === 'Onu').length;

    document.getElementById("totalRoteador").textContent = totalRoteador;
    document.getElementById("totalOnu").textContent = totalOnu;
    document.getElementById("totalGeral").textContent = patrimonios.length;

    const groupedByDate = patrimonios.reduce((acc, pat) => {
        const date = new Date(pat.dataHora).toLocaleDateString('pt-BR');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const dates = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b));
    const counts = dates.map(date => groupedByDate[date]);

    const graficoPatrimonios = document.getElementById('graficoPatrimonios');
    graficoPatrimonios.innerHTML = '';

    const maxCount = Math.max(...counts, 5);
    const widthPerBar = 50;
    const margin = 10;

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'flex-end';
    container.style.justifyContent = 'center';
    container.style.height = '250px';
    container.style.borderBottom = '2px solid #000';

    dates.forEach((date, index) => {
        const barHeight = (counts[index] / maxCount) * 200;
        const barContainer = document.createElement('div');
        barContainer.style.width = `${widthPerBar}px`;
        barContainer.style.margin = `0 ${margin}px`;
        barContainer.style.textAlign = 'center';

        const bar = document.createElement('div');
        bar.style.height = `${barHeight}px`;
        bar.style.backgroundColor = '#007bff';
        bar.style.width = '100%';

        const label = document.createElement('div');
        label.style.marginTop = '-20px';
        label.textContent = counts[index];

        const dateLabel = document.createElement('div');
        dateLabel.style.marginTop = '5px';
        dateLabel.textContent = date;

        barContainer.appendChild(label);
        barContainer.appendChild(bar);
        barContainer.appendChild(dateLabel);
        container.appendChild(barContainer);
    });

    graficoPatrimonios.appendChild(container);

    const mediaDiaria = (patrimonios.length / dates.length).toFixed(2);
    document.getElementById("mediaDiaria").textContent = mediaDiaria || '0';
}

function mostrarToast(type, message) {
    const toastId = `toast-${Date.now()}`;
    const toastColor = type === 'success' ? 'bg-success' : 'bg-danger';
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white ${toastColor} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    const container = document.getElementById('toast-container');
    container.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const ocultarPatrimonios = () => {
        const tabela = document.getElementById("listaPatrimonios");
        const btn = document.getElementById("btnOcultarPatrimonios");
        
        // Alterna a visibilidade da tabela
        tabela.classList.toggle("hidden");
        
        // Atualiza o texto do botão com base no estado atual
        btn.textContent = tabela.classList.contains("hidden")
            ? "Mostrar Patrimônios Anteriores"
            : "Ocultar Patrimônios Anteriores";
    };

    // Adiciona o evento ao botão
    document.getElementById("btnOcultarPatrimonios").addEventListener("click", ocultarPatrimonios);
});

document.addEventListener("DOMContentLoaded", () => {
    const limparPatrimonios = () => {
        // Exibe uma confirmação ao usuário
        if (confirm("Tem certeza que deseja limpar todos os patrimônios?")) {
            // Remove todos os patrimônios
            patrimonios = [];
            salvarDados();
            atualizarTabela();

            // Mostra mensagem de sucesso
            exibirToast("Todos os patrimônios foram limpos com sucesso!", "success");
        }
    };

    // Adiciona o evento ao botão "Limpar Patrimônios"
    document.getElementById("btnLimparPatrimonios").addEventListener("click", limparPatrimonios);
});

const exibirToast = (mensagem, tipo) => {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${tipo} border-0 show`;
    toast.role = "alert";
    toast.ariaLive = "assertive";
    toast.ariaAtomic = "true";

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${mensagem}</div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastContainer.appendChild(toast);

    // Remove o toast após 3 segundos
    setTimeout(() => {
        toast.remove();
    }, 3000);
};
