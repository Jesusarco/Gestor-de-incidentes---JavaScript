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

// Validar que solo contenga letras (mayúsculas o minúsculas)
if (!preg_match('/^[A-Za-z]+$/', $password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La contraseña solo debe contener letras (sin números)']);
    exit;
}

$conn = conectarDB();

$stmt = $conn->prepare("SELECT id, nombre, clave FROM usuarios WHERE nombre = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $usuario = $result->fetch_assoc();
    $storedPassword = $usuario['clave']; // Ej: "ABC123"
    $storedLetters = preg_replace('/[^a-zA-Z]/', '', $storedPassword);
    
    if ($storedLetters === $password) {
        echo json_encode([
            'success' => true,
            'user' => ['id' => $usuario['id'], 'nombre' => $usuario['nombre']]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Letras de la contraseña incorrectas']);
    }
} else {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
}

$stmt->close();
$conn->close();
?>