const InterviewInvitationTemplate = (interviewName, company, interviewLink, interviewTime) => {
    return `
	<!DOCTYPE html>
	<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Interview Invitation</title>

    <style>
      body {
        background-color: #ffffff;
        font-family: Arial, sans-serif;
        font-size: 16px;
        line-height: 1.4;
        color: #333333;
        margin: 0;
        padding: 0;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
      }

      .logo {
        max-width: 200px;
        margin-bottom: 20px;
      }

      .message {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
      }

      .body {
        font-size: 16px;
        margin-bottom: 20px;
      }

      .cta {
        display: inline-block;
        padding: 10px 20px;
        background-color: #ffd60a;
        color: #000000;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        font-weight: bold;
        margin-top: 20px;
      }

      .support {
        font-size: 14px;
        color: #999999;
        margin-top: 20px;
      }

      .highlight {
        font-weight: bold;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <!-- Header -->
      <div>
        <a href="https://glamis.in/">
          <img class="logo" src="https://www.gla.ac.in/info/common/images/mobilelogo.png" alt="GLAMIS-Logo" />
        </a>
      </div>

      <!-- Body -->
      <div class="body">
        <p class="message">Interview Invitation</p>

        <p>Dear User,</p>
        <p>We are pleased to invite you to participate in a mock interview of ${interviewName} for ${company} as part of your drive process with GLA University. Your interview is scheduled for:</p>
        <h2 class="highlight">${interviewTime}</h2>
        <p>To join the interview, please click on the following link:</p>
        <a class="cta" href="${interviewLink}">Join Interview</a>
        <p>Please ensure that you are available at the scheduled time and that you have a stable internet connection. We look forward to speaking with you and learning more about your qualifications.</p>
      </div>

      <!-- Footer -->
      <div class="support">
        <p>If you have any questions or need to reschedule, please contact us at <a href="mailto:anikr262@gmail.com">anikr262@gmail.com</a>. We are here to assist you!</p>
      </div>
    </div>
  </body>
</html>
	`}

export default InterviewInvitationTemplate;
