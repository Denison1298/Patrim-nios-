// 🔹 Conectar ao Firebase Database já configurado acima.
const database = firebase.database();

// 🔹 Alternar entre abas
function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.add('hidden'));

    const tabElement = document.getElementById(tabName);
    if (tabElement) {
        tabElement.classList.remove('hidden');
    }

    if (tabName === 'dashboard') atualizarDashboard();
    if (tabName === 'patrimonios') atualizarTabela();
}

// 🔹 Adicionar patrimônio
function adicionarPatrimonio(tipo) {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (!usuarioLogado) {
        mostrarToast('error', 'Você precisa estar logado.');
        return;
    }

    const inputId = tipo === 'Roteador' ? 'patrimonioRoteador' : 'patrimonioOnu';
    const tecnicoId = tipo === 'Roteador' ? 'tecnicoRoteador' : 'tecnicoOnu';
    const motivoId = tipo === 'Roteador' ? 'motivoRoteador' : 'motivoOnu';

    const valor = document.getElementById(inputId)?.value.trim();
    const tecnico = document.getElementById(tecnicoId)?.value.trim();
    const motivo = document.getElementById(motivoId)?.value.trim();

    if (!valor || !tecnico || !motivo) {
        mostrarToast('error', 'Preencha todos os campos!');
        return;
    }

    const novoPatrimonio = {
        tipo,
        valor,
        tecnico,
        motivo,
        dataHora: new Date().toLocaleString("pt-BR"),
        adicionadoPor: usuarioLogado
    };

    // 🔹 Salvar no Firebase
    database.ref("patrimonios").push(novoPatrimonio)
        .then(() => {
            mostrarToast('success', `Patrimônio "${valor}" adicionado com sucesso!`);
        })
        .catch(error => {
            console.error("Erro ao adicionar patrimônio:", error);
            mostrarToast('error', "Erro ao adicionar patrimônio.");
        });

    // Limpar campos
    document.getElementById(inputId).value = '';
    document.getElementById(tecnicoId).value = '';
    document.getElementById(motivoId).value = '';
}

// 🔹 Atualizar a tabela de patrimônios
function atualizarTabela() {
    const tbody = document.getElementById("listaPatrimonios");
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Carregando...</td></tr>';

    database.ref("patrimonios").off(); // Remove listeners anteriores
    database.ref("patrimonios").on("value", snapshot => {
        tbody.innerHTML = '';

        if (!snapshot.exists()) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum patrimônio cadastrado.</td></tr>';
            return;
        }

        snapshot.forEach(childSnapshot => {
            const pat = childSnapshot.val();
            const key = childSnapshot.key;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${pat.tipo}</td>
                <td>${pat.valor}</td>
                <td>${pat.dataHora}</td>
                <td>${pat.tecnico}</td>
                <td>${pat.motivo}</td>
                <td>${pat.adicionadoPor}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="removerPatrimonio('${key}')">Remover</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

// 🔹 Remover patrimônio
function removerPatrimonio(key) {
    if (confirm("Tem certeza que deseja remover este patrimônio?")) {
        database.ref("patrimonios/" + key).remove()
            .then(() => {
                mostrarToast('success', 'Patrimônio removido com sucesso!');
            })
            .catch(error => {
                console.error("Erro ao remover patrimônio:", error);
                mostrarToast('error', "Erro ao remover patrimônio.");
            });
    }
}

// 🔹 Atualizar o Dashboard
function atualizarDashboard() {
    database.ref("patrimonios").on("value", snapshot => {
        let totalRoteador = 0;
        let totalOnu = 0;
        let totalGeral = 0;

        const diasUnicos = new Set();

        snapshot.forEach(childSnapshot => {
            const pat = childSnapshot.val();
            totalGeral++;
            if (pat.tipo === 'Roteador') totalRoteador++;
            if (pat.tipo === 'Onu') totalOnu++;

            const data = new Date(pat.dataHora.split(" ")[0].split('/').reverse().join('-'));
            diasUnicos.add(data.toDateString());
        });

        const mediaDiaria = (totalGeral / diasUnicos.size || 0).toFixed(2);

        document.getElementById("totalRoteador").textContent = totalRoteador;
        document.getElementById("totalOnu").textContent = totalOnu;
        document.getElementById("totalGeral").textContent = totalGeral;
        document.getElementById("mediaDiaria").textContent = mediaDiaria;
    });
}

// 🔹 Mostrar mensagens com Toast
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
    if (container) {
        container.insertAdjacentHTML('beforeend', toastHTML);

        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();

        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });

        setTimeout(() => {
            if (document.getElementById(toastId)) {
                document.getElementById(toastId).remove();
            }
        }, 5000);
    }
}

// 🔹 Inicializar ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    atualizarTabela();
    atualizarDashboard();
});
