<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Dezactivăm afișarea erorilor vizibile pentru a preveni coruperea JSON-ului
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Verificăm dacă PHPMailer este instalat
if (!file_exists('vendor/autoload.php')) {
    die(json_encode(['success' => false, 'message' => 'PHPMailer not found. Run "composer require phpmailer/phpmailer" in your project directory.']));
}

require 'vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$response = array();

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        throw new Exception("Invalid request method");
    }

    $name = filter_var($_POST['name'] ?? '', FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $phone = filter_var($_POST['phone'] ?? '', FILTER_SANITIZE_STRING);
    $service = filter_var($_POST['service'] ?? '', FILTER_SANITIZE_STRING);
    $date = filter_var($_POST['date'] ?? '', FILTER_SANITIZE_STRING);

    if (empty($name) || strlen($name) < 2) {
        throw new Exception("Name must be at least 2 characters long");
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email format");
    }
    if (!preg_match("/^[0-9]+$/", $phone)) {
        throw new Exception("Please enter a valid phone number (digits only)");
    }
    if (!preg_match("/^\d{4}-\d{2}-\d{2}$/", $date)) {
        throw new Exception("Invalid date format. Use YYYY-MM-DD");
    }
    $valid_services = ['exterior-wash', 'interior-cleaning', 'full-detailing'];
    if (!in_array($service, $valid_services)) {
        throw new Exception("Invalid service selected");
    }

    $mail = new PHPMailer(true);
    try {
        $mail->SMTPDebug = 2; // Activăm debug-ul (pentru testare, setează la 0 în producție)
        $mail->Debugoutput = function($str, $level) use (&$response) {
            $response['debug'] .= "[$level] $str\n"; // Colectăm debug-ul
        };
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'costeaeugen99@gmail.com';
        $mail->Password = 'vill niwh jgng yyhs'; // Parola de aplicație Gmail
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        $mail->setFrom('costeaeugen99@gmail.com', 'Finish Touch Booking');
        $mail->addAddress('costea_gen@yahoo.com');
        $mail->addReplyTo($email, $name);
        $mail->isHTML(false);
        $mail->Subject = 'New Booking - Finish Touch';
        $mail->Body = "Booking Details:\n\n" .
                      "Name: $name\n" .
                      "Email: $email\n" .
                      "Phone: $phone\n" .
                      "Service: $service\n" .
                      "Date: $date\n";

        $mail->send();
        $response['success'] = true;
        $response['message'] = "Booking successfully recorded!";
    } catch (Exception $e) {
        throw new Exception("Error sending email: " . $mail->ErrorInfo);
    }
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>