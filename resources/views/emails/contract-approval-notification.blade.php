<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Contract Workflow Notification</title>
</head>

<body style="margin:0; padding:0; background-color:#f3f8f6; font-family: Arial, Helvetica, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px; background-color:#f3f8f6;">
<tr>
<td align="center">

<!-- Main Container -->
<table width="640" cellpadding="0" cellspacing="0"
       style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.06);">

    <!-- Header -->
    <tr>
        <td style="background:linear-gradient(90deg,#0B6623,#00A86B); padding:26px 32px;">
            <h2 style="margin:0; color:#ffffff; font-size:20px; letter-spacing:0.5px;">
                Contract Workflow Notification
            </h2>
            <p style="margin:6px 0 0 0; color:#d1fae5; font-size:13px;">
                Contract Management System
            </p>
        </td>
    </tr>

    <!-- Body -->
    <tr>
        <td style="padding:32px; color:#1f2937; font-size:14px; line-height:1.7;">

            <p style="margin-top:0; font-size:15px;">
                Dear User,
            </p>

            <p style="margin:16px 0;">
                {{ $messageText }}
            </p>

            <!-- Info Card -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="margin:28px 0; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px;">
                <tr>
                    <td style="padding:20px;">

                        <p style="margin:0; font-size:13px; color:#065f46;">
                            Transaction Number
                        </p>
                        <p style="margin:4px 0 14px 0; font-size:16px; font-weight:bold; color:#064e3b;">
                            {{ $contract->transaction_no }}
                        </p>

                        <p style="margin:0; font-size:13px; color:#065f46;">
                            Current Status
                        </p>
                        <p style="margin:6px 0 0 0;">
                            <span style="
                                display:inline-block;
                                padding:6px 14px;
                                font-size:12px;
                                font-weight:bold;
                                border-radius:20px;
                                background-color:#dcfce7;
                                color:#166534;">
                                {{ $contract->status }}
                            </span>
                        </p>

                    </td>
                </tr>
            </table>

            <!-- CTA Button -->
            <div style="text-align:center; margin:32px 0;">
                <a href="{{ url('/contracts/' . $contract->id) }}"
                   style="
                        background-color:#00A86B;
                        color:#ffffff;
                        text-decoration:none;
                        padding:14px 28px;
                        border-radius:8px;
                        font-weight:bold;
                        font-size:14px;
                        display:inline-block;
                        box-shadow:0 4px 12px rgba(0,168,107,0.35);
                   ">
                    View Contract Details
                </a>
            </div>

            <p style="margin-top:24px; font-size:13px; color:#4b5563;">
                If you require assistance, please contact the Contracts or Legal Department.
            </p>

        </td>
    </tr>

    <!-- Divider -->
    <tr>
        <td style="height:1px; background:#e5e7eb;"></td>
    </tr>

    <!-- Footer -->
    <tr>
        <td style="padding:20px 32px; text-align:center; font-size:12px; color:#6b7280;">
            © {{ date('Y') }} Contract Management System <br>
            This is an automated notification. Please do not reply to this email.
        </td>
    </tr>

</table>
<!-- End Container -->

</td>
</tr>
</table>

</body>
</html>
