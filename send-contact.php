<?php
declare(strict_types=1);

const CONTACT_RECIPIENT = 'contact@ariaofficial.jp';
const CONTACT_FROM = 'webform@aria-inc.co.jp';
const MAX_MESSAGE_LENGTH = 5000;
const SUBMIT_INTERVAL_SECONDS = 15;

function redirect_to(string $location): void
{
    header('Location: ' . $location, true, 303);
    exit;
}

function input_value(string $key): string
{
    $value = $_POST[$key] ?? '';
    return is_string($value) ? trim($value) : '';
}

function text_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function mime_subject(string $subject): string
{
    if (function_exists('mb_encode_mimeheader')) {
        return mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n");
    }
    return '=?UTF-8?B?' . base64_encode($subject) . '?=';
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit('Method Not Allowed');
}

$language = input_value('lang') === 'en' ? 'en' : 'ja';
$isEnglish = $language === 'en';
$formPage = $isEnglish ? 'contact-en.html' : 'contact.html';
$thanksPage = $isEnglish ? 'thanks.html?lang=en' : 'thanks.html';

// Silently accept likely bot submissions so the form cannot be used to probe the filter.
if (input_value('website') !== '') {
    redirect_to($thanksPage);
}

session_start();
$now = time();
$lastSubmission = isset($_SESSION['aria_contact_submitted_at'])
    ? (int) $_SESSION['aria_contact_submitted_at']
    : 0;
if ($lastSubmission > 0 && ($now - $lastSubmission) < SUBMIT_INTERVAL_SECONDS) {
    redirect_to($formPage . '?status=rate#contact-form');
}

$inquiryType = input_value('inquiry_type');
$company = input_value('company');
$name = input_value('name');
$email = input_value('email');
$telephone = input_value('tel');
$message = input_value('message');

$allowedTypes = ['partnership', 'media', 'other'];
$companyRequired = in_array($inquiryType, ['partnership', 'media'], true);
$valid = in_array($inquiryType, $allowedTypes, true)
    && (!$companyRequired || $company !== '')
    && text_length($company) <= 160
    && $name !== ''
    && text_length($name) <= 100
    && filter_var($email, FILTER_VALIDATE_EMAIL) !== false
    && text_length($email) <= 254
    && text_length($telephone) <= 50
    && $message !== ''
    && text_length($message) <= MAX_MESSAGE_LENGTH;

if (!$valid) {
    redirect_to($formPage . '?status=validation#contact-form');
}

$typeLabels = $isEnglish
    ? ['partnership' => 'Business Partnership', 'media' => 'Media', 'other' => 'Other']
    : ['partnership' => '事業提携', 'media' => '取材・メディア', 'other' => 'その他'];

$subject = $isEnglish
    ? 'New inquiry from the Aria website'
    : 'Aria公式サイトからのお問い合わせ';

$bodyLines = $isEnglish
    ? [
        'A new inquiry was submitted through the Aria website.',
        '',
        'Inquiry type: ' . $typeLabels[$inquiryType],
        'Company / Organization: ' . ($company !== '' ? $company : '(not provided)'),
        'Name: ' . $name,
        'Email: ' . $email,
        'Phone: ' . ($telephone !== '' ? $telephone : '(not provided)'),
        '',
        'Message:',
        $message,
    ]
    : [
        'Aria公式サイトからお問い合わせがありました。',
        '',
        'お問い合わせ種別：' . $typeLabels[$inquiryType],
        '会社・団体名：' . ($company !== '' ? $company : '（未入力）'),
        'お名前：' . $name,
        'メールアドレス：' . $email,
        '電話番号：' . ($telephone !== '' ? $telephone : '（未入力）'),
        '',
        'お問い合わせ内容：',
        $message,
    ];

$headers = [
    'From: Aria Website <' . CONTACT_FROM . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Content-Type-Options: nosniff',
];

$sent = mail(
    CONTACT_RECIPIENT,
    mime_subject($subject),
    implode("\r\n", $bodyLines),
    implode("\r\n", $headers)
);

if (!$sent) {
    error_log('Aria contact form: mail() returned false.');
    redirect_to($formPage . '?status=send#contact-form');
}

$_SESSION['aria_contact_submitted_at'] = $now;
redirect_to($thanksPage);
