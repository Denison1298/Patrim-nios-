<?php
// Configuração de conexão com o banco
$host = 'localhost';
$dbname = 'mandr615_Patrimonios';
$user = 'mandr615_Denison';
$password = 'Deh01020304';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Receber os dados do formulário
    $nome = $_POST['nome'];
    $senha = $_POST['senha'];

    // Buscar o usuário pelo nome
    $stmt = $conn->prepare("SELECT * FROM usuarios WHERE nome = :nome");
    $stmt->bindParam(':nome', $nome);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verificar se o usuário existe e se a senha está correta
    if ($usuario && password_verify($senha, $usuario['senha'])) {
        session_start();
        $_SESSION['usuario'] = $usuario['nome']; // Salva o nome do usuário na sessão
        echo json_encode(['status' => 'success', 'message' => 'Login realizado com sucesso!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Nome ou senha inválidos!']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erro no login: ' . $e->getMessage()]);
}
