<?php
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->username) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Usuario y contraseña requeridos']);
    exit;
}

$username = $data->username;
$password = $data->password;
$force = isset($data->force) && $data->force === true;

// Validar formato: 3 letras mayúsculas y 3 números
if (!preg_match('/^(?=.*[A-Z].*[A-Z].*[A-Z])(?=.*\d.*\d.*\d)[A-Z\d]{6}$/', $password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La contraseña debe tener exactamente 3 letras mayúsculas y 3 números (ej: ABC123)']);
    exit;
}

$conn = conectarDB();

// Verificar si el usuario ya existe
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE nombre = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'El nombre de usuario ya está registrado']);
    $stmt->close();
    $conn->close();
    exit;
}
$stmt->close();

// Contar usuarios actuales
$totalUsuarios = $conn->query("SELECT COUNT(*) as total FROM usuarios")->fetch_assoc()['total'];

// Si hay 3 o más y no es forzado, pedir confirmación
if ($totalUsuarios >= 3 && !$force) {
    $oldUser = $conn->query("SELECT id, nombre FROM usuarios ORDER BY id ASC LIMIT 1")->fetch_assoc();
    http_response_code(409);
    echo json_encode([
        'success' => false,
        'needConfirmation' => true,
        'oldestUser' => $oldUser,
        'message' => 'Ya hay 3 usuarios registrados. ¿Deseas borrar al usuario "' . $oldUser['nombre'] . '" (el más antiguo) y registrar el nuevo?'
    ]);
    $conn->close();
    exit;
}

// Si es forzado y hay 3, borrar el más antiguo
if ($force && $totalUsuarios >= 3) {
    $oldId = $conn->query("SELECT id FROM usuarios ORDER BY id ASC LIMIT 1")->fetch_assoc()['id'];
    $del = $conn->prepare("DELETE FROM usuarios WHERE id = ?");
    $del->bind_param("i", $oldId);
    $del->execute();
    $del->close();
}

// Insertar nuevo usuario
$stmt = $conn->prepare("INSERT INTO usuarios (nombre, clave) VALUES (?, ?)");
$stmt->bind_param("ss", $username, $password);
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Usuario registrado correctamente' . ($force ? ' (se borró el más antiguo)' : ''), 'userId' => $conn->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al registrar usuario: ' . $stmt->error]);
}
$stmt->close();
$conn->close();
?>