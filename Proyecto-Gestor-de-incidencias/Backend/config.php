<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit;

ini_set('display_errors', 0);
error_reporting(0);

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'incidencias_db');

function conectarDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error de conexión'
        ]);
        exit;
    }

    $conn->set_charset("utf8");
    return $conn;
}
?>