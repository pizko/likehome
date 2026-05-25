<?php
header('Content-Type: application/json; charset=utf-8');

function bad($msg, $code = 400) {
  http_response_code($code);
  echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
  exit;
}

// Куда отправлять
$to = 'hostel.yadirect@yandex.ru, hl.hostel2022@gmail.com';

// Антиспам: honeypot поле должно быть пустым
if (!empty($_POST['website'] ?? '')) {
  bad('Spam detected', 400);
}

$name   = trim($_POST['name'] ?? '');
$phone  = trim($_POST['phone'] ?? '');
$checkin= trim($_POST['checkin'] ?? '');
$days   = trim($_POST['days'] ?? '');

if (mb_strlen($name) < 2) bad('Укажите имя (минимум 2 символа).');
if (mb_strlen($phone) < 6) bad('Укажите телефон.');
if ($checkin === '') bad('Укажите дату заселения.');
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $checkin)) bad('Неверный формат даты.');
if (!ctype_digit($days)) bad('Кол-во дней должно быть числом.');
$daysInt = intval($days);
if ($daysInt < 1 || $daysInt > 60) bad('Кол-во дней: от 1 до 60.');

$subject = 'Заявка на бронирование (LikeHome Hostel)';
$dateStr = date('Y-m-d H:i:s');

$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

$message =
"Новая заявка на бронирование\n\n".
"Имя: $name\n".
"Телефон: $phone\n".
"Дата заселения: $checkin\n".
"Кол-во дней: $daysInt\n\n".
"Время: $dateStr\n".
"IP: $ip\n".
"UA: $ua\n";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
// From лучше с домена (многие хостинги режут чужие)
$headers[] = 'From: LikeHome Hostel <no-reply@likehome-hostel.ru>';
$headers[] = 'Reply-To: ' . $to;

$ok = mail($to, '=?UTF-8?B?'.base64_encode($subject).'?=', $message, implode("\r\n", $headers));

if (!$ok) bad('Почта не отправилась (mail() вернул false). Проверьте настройки хостинга.', 500);

echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);