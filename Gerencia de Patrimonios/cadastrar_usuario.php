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
    $senha = password_hash($_POST['senha'], PASSWORD_DEFAULT); // Criptografar a senha

    // Inserir os dados na tabela
    $stmt = $conn->prepare("INSERT INTO usuarios (nome, senha) VALUES (:nome, :senha)");
    $stmt->bindParam(':nome', $nome);
    $stmt->bindParam(':senha', $senha);
    $stmt->execute();

    echo json_encode(['status' => 'success', 'message' => 'Usuário cadastrado com sucesso!']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erro ao cadastrar usuário: ' . $e->getMessage()]);
}
