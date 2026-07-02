<?php
/**
 * Public Quick Quote form handler for the GetMoved landing site.
 * Sends via Amazon SES SMTP (same settings as Back/.env) using PHPMailer.
 * Both team addresses are primary recipients (To), not CC.
 */

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$config = require __DIR__ . '/quick-quote-config.php';

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body)) {
    $body = $_POST;
}

// Honeypot — bots often fill hidden fields.
$honeypot = trim((string)($body['website'] ?? $body['company_website'] ?? $body['hp'] ?? ''));
if ($honeypot !== '') {
    echo json_encode(['success' => true, 'message' => 'Request received']);
    exit;
}

$fullName = trim((string)($body['fullName'] ?? $body['full_name'] ?? ''));
$email = trim((string)($body['email'] ?? ''));
$phone = trim((string)($body['phone'] ?? ''));
$moveFrom = trim((string)($body['moveFrom'] ?? $body['move_from'] ?? ''));
$moveTo = trim((string)($body['moveTo'] ?? $body['move_to'] ?? ''));
$movingDate = trim((string)($body['movingDate'] ?? $body['moving_date'] ?? ''));
$propertyType = trim((string)($body['propertyType'] ?? $body['property_type'] ?? ''));
$details = trim((string)($body['details'] ?? ''));

if ($fullName === '' || $email === '' || $phone === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Full name, email, and phone are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

$shortFields = [$fullName, $email, $phone, $moveFrom, $moveTo, $movingDate, $propertyType];
foreach ($shortFields as $field) {
    if (strlen($field) > 200) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'One or more fields are too long']);
        exit;
    }
}
if (strlen($details) > 4000) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'One or more fields are too long']);
    exit;
}

date_default_timezone_set('Etc/UTC');

require __DIR__ . '/aws-ses-send.php';

function h($value) {
    return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

$submittedAt = gmdate('d/m/Y H:i:s') . ' UTC';
$subjectName = $fullName !== '' ? ' - ' . mb_substr($fullName, 0, 60) : '';
$subject = 'New Quick Quote Request' . $subjectName;

$row = function ($label, $value) {
    $display = trim((string)$value) !== '' ? h($value) : '-';
    return '<tr>'
        . '<td style="padding:8px 12px;border:1px solid #E5E7EB;background:#F8FAFC;font-weight:600;width:38%;font-size:13px;color:#374151;">'
        . h($label) . '</td>'
        . '<td style="padding:8px 12px;border:1px solid #E5E7EB;font-size:13px;color:#111827;">'
        . $display . '</td></tr>';
};

$htmlBody = '
<div style="font-family: Arial, sans-serif; background: #F5F7FA; padding: 20px 10px;">
  <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #E5E7EB; border-radius: 10px; padding: 24px;">
    <h2 style="margin: 0 0 6px; color: #00A76F; font-size: 22px;">New Quick Quote Request</h2>
    <p style="margin: 0 0 16px; color: #4B5563; font-size: 14px;">
      A new quote request was submitted from the GetMoved landing page.
    </p>
    <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">'
    . $row('Full Name', $fullName)
    . $row('Email', $email)
    . $row('Phone', $phone)
    . $row('Move From', $moveFrom)
    . $row('Move To', $moveTo)
    . $row('Moving Date', $movingDate)
    . $row('Property Type', $propertyType)
    . $row('Additional Details', nl2br(h($details)))
    . $row('Submitted', $submittedAt)
    . '</table>
    <p style="margin: 16px 0 0; color: #919EAB; font-size: 12px;">
      Reply directly to this email to reach the customer.
    </p>
  </div>
</div>';

$textBody = "New Quick Quote Request\n\n"
    . "Full Name: {$fullName}\n"
    . "Email: {$email}\n"
    . "Phone: {$phone}\n"
    . "Move From: " . ($moveFrom !== '' ? $moveFrom : '-') . "\n"
    . "Move To: " . ($moveTo !== '' ? $moveTo : '-') . "\n"
    . "Moving Date: " . ($movingDate !== '' ? $movingDate : '-') . "\n"
    . "Property Type: " . ($propertyType !== '' ? $propertyType : '-') . "\n"
    . "Additional Details: " . ($details !== '' ? $details : '-') . "\n"
    . "Submitted: {$submittedAt}\n";

try {
    $fromEmail = $config['from_email'] ?? 'noreply@getmoved.app';
    $fromName = $config['from_name'] ?? 'GetMoved';
    $source = $fromName !== '' ? $fromName . ' <' . $fromEmail . '>' : $fromEmail;

    gm_ses_send_email($config, [
        'from' => $source,
        'to' => $config['recipients'] ?? ['jack@getmoved.app', 'djakovic@getmoved.app'],
        'reply_to' => $email,
        'subject' => $subject,
        'html' => $htmlBody,
        'text' => $textBody,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Quote request sent successfully',
    ]);
} catch (Throwable $e) {
    error_log('Quick quote mail error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error sending quote request',
    ]);
}
