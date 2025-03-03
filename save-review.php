<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$response = array();
$reviews_file = 'reviews.json';

try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $name = filter_var($_POST['name'] ?? '', FILTER_SANITIZE_STRING);
        $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
        $rating = filter_var($_POST['rating'] ?? 5, FILTER_VALIDATE_INT);
        $text = filter_var($_POST['text'] ?? '', FILTER_SANITIZE_STRING);
        $service = filter_var($_POST['service'] ?? '', FILTER_SANITIZE_STRING);
        
        if (empty($name) || strlen($name) < 2) throw new Exception("Please enter a valid name");
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new Exception("Please enter a valid email");
        if ($rating < 1 || $rating > 5) throw new Exception("Invalid rating");
        if (empty($text) || strlen($text) < 10) throw new Exception("Review must be at least 10 characters");
        
        $valid_services = array('exterior-wash', 'interior-cleaning', 'full-detailing');
        if (!in_array($service, $valid_services)) $service = 'unspecified';
        
        $reviews = file_exists($reviews_file) ? json_decode(file_get_contents($reviews_file), true) : [];
        if ($reviews === null) $reviews = [];
        
        $new_review = [
            'id' => uniqid(),
            'name' => $name,
            'email_hash' => md5(strtolower(trim($email))),
            'rating' => $rating,
            'text' => $text,
            'service' => $service,
            'date' => date('Y-m-d H:i:s'),
            'verified' => true
        ];
        
        $reviews[] = $new_review;
        
        if (file_put_contents($reviews_file, json_encode($reviews))) {
            $response['success'] = true;
            $response['message'] = "Thank you for your review!";
            $response['review'] = $new_review;
        } else {
            throw new Exception("Error saving review. Please try again.");
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