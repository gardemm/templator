<?php
session_cache_limiter('nocache');
header('Expires: ' . gmdate('r', 0));

header('Content-type: application/json');

// Enter your email address below.
// TODO
$to = '';
$copy = '<dmitryarchebasov@gmail.com>';

$subject = '';

if($to) {
	//$massage = $_POST['message'];
	//$email = $_POST['email'];

	$fields = array(
		0 => array(
			'text' => 'Телефон',
			'val' => $_POST['contacts']
		),
		1 => array(
			'text' => 'Авто',
			'val'  => $_POST['car']
		),
		2 => array(
			'text' => 'Комментарии',
			'val' => $_POST['message']
		),
		3 => array(
			'text' => 'Имя',
			'val' => $_POST['name']
		),
	);

	$message = "";

	foreach($fields as $field) {
		$message .= $field['text'].": " . htmlspecialchars($field['val'], ENT_QUOTES) . "<br>\n";
	}

	$phone = $_POST['contacts'] != '' ? trim($_POST['contacts']) : '';

	$headers = '';
	$headers .= 'From: ' . '<auto-vukup.ru>' . "\r\n";
	$headers .= "Reply-To: " . $to . "\r\n";
	$headers .= 'Cc: ' . $copy ."\r\n";
	$headers .= "MIME-Version: 1.0\r\n";
	$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

	if($phone != '') {
		if (mail($to, $subject, $message, $headers)){
			$arrResult = array ('response'=>'success');
		} else {
			$arrResult = array ('response'=>'error');
		}
	} else {
		$arrResult = array ('response'=>'error', 'field'=>'phone');
	}

	echo json_encode($arrResult);

} else {

	$arrResult = array ('response'=>'error');
	echo json_encode($arrResult);

}
?>
