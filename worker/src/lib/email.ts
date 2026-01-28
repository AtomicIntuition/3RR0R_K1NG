import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

interface ScoreDropAlertParams {
  to: string;
  siteName: string;
  siteUrl: string;
  oldScore: number;
  newScore: number;
  newGrade: string;
  scanId: string;
}

export async function sendScoreDropAlert({
  to,
  siteName,
  siteUrl,
  oldScore,
  newScore,
  newGrade,
  scanId,
}: ScoreDropAlertParams): Promise<boolean> {
  try {
    const resend = getResendClient();
    const scoreDrop = oldScore - newScore;
    const appUrl = process.env.APP_URL || 'https://3rror.dev';

    const { error } = await resend.emails.send({
      from: '3RROR_K1NG <alerts@3rror.dev>',
      to: [to],
      subject: `Score Drop Alert: ${siteName || siteUrl} dropped ${scoreDrop} points`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 12px; border: 1px solid #222222;">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; border-bottom: 1px solid #222222;">
              <h1 style="margin: 0; color: #00ff88; font-size: 24px; font-weight: bold;">
                3RROR_K1NG
              </h1>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="padding: 30px 40px; background-color: #1a0a0a; border-bottom: 1px solid #222222;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; color: #ff4444; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                      Score Drop Detected
                    </p>
                    <h2 style="margin: 0; color: #ffffff; font-size: 28px;">
                      ${siteName || siteUrl}
                    </h2>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Score Comparison -->
          <tr>
            <td style="padding: 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="45%" align="center" style="padding: 20px; background-color: #1a1a1a; border-radius: 8px;">
                    <p style="margin: 0 0 5px 0; color: #666666; font-size: 12px; text-transform: uppercase;">Previous</p>
                    <p style="margin: 0; color: #888888; font-size: 48px; font-weight: bold;">${oldScore}</p>
                  </td>
                  <td width="10%" align="center">
                    <span style="color: #ff4444; font-size: 24px;">→</span>
                  </td>
                  <td width="45%" align="center" style="padding: 20px; background-color: #1a0a0a; border-radius: 8px; border: 1px solid #ff4444;">
                    <p style="margin: 0 0 5px 0; color: #666666; font-size: 12px; text-transform: uppercase;">Current</p>
                    <p style="margin: 0; color: #ff4444; font-size: 48px; font-weight: bold;">${newScore}</p>
                    <p style="margin: 5px 0 0 0; color: #ff4444; font-size: 14px;">Grade: ${newGrade}</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; color: #ff4444; font-size: 20px; text-align: center; font-weight: bold;">
                ↓ ${scoreDrop} point drop
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/scan/${scanId}"
                       style="display: inline-block; padding: 16px 32px; background-color: #00ff88; color: #0a0a0a; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 8px;">
                      View Full Report
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid #222222;">
              <p style="margin: 0; color: #666666; font-size: 12px; text-align: center;">
                You're receiving this because you have monitoring enabled for this site.
                <br>
                <a href="${appUrl}/dashboard" style="color: #00ff88; text-decoration: none;">Manage your monitored sites</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      text: `Score Drop Alert for ${siteName || siteUrl}

Your site's score dropped from ${oldScore} to ${newScore} (${newGrade}) - a ${scoreDrop} point drop.

View the full report: ${appUrl}/scan/${scanId}

---
You're receiving this because you have monitoring enabled for this site.
Manage your monitored sites: ${appUrl}/dashboard
`,
    });

    if (error) {
      console.error('Failed to send score drop alert:', error);
      return false;
    }

    console.log(`Score drop alert sent to ${to} for ${siteUrl}`);
    return true;
  } catch (error) {
    console.error('Error sending score drop alert:', error);
    return false;
  }
}
