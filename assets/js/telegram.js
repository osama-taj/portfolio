// ===== TELEGRAM BOT — set your credentials here =====
const TELEGRAM_TOKEN = '7324240677:AAHh6n_z3DIq8tTgxiT1Yy_5YXEncj8j3Cs';  // from @BotFather
const TELEGRAM_CHAT  = '739853517';    // your chat/group ID

async function sendToTelegram(name, email, message) {
  const text = `📩 *New Portfolio Message*\n\n👤 *Name:* ${name}\n📧 *Email:* ${email}\n💬 *Message:*\n${message}`;
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT, text, parse_mode: 'Markdown' })
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name  = document.getElementById('f-name').value.trim();
    const email = document.getElementById('f-email').value.trim();
    const msg   = document.getElementById('f-msg').value.trim();
    if (!name || !email || !msg) return;

    const btn = document.getElementById('f-submit');
    const ok  = document.getElementById('f-ok');
    const err = document.getElementById('f-err');

    btn.disabled = true;
    btn.style.opacity = '.6';
    const span = btn.querySelector('span');
    if (span) span.textContent = '...';
    ok.style.display = 'none';
    err.style.display = 'none';

    try {
      await sendToTelegram(name, email, msg);
      form.reset();
      ok.style.display = 'block';
      ok.textContent = I18n.t('form_ok');
    } catch {
      err.style.display = 'block';
      err.textContent = I18n.t('form_err');
    } finally {
      btn.disabled = false;
      btn.style.opacity = '1';
      if (span) span.textContent = I18n.t('form_send');
    }
  });
});
