<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$reviews_file = 'reviews.json';
$response = array();

try {
    if (file_exists($reviews_file)) {
        $reviews = json_decode(file_get_contents($reviews_file), true);
        if ($reviews === null) throw new Exception("Error decoding reviews file");
        $response['success'] = true;
        $response['reviews'] = $reviews;
    } else {
        $response['success'] = true;
        $response['reviews'] = []; // Fișierul nu există încă, returnăm un array gol
    }
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>