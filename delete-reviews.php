<?php
$username = 'admin';
$password = 'parola123';

if (!isset($_SERVER['PHP_AUTH_USER']) || 
    $_SERVER['PHP_AUTH_USER'] != $username || 
    $_SERVER['PHP_AUTH_PW'] != $password) {
    header('WWW-Authenticate: Basic realm="Admin Area"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Unauthorized Access';
    exit;
}

$reviews_file = 'reviews.json';

if (file_exists($reviews_file)) {
    if (isset($_POST['delete_all'])) {
        file_put_contents($reviews_file, json_encode([]));
        $message = "All reviews have been deleted successfully!";
    } elseif (isset($_POST['delete_selected']) && isset($_POST['selected_reviews'])) {
        $reviews = json_decode(file_get_contents($reviews_file), true);
        $selected = $_POST['selected_reviews'];
        $new_reviews = array_filter($reviews, function($index) use ($selected) {
            return !in_array($index, $selected);
        }, ARRAY_FILTER_USE_KEY);
        $new_reviews = array_values($new_reviews);
        file_put_contents($reviews_file, json_encode($new_reviews));
        $message = "Selected reviews have been deleted successfully!";
    }
    $reviews = json_decode(file_get_contents($reviews_file), true);
} else {
    $reviews = [];
    $message = "Reviews file does not exist.";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Reviews</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        .admin-container { max-width: 800px; margin: 20px auto; padding: 20px; background: #222; border-radius: 10px; }
        .message { padding: 10px; margin-bottom: 20px; border-radius: 5px; background: #28a745; color: white; }
        .review-item { padding: 15px; margin-bottom: 10px; background: #333; border-radius: 5px; }
        .actions button { background: #ff0000; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; margin-right: 10px; }
    </style>
</head>
<body>
    <div class="admin-container">
        <h1>Manage Reviews</h1>
        <?php if (isset($message)): ?>
            <div class="message"><?php echo $message; ?></div>
        <?php endif; ?>
        <form method="post">
            <?php if (count($reviews) > 0): ?>
                <div class="review-list">
                    <?php foreach ($reviews as $index => $review): ?>
                        <div class="review-item">
                            <input type="checkbox" name="selected_reviews[]" value="<?php echo $index; ?>">
                            <strong>Name:</strong> <?php echo htmlspecialchars($review['name'] ?? 'Anonymous'); ?><br>
                            <strong>Rating:</strong> <?php echo $review['rating']; ?> stars<br>
                            <strong>Text:</strong> <?php echo htmlspecialchars($review['text']); ?><br>
                            <strong>Date:</strong> <?php echo $review['date']; ?>
                        </div>
                    <?php endforeach; ?>
                </div>
                <div class="actions">
                    <button type="submit" name="delete_selected">Delete Selected</button>
                    <button type="submit" name="delete_all" onclick="return confirm('Are you sure you want to delete all reviews?');">Delete All</button>
                </div>
            <?php else: ?>
                <p>No reviews available.</p>
            <?php endif; ?>
        </form>
    </div>
</body>
</html>