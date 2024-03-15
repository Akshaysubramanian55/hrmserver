exports.setpassword = function (name, email, randompassword) {

    return new Promise(async (resolve, reject) => {
      try{

        let template = `

       
        <html lang="en" style="box-sizing: border-box;">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Notification</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    background-color: #f8f9fa;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    color:#
                }
                .header h2 {
                    color: #333333;
                }
                .content {
                    color: #666666;
                    line-height: 1.6;
                }
                label{
                    color:#E5330F
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #999999;
                }
                .footer p {
                    margin: 5px 0;
                }
                .password {
                    font-weight: bold;
                    color: #007bff;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Password Notification</h2>
                </div>
                <div class="content">
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>Your email :<strong>${email}</p>
                    <p>Your password has been successfully set. Below is your new password:</p>
                    <p class="password"><label>${randompassword}</label></p>
                    <p>Please keep this password secure and do not share it with anyone.</p>
                    
                </div>
                <div class="footer">
                    <p>Best regards,</p>
                    <p>The Team</p>
                </div>
            </div>
        </body>
        </html>
        
        `;
        resolve(template);
      }

       
      
      catch (error) {
        //console.log(error);
        reject(error);
      }
    })
  };