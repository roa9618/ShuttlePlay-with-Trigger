# 개발 기준

셔틀플레이는 실제 운영을 목표로 하는 프로젝트입니다. 혼자 개발하더라도 main을 항상 실행 가능한 상태로 두고, 기능 단위로 브랜치를 나눠 작업합니다.

## 로컬 개발 환경

권장 버전:

| 구분 | 버전 |
| --- | --- |
| Node.js | 22.x LTS |
| npm | Node.js 포함 버전 |
| React | 19.x |
| TypeScript | 5.x |
| Vite | 7.x |
| Java | 17 이상 |
| Spring Boot | 3.x |
| Gradle | 8.x |
| MySQL | 8.x |

## 프로젝트 구조

현재 저장소 구조:

```txt
ShuttlePlay-with-Trigger/
├── Backend/
├── Frontend/
├── Docs/
├── README.md
├── .gitignore
├── .gitattributes
└── .editorconfig
```

## 실행

Frontend:

```bash
cd Frontend
npm install
npm run dev
```

Backend:

```bash
cd Backend
./gradlew bootRun
```

Windows에서는 아래 명령을 사용합니다.

```bat
cd Backend
gradlew.bat bootRun
```

## 설정 파일

백엔드는 공통 설정과 환경별 설정을 나눕니다.

| 파일 | Git 포함 | 설명 |
| --- | --- | --- |
| `application.yml` | 포함 | 공통 설정 |
| `application-local.yml` | 제외 | 로컬 DB, 로컬 개발 설정 |
| `application-prod.yml` | 제외 | 운영 설정 |

환경 변수로 모든 값을 빼는 방식은 초기 운영과 로컬 개발을 복잡하게 만들 수 있습니다. 이 프로젝트는 로컬/운영 설정 파일을 분리하고, 민감한 설정 파일은 Git에 올리지 않는 방식을 사용합니다.

## Git 기준

### 기본 원칙

- `main`은 항상 실행 가능한 상태로 유지합니다.
- 기능 개발은 별도 브랜치에서 진행합니다.
- 커밋은 기능 또는 변경 단위로 작게 나눕니다.
- 문서 변경도 코드와 같이 이력을 남깁니다.
- API, DB, 화면, MMR 정책이 바뀌면 관련 문서를 함께 수정합니다.
- 비밀 정보와 환경별 설정 파일은 GitHub에 올리지 않습니다.

### 브랜치

| 브랜치 | 용도 |
| --- | --- |
| `main` | 배포 가능한 안정 버전 |
| `feature/*` | 기능 개발 |
| `fix/*` | 버그 수정 |
| `docs/*` | 문서 작업 |
| `chore/*` | 환경 설정, 빌드 설정, 기타 작업 |
| `refactor/*` | 리팩토링 |
| `release/*` | 배포 준비 |
| `hotfix/*` | 운영 중 긴급 수정 |

1인 개발에서는 아래 정도만 사용해도 충분합니다.

- `feature/*`
- `fix/*`
- `docs/*`
- `chore/*`

예시:

```txt
feature/session-management
feature/attendance-check
feature/matching-engine
feature/mmr-calculation
feature/websocket-sync
fix/match-result-recalculate
docs/api-websocket-spec
chore/mysql-config
```

## 작업 흐름

```bash
git switch main
git pull origin main
git switch -c feature/attendance-check

# 작업

git status
git diff
git add .
git commit -m "[추가] 출석 체크 기능 구현"
git push origin feature/attendance-check
```

중요 기능은 Pull Request를 만들어 병합합니다.

PR에서 확인할 것:

- 변경 범위가 작업 목적과 맞는지
- 로컬에서 실행되는지
- 테스트 또는 빌드가 통과했는지
- API/DB/화면/정책 변경에 맞춰 문서가 수정됐는지
- `.gitignore`에 걸려야 할 파일이 포함되지 않았는지

## 커밋 메시지

형식:

```txt
[카테고리] 작업 내용 요약
```

카테고리:

| 카테고리 | 의미 |
| --- | --- |
| `[추가]` | 새로운 기능 또는 파일 추가 |
| `[수정]` | 기존 기능 수정 |
| `[삭제]` | 불필요한 코드나 파일 삭제 |
| `[문서]` | 문서 작성 또는 수정 |
| `[환경]` | 설정, 빌드, 의존성 변경 |
| `[개선]` | 동작은 유지하면서 구조나 사용성 개선 |
| `[테스트]` | 테스트 추가 또는 수정 |
| `[버그]` | 버그 수정 |

예시:

```txt
[추가] 세션 생성 API 구현
[수정] 경기 결과 수정 시 MMR 재계산 로직 보완
[문서] 자동 매칭 정책 정리
[환경] MySQL 로컬 설정 분리
```

## PR 본문 기준

PR 본문은 길게 꾸미지 않고 확인할 내용이 드러나게 씁니다.

```md
## 작업 내용

- 세션 생성 API 추가
- 세션 생성 시 초대 코드 생성
- 세션 생성 응답에 초대 URL 포함

## 확인 내용

- ./gradlew test
- 세션 생성 API 로컬 호출 확인

## 참고

- Docs/requirements.md의 세션 생성 기준 반영
```

## 코드 작업 기준

### Backend

- Controller에는 요청/응답과 권한 진입점만 둡니다.
- 핵심 로직은 Service 또는 도메인 정책 클래스로 분리합니다.
- 매칭과 MMR 계산 로직은 테스트 가능한 순수 계산 코드로 분리합니다.
- 참가자 상태 변경, 경기 시작, 경기 종료, 결과 입력은 DB 저장 후 WebSocket 이벤트 발행까지 한 흐름으로 봅니다.
- 결과 수정은 기존 값을 덮어쓰기보다 이력을 남기고 재계산할 수 있게 만듭니다.

### Frontend

- 운영자 화면, 참가자 화면, 큰 화면 경기판을 역할 기준으로 나눕니다.
- REST API로 초기 상태를 가져오고, 이후 WebSocket 이벤트로 화면을 갱신합니다.
- WebSocket이 끊기면 재연결하고 REST API로 현재 상태를 다시 맞춥니다.
- 모바일에서 운영자가 버튼을 누르기 쉬워야 합니다.
- 참가자 화면은 다음 경기 여부, 코트 번호, 파트너, 상대가 바로 보여야 합니다.

## 테스트 기준

Frontend:

```bash
cd Frontend
npm run lint
npm run build
```

Backend:

```bash
cd Backend
./gradlew test
```

작업별로 최소한 아래를 확인합니다.

- 빌드가 깨지지 않는지
- 린트가 통과하는지
- 새로 만든 API가 문서와 맞는지
- DB 변경이 있다면 테이블/컬럼/인덱스 기준이 문서와 맞는지
- WebSocket 이벤트가 필요한 상태 변경인지
- 민감한 설정 파일이 Git에 올라가지 않았는지

## 업로드하지 않는 파일

- `application-local.yml`
- `application-prod.yml`
- DB 계정 정보가 들어간 파일
- 운영 서버 접속 정보
- 토큰, 키, 인증서
- 예산, 정산, 계약 관련 문서
- 실제 사용자 개인정보가 들어간 테스트 데이터
