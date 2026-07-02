<?php
/**
 * Copy to quick-quote-config.local.php and fill in values from Back/.env:
 *   AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_SES_REGION, AWS_SES_FROM
 *   SYSTEM_REQUEST_EMAILS=jack@getmoved.app,djakovic@getmoved.app
 */
return [
    'aws_access_key' => 'YOUR_AWS_ACCESS_KEY',
    'aws_secret_key' => 'YOUR_AWS_SECRET_KEY',
    'aws_region' => 'us-east-2',
    'from_email' => 'noreply@getmoved.app',
    'from_name' => 'GetMoved',
    'recipients' => [
        'jack@getmoved.app',
        'djakovic@getmoved.app',
    ],
];
