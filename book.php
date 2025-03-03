<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$response = array();

try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
        $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
        $service = filter_var($_POST['service'], FILTER_SANITIZE_STRING);
        $date = filter_var($_POST['date'], FILTER_SANITIZE_STRING);
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new Exception("Invalid email format");
        if (!preg_match("/^\d{4}-\d{2}-\d{2}$/", $date)) throw new Exception("Invalid date format. Use YYYY-MM-DD");
        if (empty($name) || strlen($name) < 2) throw new Exception("Name must be at least 2 characters");
        $valid_services = array('exterior-wash', 'interior-cleaning', 'full-detailing');
        if (!in_array($service, $valid_services)) throw new Exception("Invalid service selected");

        $to = "costea_gen@yahoo.com";
        $subject = "New Booking - Finish Touch";
        $message = "Booking Details:\n\nName: $name\nEmail: $email\nService: $service\nDate: $date\n";
        $headers = "From: bookings@yourwebsite.com\r\nReply-To: $email\r\nX-Mailer: PHP/" . phpversion();

        if (mail($to, $subject, $message, $headers)) {
            $response['success'] = true;
            $response['message'] = "Booking successfully recorded!";
        } else {
            throw new Exception("Error sending email. Please try again.");
        }
    } else {
        throw new Exception("Invalid request method");
    }
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>