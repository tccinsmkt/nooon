// ────────────────────────────────────────────────────────────────
//  NOOON 무료 신청 접수 — Vercel Serverless Function
//  POST /api/apply
//
//  동작
//   1. 입력값 검증 (필수 항목 · 스팸 차단)
//   2. 담당자에게 접수 메일 발송 (SMTP)
//   3. 서버 로그 기록 (Vercel 대시보드 > Logs 에서 확인 가능)
//
//  환경변수는 .env.example 참고. 미설정 시에도 500 대신 로그만 남기고
//  정상 응답하도록 되어 있어, 메일 설정 전에도 폼 테스트가 가능합니다.
// ────────────────────────────────────────────────────────────────

const REQUIRED = ['company', 'name', 'phone'];

const LABELS = {
  company: '회사명',
  name: '담당자명',
  phone: '연락처',
  email: '이메일',
  msg: '기타',
};

function esc(v = '') {
  return String(v).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

  // 스팸 차단 — 사람에게 보이지 않는 필드가 채워져 있으면 봇
  if (body.website) {
    return res.status(200).json({ ok: true });
  }

  // 개인정보 동의
  if (!body.agree) {
    return res.status(400).json({ message: '개인정보 수집·이용에 동의해 주십시오.' });
  }

  // 필수 항목
  const missing = REQUIRED.filter((k) => !String(body[k] || '').trim());
  if (missing.length) {
    return res.status(400).json({
      message: `${missing.map((k) => LABELS[k]).join(', ')}을(를) 입력해 주십시오.`,
    });
  }

  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  const rows = ['company', 'name', 'phone', 'email', 'msg']
    .map((k) => {
      const v = String(body[k] || '').trim();
      if (!v) return '';
      return `<tr>
        <th style="text-align:left;padding:10px 14px;background:#F5F7F9;border:1px solid #DFE4EA;white-space:nowrap;vertical-align:top">${LABELS[k]}</th>
        <td style="padding:10px 14px;border:1px solid #DFE4EA;white-space:pre-wrap">${esc(v)}</td>
      </tr>`;
    })
    .join('');

  const html = `
  <div style="font-family:-apple-system,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#16202B">
    <h2 style="font-size:18px;margin:0 0 4px">NOOON 무료 신청 접수</h2>
    <p style="color:#7A8798;font-size:13px;margin:0 0 16px">${now}</p>
    <table style="border-collapse:collapse;font-size:14px;width:100%;max-width:640px">${rows}</table>
  </div>`;

  // 서버 로그 — 메일 설정 전에도 Vercel Logs 에서 확인 가능
  console.log('[NOOON 신청]', JSON.stringify({ at: now, ...body, website: undefined }));

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO, MAIL_FROM } = process.env;

  // 받는 주소 — 환경변수 미지정 시 영업 대표 주소로 발송
  const TO = MAIL_TO || 'sales@tccins.co.kr';

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    // 메일 환경변수 미설정 — 접수는 성공 처리하고 로그만 남김
    console.warn('[NOOON] SMTP 환경변수 미설정 — 메일을 보내지 않았습니다.');
    return res.status(200).json({ ok: true, mailed: false });
  }

  try {
    const nodemailer = (await import('nodemailer')).default;
    const port = Number(SMTP_PORT || 465);

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: MAIL_FROM || SMTP_USER,
      to: TO,
      replyTo: body.email || undefined,
      subject: `[NOOON 무료 신청] ${body.company} · ${body.name}`,
      html,
    });

    return res.status(200).json({ ok: true, mailed: true });
  } catch (err) {
    console.error('[NOOON] 메일 발송 실패:', err);
    // 고객에게는 접수 실패로 보이지 않게 — 로그에는 남아 있음
    return res.status(200).json({ ok: true, mailed: false });
  }
}
