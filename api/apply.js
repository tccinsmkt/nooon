// ────────────────────────────────────────────────────────────────
//  NOOON 현장 무료체험 신청 접수 — Vercel Serverless Function
//  POST /api/apply
//
//  동작
//   1. 입력값 검증 (개인정보 동의 · 필수 항목 · 이메일 형식 · 스팸 차단)
//   2. 사내 메일 API(insbox)로 접수 내용 전달 → sales@tccins.co.kr
//   3. 서버 로그 기록 (Vercel 대시보드 > Logs 에서 확인 가능)
//
//  요청 본문 (JSON) — 랜딩 index.html 하단 <script> 의 collect() 가 만든다
//   {
//     company: string,   // 회사명    #company
//     name:    string,   // 담당자명  #name
//     phone:   string,   // 연락처    #phone
//     email:   string,   // 이메일    #email
//     agree:   boolean,  // 개인정보 수집·이용 동의 #agreeChk
//     website: string    // 스팸 방지 숨김 필드 — 사람은 항상 빈 값
//   }
//
//  응답
//   200 { ok: true, mailed: true }   접수 완료 → 화면이 완료 안내로 바뀐다
//   400 { message }                  입력값 오류 → message 를 화면에 그대로 표시
//   502 { ok: false, message }       메일 발송 실패 → message 를 화면에 그대로 표시
//
//  [SMTP 미사용]
//  TCC INS 홈페이지(hp 프로젝트)와 동일하게 사내 메일 API를 사용한다.
//  SMTP 계정 · 앱 비밀번호 · 환경변수가 일절 필요 없으며,
//  발송 경로가 회사 인프라 안에서 끝난다.
//  참고 구현: hp/src/app/contact/page.tsx, hp/src/app/contact/mail-builder.ts
//
//  발송 실패 시에는 200이 아니라 502를 돌려준다.
//  (실패를 성공으로 표시하면 신청이 조용히 유실된다)
//
//  [관리대장 연동 — 추후]
//  신청 정보 저장 · 관리대장 자동 기록은 이 함수에 추가한다.
//  검증을 통과한 신청 값은 아래 `data` 객체에 모여 있다.
// ────────────────────────────────────────────────────────────────

const MAIL_API = 'https://insbox-api.tccins.co.kr/api/mail/add';
const MAIL_DOMAIN = process.env.MAIL_DOMAIN || 'tccsteel.com';
const MAIL_TO = (process.env.MAIL_TO || 'sales@tccins.co.kr')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// 신청 항목은 모두 필수
const REQUIRED = ['company', 'name', 'phone', 'email'];

const LABELS = {
  company: '회사명',
  name: '담당자명',
  phone: '연락처',
  email: '이메일',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esc(v = '') {
  return String(v).replace(
    /[<>&"']/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c])
  );
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

  // 신청 값 — 앞뒤 공백 제거
  const data = {
    company: String(body.company || '').trim(),
    name: String(body.name || '').trim(),
    phone: String(body.phone || '').trim(),
    email: String(body.email || '').trim(),
  };

  // 필수 항목
  const missing = REQUIRED.filter((k) => !data[k]);
  if (missing.length) {
    return res.status(400).json({
      message: `${missing.map((k) => LABELS[k]).join(', ')}을(를) 입력해 주십시오.`,
    });
  }

  // 이메일 형식
  if (!EMAIL_RE.test(data.email)) {
    return res.status(400).json({ message: '이메일 주소를 다시 확인해 주십시오.' });
  }

  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  // 메일 본문 — insbox API는 HTML 문자열을 그대로 받는다
  const lines = ['NOOON 현장 무료체험 신청이 접수되었습니다.', ''];

  lines.push('[신청 정보]');
  lines.push(`회사명: ${esc(data.company)}`);
  lines.push(`담당자명: ${esc(data.name)}`);
  lines.push(`연락처: ${esc(data.phone)}`);
  lines.push(`이메일: ${esc(data.email)}`);
  lines.push('');

  lines.push('[접수 정보]');
  lines.push(`접수 일시: ${now} (KST)`);
  lines.push('개인정보 동의: 동의함');
  lines.push('유입 경로: NOOON 현장 무료체험 랜딩페이지');

  const contents = lines.map((l) => l.replace(/\n/g, '<br>')).join('<br>');

  // 서버 로그 — Vercel Logs 에서 확인 가능
  console.log('[NOOON 신청]', JSON.stringify({ at: now, ...data, agree: true }));

  const payload = {
    domain: MAIL_DOMAIN,
    title: `[NOOON 현장 무료체험 신청] ${data.company} · ${data.name}`,
    contents,
    sendEmail: '',
    toReceivers: MAIL_TO,
  };

  try {
    const form = new FormData();
    form.append('item', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    const r = await fetch(MAIL_API, { method: 'POST', body: form });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error('[NOOON] 메일 API 응답 오류:', r.status, detail.slice(0, 500));
      return res.status(502).json({
        ok: false,
        message: '접수 처리 중 오류가 발생했습니다.<br>sales@tccins.co.kr 또는 02-2639-1756으로 연락 주십시오.',
      });
    }

    return res.status(200).json({ ok: true, mailed: true });
  } catch (err) {
    console.error('[NOOON] 메일 발송 실패:', err);
    return res.status(502).json({
      ok: false,
      message: '접수 처리 중 오류가 발생했습니다.<br>sales@tccins.co.kr 또는 02-2639-1756으로 연락 주십시오.',
    });
  }
}
