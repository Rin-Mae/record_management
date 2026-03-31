<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }

        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #28a745;
        }

        .header h2 {
            color: #28a745;
            margin: 0;
        }

        .content {
            padding: 20px 0;
        }

        .button {
            display: inline-block;
            padding: 10px 30px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }

        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h2>Records Management System</h2>
            <p>Email Verification</p>
        </div>

        <div class="content">
            <p>Hello {{ $user->firstname }} {{ $user->lastname }},</p>

            <p>Thank you for registering with our Records Management System. To complete your email verification, please
                use the following One-Time Password (OTP):</p>

            <div style="text-align: center; margin: 30px 0;">
                <div
                    style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #28a745; font-family: monospace;">
                    {{ $otp }}
                </div>
            </div>

            <p>Enter this OTP in the verification form on the website. This code will expire in 10 minutes.</p>

            <p>If you did not create an account, please ignore this email.</p>

            <p>Best regards,<br>
                Records Management System Team</p>
        </div>

        <div class="footer">
            <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
    </div>
</body>

</html>