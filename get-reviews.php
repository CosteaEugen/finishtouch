<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$reviews_file = 'reviews.json';
$reviews = [];

if (file_exists($reviews_file)) {
    $reviews = json_decode(file_get_contents($reviews_file), true);
    if ($reviews === null) $reviews = [];
}

usort($reviews, function($a, $b) {
    return strtotime($b['date']) - strtotime($a['date']);
});

echo json_encode(['success' => true, 'reviews' => $reviews]);
?>