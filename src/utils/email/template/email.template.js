export const emailVerification =  async ({otp , title=`confirm Email`} = {}) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>OTP Verification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #e0f7f9;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .container {
      max-width: 600px;
      margin: 50px auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
      padding: 40px 30px;
      text-align: center;
    }

    h1 {
      color: #003366;
      font-size: 26px;
      margin-bottom: 10px;
    }

    p {
      color: #444;
      font-size: 16px;
      margin-bottom: 25px;
    }

    h2 {
      font-size: 32px;
      font-weight: bold;
      color: #007acc;
      letter-spacing: 8px;
      background-color: #f0faff;
      display: inline-block;
      padding: 15px 25px;
      border: 2px dashed #007acc;
      border-radius: 10px;
      margin-bottom: 30px;
    }

    .footer {
      font-size: 13px;
      color: #888;
      margin-top: 30px;
    }

    @media (max-width: 600px) {
      .container {
        margin: 20px;
        padding: 25px 15px;
      }

      h2 {
        font-size: 28px;
        letter-spacing: 6px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p>Please use the following OTP to complete your verification process:</p>

    <h2>${otp}</h2>

    <p>This code is valid for 2 minutes. Do not share it with anyone.</p>

    <div class="footer">
      &copy; 2025 my Company. All rights reserved.
    </div>
  </div>
</body>
</html>

`
    
}