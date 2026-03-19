<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Legal Document Notification</title>
</head>

<body style="margin:0; padding:0; background-color:#f3f8f6; font-family: Arial, Helvetica, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr>
<td align="center">

<table width="640" cellpadding="0" cellspacing="0"
       style="background:#ffffff; border-radius:10px; overflow:hidden;">

<tr>
<td style="background:linear-gradient(90deg,#0B6623,#00A86B); padding:26px;">
<h2 style="margin:0; color:#ffffff;">Legal Document Notification</h2>
</td>
</tr>

<tr>
<td style="padding:30px; font-size:14px; color:#1f2937;">

<p>{{ $messageText }}</p>

<table width="100%" style="margin:20px 0; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px;">
<tr>
<td style="padding:16px;">
<strong>Document Title:</strong> {{ $document->title ?? 'Legal Document' }}<br>
<strong>Reference No.:</strong> {{ $document->reference_no ?? 'Reference No.' }}<br>
<strong>Status:</strong> {{ $document->status }}
</td>
</tr>
</table>

<div style="text-align:center; margin:30px 0;">
<a href="{{ url('/legal-documents/' . $document->id) }}"
   style="background-color:#00A86B; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold;">
View Document
</a>
</div>

</td>
</tr>

<tr>
<td style="padding:20px; text-align:center; font-size:12px; color:#6b7280;">
© {{ date('Y') }} Contract Management System <br>
This is an automated email.
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
