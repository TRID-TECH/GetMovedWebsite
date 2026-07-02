<?php
/**
 * Quick Quote mail config loader.
 * Reads php/quick-quote-config.local.php (same SES settings as Back/.env).
 */
$configFile = __DIR__ . '/quick-quote-config.local.php';
if (!is_file($configFile)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => false,
        'message' => 'Mail config missing. Copy quick-quote-config.example.php to quick-quote-config.local.php',
    ]);
    exit;
}

return require $configFile;
