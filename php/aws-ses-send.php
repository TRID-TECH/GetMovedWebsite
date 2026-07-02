<?php
/**
 * Minimal Amazon SES SendEmail via AWS SigV4 (no Composer / SDK required).
 * Uses the same AWS_ACCESS_KEY / AWS_SECRET_KEY as Back/.env.
 */
function gm_ses_send_email(array $config, array $message)
{
    $accessKey = trim((string)($config['aws_access_key'] ?? ''));
    $secretKey = trim((string)($config['aws_secret_key'] ?? ''));
    $region = trim((string)($config['aws_region'] ?? 'us-east-2'));
    $from = trim((string)($message['from'] ?? $config['from_email'] ?? ''));
    $replyTo = trim((string)($message['reply_to'] ?? ''));
    $subject = (string)($message['subject'] ?? '');
    $html = (string)($message['html'] ?? '');
    $text = (string)($message['text'] ?? '');
    $recipients = $message['to'] ?? ($config['recipients'] ?? []);

    if ($accessKey === '' || $secretKey === '' || $from === '') {
        throw new RuntimeException('AWS SES credentials or from address missing in config');
    }
    if (!is_array($recipients)) {
        $recipients = array_map('trim', explode(',', (string)$recipients));
    }
    $recipients = array_values(array_filter($recipients, static function ($email) {
        return $email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL);
    }));
    if (count($recipients) === 0) {
        throw new RuntimeException('No valid recipient addresses configured');
    }

    $params = [
        'Action' => 'SendEmail',
        'Version' => '2010-12-01',
        'Source' => $from,
        'Message.Subject.Data' => $subject,
        'Message.Subject.Charset' => 'UTF-8',
        'Message.Body.Html.Data' => $html,
        'Message.Body.Html.Charset' => 'UTF-8',
        'Message.Body.Text.Data' => $text,
        'Message.Body.Text.Charset' => 'UTF-8',
    ];

    foreach ($recipients as $index => $recipient) {
        $params['Destination.ToAddresses.member.' . ($index + 1)] = $recipient;
    }
    if ($replyTo !== '' && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $params['ReplyToAddresses.member.1'] = $replyTo;
    }

    ksort($params);
    $bodyParts = [];
    foreach ($params as $key => $value) {
        $bodyParts[] = rawurlencode($key) . '=' . rawurlencode($value);
    }
    $body = implode('&', $bodyParts);

    $host = 'email.' . $region . '.amazonaws.com';
    $amzDate = gmdate('Ymd\THis\Z');
    $dateStamp = gmdate('Ymd');
    $service = 'ses';
    $canonicalUri = '/';
    $canonicalQuery = '';
    $payloadHash = hash('sha256', $body);
    $canonicalHeaders = 'content-type:application/x-www-form-urlencoded; charset=utf-8\n'
        . 'host:' . $host . "\n"
        . 'x-amz-date:' . $amzDate . "\n";
    $signedHeaders = 'content-type;host;x-amz-date';
    $canonicalRequest = "POST\n{$canonicalUri}\n{$canonicalQuery}\n{$canonicalHeaders}\n{$signedHeaders}\n{$payloadHash}";

    $credentialScope = "{$dateStamp}/{$region}/{$service}/aws4_request";
    $stringToSign = "AWS4-HMAC-SHA256\n{$amzDate}\n{$credentialScope}\n" . hash('sha256', $canonicalRequest);

    $kDate = hash_hmac('sha256', $dateStamp, 'AWS4' . $secretKey, true);
    $kRegion = hash_hmac('sha256', $region, $kDate, true);
    $kService = hash_hmac('sha256', $service, $kRegion, true);
    $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
    $signature = hash_hmac('sha256', $stringToSign, $kSigning);

    $authorization = 'AWS4-HMAC-SHA256 Credential=' . $accessKey . '/' . $credentialScope
        . ', SignedHeaders=' . $signedHeaders . ', Signature=' . $signature;

    $ch = curl_init('https://' . $host . '/');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/x-www-form-urlencoded; charset=utf-8',
            'Host: ' . $host,
            'X-Amz-Date: ' . $amzDate,
            'Authorization: ' . $authorization,
        ],
        CURLOPT_TIMEOUT => 20,
    ]);

    $response = curl_exec($ch);
    $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        throw new RuntimeException('SES request failed: ' . $curlError);
    }
    if ($httpCode >= 400) {
        throw new RuntimeException('SES HTTP ' . $httpCode . ': ' . $response);
    }

    return true;
}
