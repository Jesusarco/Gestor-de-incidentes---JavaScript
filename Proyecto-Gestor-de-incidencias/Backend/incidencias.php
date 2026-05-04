<?php
error_reporting(0);
ini_set('display_errors', 0);
require_once 'config.php';

$conn = conectarDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

case 'GET':

    $sql = "SELECT * FROM incidencias ORDER BY id DESC";
    $result = $conn->query($sql);

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
    break;

case 'POST':

    $data = json_decode(file_get_contents("php://input"));

    if (!$data) {
        echo json_encode(['success'=>false,'message'=>'JSON inválido']);
        exit;
    }

    $stmt = $conn->prepare("
        INSERT INTO incidencias
        (fecha, descripcion, tipo, prioridad, tiempo_estimado, tecnico_asignado, creado_por)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->bind_param(
        "sssisss",
        $data->fecha,
        $data->descripcion,
        $data->tipo,
        $data->prioridad,
        $data->tiempoEstimado,
        $data->tecnicoAsignado,
        $data->creadoPor
    );

    $stmt->execute();

    echo json_encode([
        'success' => true,
        'id' => $conn->insert_id
    ]);

    break;

case 'DELETE':

    $id = $_GET['id'] ?? 0;

    $stmt = $conn->prepare("DELETE FROM incidencias WHERE id=?");
    $stmt->bind_param("i", $id);

    $stmt->execute();

    echo json_encode(['success'=>true]);

    break;
}

$conn->close();
?>