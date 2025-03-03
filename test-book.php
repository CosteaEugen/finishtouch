<?php
header('Content-Type: application/json');

$name = "Test Name";
$email = "test@example.com";
$service = "full-detailing";
$date = "2025-03-10";

$to = "costea_gen@yahoo.com";
$subject = "Test Booking - Finish Touch";
$message = "Booking Details:\n\nName: $name\nEmail: $email\nService: $service\nDate: $date\n";
$headers = "From: bookings@yourwebsite.com\r\nReply-To: $email\r\nX-Mailer: PHP/" . phpversion();

if (mail($to, $subject, $message, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Test booking sent!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Test booking failed.']);
}
?>