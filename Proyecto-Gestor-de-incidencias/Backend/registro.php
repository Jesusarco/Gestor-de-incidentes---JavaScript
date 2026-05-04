<?php
require_once 'config.php';

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

// Verificar si el usuario ya existe
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE nombre = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode([
        'success' => false,
        'message' => 'El nombre de usuario ya está registrado'
    ]);
    $stmt->close();
    $conn->close();
    exit;
}

// Insertar nuevo usuario
$stmt = $conn->prepare("INSERT INTO usuarios (nombre, clave) VALUES (?, ?)");
$stmt->bind_param("ss", $username, $password);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Usuario registrado correctamente',
        'userId' => $conn->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al registrar usuario: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>