/**
 * Minimal branded HTML email template.
 * Same visual identity as landing page: warm paper background, Georgia headings,
 * burnt sienna accent. Works in all major email clients without external CSS.
 */

function renderEmail({ preheader = '', body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>eskp.in</title>
</head>
<body style="margin:0;padding:0;background:#F9F6F0;font-family:Georgia,'Times New Roman',serif;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;color:#F9F6F0;">
    ${preheader}&nbsp;
  </div>

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F9F6F0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;border-bottom:1px solid #E8E0D8;">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:normal;color:#2A2A2A;letter-spacing:-0.02em;">
                esk<span style="color:#C4622D;">p</span>.in
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 0;font-family:system-ui,-apple-system,sans-serif;font-size:16px;line-height:1.65;color:#2A2A2A;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #E8E0D8;padding-top:20px;font-family:system-ui,-apple-system,sans-serif;font-size:12px;color:#7A6E68;line-height:1.6;">
              eskp.in &mdash; a small platform for real help<br>
              Reply to this email if you have questions or if we've got anything wrong.<br>
              <a href="https://eskp.in/support.html" style="color:#7A6E68;">Support resources</a> &mdash; specialist services if you need help right now.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * Convert a plain-text email body to simple HTML paragraphs.
 * Preserves bullet points (• lines → styled list items).
 */
function textToHtml(text) {
  const lines = text.split('\n');
  const html = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      if (!inList) { html.push('<ul style="margin:12px 0 12px 20px;padding:0;color:#2A2A2A;">'); inList = true; }
      html.push(`<li style="margin-bottom:6px;">${escHtml(trimmed.replace(/^[•\-]\s*/, ''))}</li>`);
    } else {
      if (inList) { html.push('</ul>'); inList = false; }
      if (trimmed === '') {
        html.push('<br>');
      } else {
        html.push(`<p style="margin:0 0 14px;">${escHtml(trimmed)}</p>`);
      }
    }
  }
  if (inList) html.push('</ul>');
  return html.join('\n');
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

module.exports = { renderEmail, textToHtml, escHtml };
