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
│   └─ apply.js        신청 폼 접수 · 사내 메일 API 전달
├─ package.json
├─ vercel.json         캐시 · URL 설정
├─ .env.example        환경변수 예시 (모두 선택 사항)
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

## 5. 신청 메일 발송

**별도 설정이 필요 없습니다.** 배포만 하면 바로 동작합니다.

접수된 신청서는 **사내 메일 API(insbox)** 를 통해 `sales@tccins.co.kr` 로 발송됩니다.
TCC INS 홈페이지(`tccins/hp`)의 문의 폼과 동일한 경로입니다.

```
폼 제출 → /api/apply → https://insbox-api.tccins.co.kr/api/mail/add → sales@tccins.co.kr
```

SMTP 계정 · 앱 비밀번호 · 환경변수가 **일절 필요하지 않습니다.**
발송 경로가 회사 인프라 안에서 끝나므로 담당자가 바뀌어도 영향이 없습니다.

### 받는 주소를 바꾸려면

Vercel → Settings → Environment Variables 에 아래를 등록하고 **Redeploy** 합니다. (선택 사항)

| Key | 기본값 | 설명 |
|---|---|---|
| `MAIL_TO` | `sales@tccins.co.kr` | 받을 주소. 쉼표로 여러 명 지정 가능 |
| `MAIL_DOMAIN` | `tccsteel.com` | 사내 메일 API 의 domain 파라미터 |

### 발송에 실패하면

신청자 화면에 **전화 · 이메일 안내가 표시됩니다.**
실패를 성공으로 표시하면 신청이 조용히 유실되므로, 의도적으로 오류를 드러냅니다.
원인은 Vercel **Logs** 에서 `[NOOON] 메일` 로 검색하면 확인할 수 있습니다.
신청 내용 자체는 실패 여부와 무관하게 `[NOOON 신청]` 으로 로그에 남습니다.

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
