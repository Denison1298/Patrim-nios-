// 🔹 Conectar ao Firebase Realtime Database
const database = firebase.database();

// 🔹 Abrir abas do sistema
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(tabName).classList.remove('hidden');

    if (tabName === 'dashboard') {
        atualizarDashboard();
    } else if (tabName === 'patrimonios') {
        atualizarTabela();
    }
}

// 🔹 Adicionar patrimônio ao Firebase
function adicionarPatrimonio(tipo) {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (!usuarioLogado) return;

    const inputId = tipo === 'Roteador' ? 'patrimonioRoteador' : 'patrimonioOnu';
    const tecnicoId = tipo === 'Roteador' ? 'tecnicoRoteador' : 'tecnicoOnu';
    const motivoId = tipo === 'Roteador' ? 'motivoRoteador' : 'motivoOnu';

    const valor = document.getElementById(inputId).value.trim();
    const tecnico = document.getElementById(tecnicoId).value.trim();
    const motivo = document.getElementById(motivoId).value.trim();

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

    // Limpar os campos após adicionar
    document.getElementById(inputId).value = '';
    document.getElementById(tecnicoId).value = '';
    document.getElementById(motivoId).value = '';
}

// 🔹 Atualizar a tabela pegando dados do Firebase
function atualizarTabela() {
    const tbody = document.getElementById("listaPatrimonios");
    tbody.innerHTML = '';

    database.ref("patrimonios").on("value", snapshot => {
        tbody.innerHTML = '';

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

// 🔹 Remover patrimônio do Firebase
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

// 🔹 Limpar todos os patrimônios do Firebase
function limparPatrimonios() {
    if (confirm("Tem certeza que deseja limpar todos os patrimônios?")) {
        database.ref("patrimonios").remove()
        .then(() => {
            mostrarToast('success', 'Todos os patrimônios foram removidos!');
        })
        .catch(error => {
            console.error("Erro ao limpar patrimônios:", error);
            mostrarToast('error', "Erro ao limpar patrimônios.");
        });
    }
}

// 🔹 Atualizar o Dashboard com os dados do Firebase
function atualizarDashboard() {
    database.ref("patrimonios").on("value", snapshot => {
        let totalRoteador = 0;
        let totalOnu = 0;
        let totalGeral = 0;

        snapshot.forEach(childSnapshot => {
            const pat = childSnapshot.val();
            totalGeral++;
            if (pat.tipo === 'Roteador') totalRoteador++;
            if (pat.tipo === 'Onu') totalOnu++;
        });

        document.getElementById("totalRoteador").textContent = totalRoteador;
        document.getElementById("totalOnu").textContent = totalOnu;
        document.getElementById("totalGeral").textContent = totalGeral;
    });
}

// 🔹 Exibir mensagens com Toast
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

// 🔹 Ocultar ou mostrar a tabela de patrimônios
document.addEventListener("DOMContentLoaded", () => {
    const btnOcultar = document.getElementById("btnOcultarPatrimonios");
    const btnLimpar = document.getElementById("btnLimparPatrimonios");

    if (btnOcultar) {
        btnOcultar.addEventListener("click", () => {
            document.getElementById("listaPatrimonios").classList.toggle("hidden");
        });
    }

    if (btnLimpar) {
        btnLimpar.addEventListener("click", limparPatrimonios);
    }

    atualizarTabela(); // 🔹 Atualiza a tabela ao carregar a página
    atualizarDashboard(); // 🔹 Atualiza o dashboard ao carregar a página
});

// 🔹 Função de logout
function logout() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
}
