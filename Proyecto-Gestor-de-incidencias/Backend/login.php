<?php
require_once 'config.php';

// Obtener datos del POST
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->username) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Usuario y contraseña requeridos'
    ]);
    exit;
}

$username = $data->username;
$password = $data->password;

$conn = conectarDB();

// Consulta preparada para evitar SQL Injection
$stmt = $conn->prepare("SELECT id, nombre FROM usuarios WHERE nombre = ? AND clave = ?");
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $usuario = $result->fetch_assoc();
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $usuario['id'],
            'nombre' => $usuario['nombre']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Usuario o contraseña incorrectos'
    ]);
}

$stmt->close();
$conn->close();
?>