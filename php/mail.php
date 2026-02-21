<?php

//SMTP needs accurate times, and the PHP time zone MUST be set
date_default_timezone_set('Etc/UTC');
//Use PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
//Get the files
require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';
//Sumbission data
$ipaddress = $_SERVER['REMOTE_ADDR'];
$date = date('d/m/Y');
$time = date('H:i:s');

//form data
$name = $_POST['name'];
$email = $_POST['email'];
$subject = $_POST['subject'];
$message = $_POST['message'];

//Create a new PHPMailer
$mail = new PHPMailer;
//Use SMTP
$mail->isSMTP();
//Show details when visit URL of this file - For example: www.yourdomain.com/php/mail.php
//0 = off (for production use) - 1 = client messages - 2 = client and server messages
$mail->SMTPDebug = 2;
//Your Host address - smtp.website.com, mail.website.com
$mail->Host = 'smtp.example.com';
//Port for your host
$mail->Port = 587;
//Character settting of mails
$mail->CharSet = 'UTF-8';
// Remove slashes if your hosting is 'ssl' or 'tls'
//$mail->SMTPSecure = 'tls';
// Disable auto tls
$mail->SMTPAutoTLS = false;
$mail->SMTPAuth = true;
// Your NOREPLY address. This is not the e-mail address you use.
//You must create a sender e-mail from your server. - noreply@yourdomain.com
$mail->Username = 'smtp.example.com';
// Password of your sender (noreply) address. - Not your personal e-mail address
$mail->Password = 'noreplyPassword';
//Add your Noreply address and name of your Website.
$mail->setFrom('noreply@example.com', 'North Premium Template');
//You will see this e-mail when you click on Reply button on your device.
//Leave like this if you reply your customers directly.
$mail->addReplyTo($email);
//This is your e-mail address, add your e-mail address here. Your noreply address will send e-mail to this address.
$mail->addAddress('whoto@example.com', 'John Doe');
//CC - Will the email go to someone else?
$mail->addCC('whoto@example.com', 'John Doe');
//CC2 - And one more person
$mail->addBCC('whoto@example.com', 'John Doe');
//Subject of e-mail
$mail->Subject = $subject;
//Read an HTML message body from an external file, convert referenced images to embedded,
//convert HTML into a basic plain-text alternative body
$mail->msgHTML( "<p>You have recieved a new message from the enquiries form on your website.</p>
					  <p><strong>Name: </strong> {$name} </p>
					  <p><strong>Email Address: </strong> {$email} </p>
					  <p><strong>Subject: </strong> {$subject} </p>
					  <p><strong>Message: </strong> {$message} </p>
					  <p>This message was sent from the IP Address: {$ipaddress} on {$date} at {$time}</p>" );
//Replace the plain text body with one created manually
$mail->AltBody = 'This is a plain-text message body';
//send the message, check for errors
if(!$mail->send()){
    echo 'Mailer Error: ' . $mail->ErrorInfo;
}else{
    echo 'Message sent!';
}
