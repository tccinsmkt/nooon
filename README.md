# NOOON 무료 체험 신청 랜딩페이지

TCC INS · NOOON Preview Program 신청 페이지입니다.

---

## 1. 폴더 구조

```
nooon-landing/
├─ index.html          랜딩페이지 (여기만 고치면 됩니다)
├─ assets/
│   ├─ intro.mp4       소개 영상
│   └─ poster.jpg      영상 재생 전 표지 이미지
├─ api/
│   └─ apply.js        신청 폼 접수 · 메일 발송
├─ package.json
├─ vercel.json         캐시 · URL 설정
├─ .env.example        메일 설정 예시
└─ README.md
```

**수정할 일이 있으면 대부분 `index.html` 하나만 열면 됩니다.**
HTML·CSS·JS가 한 파일에 다 들어 있고, 색상은 파일 상단 `:root` 에 모여 있습니다.

---

## 2. 내 컴퓨터에서 미리보기

### 방법 A — 가장 간단 (추천)

VS Code 확장 **Live Server** 설치 후, `index.html` 우클릭 → **Open with Live Server**.
저장할 때마다 브라우저가 자동으로 새로고침됩니다.

> 단, 이 방법으로는 신청 폼 전송이 동작하지 않습니다. 화면만 확인할 때 사용하세요.

### 방법 B — 폼까지 실제로 동작 확인

```bash
npm install -g vercel     # 최초 1회
npm install               # 최초 1회
vercel dev
```

`http://localhost:3000` 에서 폼 전송까지 테스트할 수 있습니다.

---

## 3. GitHub 에 올리기

```bash
cd nooon-landing
git init
git add .
git commit -m "NOOON 무료 체험 신청 랜딩페이지"
git branch -M main
git remote add origin https://github.com/조직명/nooon-landing.git
git push -u origin main
```

> VS Code 왼쪽 **Source Control** 패널에서 버튼만 눌러도 동일하게 됩니다.
> (변경사항 → 메시지 입력 → Commit → Publish Branch)

---

## 4. Vercel 로 배포

1. [vercel.com](https://vercel.com) 가입 (GitHub 계정으로 로그인)
2. **Add New → Project** → 방금 올린 저장소 선택
3. Framework Preset: **Other** (그대로 두면 됩니다)
4. **Deploy** 클릭

1~2분 뒤 `https://nooon-landing.vercel.app` 형태의 주소가 생성됩니다.

**이후로는 GitHub 에 push 할 때마다 자동으로 다시 배포됩니다.**

---

## 5. 신청 메일 설정

폼으로 들어온 신청서를 메일로 받으려면 환경변수를 등록해야 합니다.

**Vercel 대시보드 → 프로젝트 → Settings → Environment Variables**

| Key | 값 | 비고 |
|---|---|---|
| `SMTP_HOST` | 메일 서버 주소 | 메일 관리자에게 문의 |
| `SMTP_PORT` | `465` | 587인 경우도 있음 |
| `SMTP_USER` | `sales@tccins.co.kr` | 보내는 계정 |
| `SMTP_PASS` | 비밀번호 | 앱 비밀번호일 수 있음 |
| `MAIL_TO` | `sales@tccins.co.kr` | 받을 주소, 쉼표로 여러 명 가능 |
| `MAIL_FROM` | `NOOON 신청 <sales@tccins.co.kr>` | 생략 가능 |

등록 후 **Deployments → 최신 배포 → Redeploy** 를 눌러야 적용됩니다.

> **설정 전에도 페이지는 정상 동작합니다.**
> 메일만 안 나갈 뿐, 신청 내용은 Vercel **Logs** 에 기록되니 확인할 수 있습니다.

---

## 6. 회사 도메인 연결

**Vercel → Settings → Domains → Add**

예: `nooon.tccins.co.kr`

안내되는 CNAME 레코드를 도메인 관리처(가비아·후이즈 등)에 등록하면 연결됩니다.
HTTPS 인증서는 Vercel 이 자동으로 발급합니다.

---

## 7. 자주 고치는 부분

`index.html` 을 열고 아래를 찾으면 됩니다.

| 고칠 것 | 찾을 위치 |
|---|---|
| 브랜드 색상 | 파일 상단 `:root` → `--orange`, `--navy-900` |
| 메인 문구 | `<!-- ══════ HERO ══════ -->` |
| 진행 단계 | `<!-- ══════ 진행 프로세스 ══════ -->` |
| 검증 방식 | `<!-- ══════ 검증 방식 ══════ -->` |
| 받는 결과물 | `<!-- ══════ 받는 것 ══════ -->` |
| 자주 묻는 질문 | `<!-- ══════ FAQ ══════ -->` |
| 연락처 | `sales@tccins.co.kr` 로 검색 |

### 화면 이미지 넣기

지금은 회색 박스로 자리만 잡아둔 곳이 세 군데 있습니다.

```html
<div class="shot">인식 결과 화면 삽입 영역</div>
```

이미지를 `assets/` 에 넣고 아래처럼 바꾸면 됩니다.

```html
<div class="shot"><img src="assets/파일명.png" alt="인식 결과 화면" style="width:100%;height:100%;object-fit:cover"></div>
```

---

## 8. 아직 확정되지 않은 항목

페이지 안에 **주황색 점선 표시**가 된 부분은 사내 확정 후 채워야 합니다.

- 신청 후 연락까지의 기간 / 결과 제공 리드타임
- 촬영 자료 저장 위치 · 접근 권한자 · 폐기 시점
- 3D 스캔 데이터 제공 범위 및 형식

확정되면 해당 부분의 `<span class="todo">…</span>` 를 일반 텍스트로 바꾸면 됩니다.

---

## 9. 개인정보처리방침

폼 하단의 `자세히 보기` 링크가 `#privacy` 로 비어 있습니다.
처리방침 페이지 주소가 정해지면 해당 `href` 를 교체해 주십시오.
