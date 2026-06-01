# 아키텍처

셔틀플레이는 반응형 웹과 Spring Boot 서버로 구성합니다. 사용자는 웹으로 바로 접속하고, 운동 중 상태 변화는 WebSocket으로 동기화합니다.

## 전체 구조

```txt
Frontend
  React + TypeScript + Vite
  운영자 화면 / 참가자 화면 / 큰 화면 경기판
  REST API Client
  WebSocket Client
  PWA

Backend
  Spring Boot
  REST API
  WebSocket
  Spring Security
  JPA
  Matching Engine
  MMR Calculator

Database
  MySQL
  사용자, 모임, 세션, 참가자, 경기, 결과, MMR 이력 저장
```

## 기술 스택

### Frontend

| 구분 | 기술 |
| --- | --- |
| Language | TypeScript |
| Library | React |
| Build Tool | Vite |
| Routing | React Router |
| HTTP Client | Axios 또는 Fetch 기반 클라이언트 |
| Realtime | WebSocket Client 또는 STOMP Client |
| PWA | Service Worker, Web App Manifest |
| Package Manager | npm |

Frontend는 운영자 대시보드, 참가자 현황, 큰 화면 경기판처럼 역할이 다른 화면을 컴포넌트 단위로 나누기 위해 React를 사용합니다. 참가자 상태, 경기 후보 큐, MMR 계산 결과처럼 구조가 복잡한 데이터는 TypeScript 타입으로 관리합니다.

### Backend

| 구분 | 기술 |
| --- | --- |
| Language | Java 17 이상 |
| Framework | Spring Boot 3.x |
| API | REST API |
| Realtime | Spring WebSocket |
| ORM | Spring Data JPA |
| Security | Spring Security |
| Validation | Bean Validation |
| Documentation | Swagger / OpenAPI |
| Build Tool | Gradle |
| Test | JUnit |

Backend는 단순 CRUD보다 자동 매칭, 경기 후보 큐, MMR 계산, 결과 수정 재계산, 실시간 이벤트 발행이 중요합니다. 이 로직은 Controller에 두지 않고 도메인 서비스와 정책 클래스로 분리합니다.

### Database

| 구분 | 기술 |
| --- | --- |
| Database | MySQL 8.x |
| ORM | JPA |
| Migration | 추후 Flyway 또는 Liquibase 검토 |

사용자, 모임, 세션, 참가자, 경기, 팀, 경기 결과, MMR 이력은 관계가 명확하므로 MySQL을 사용합니다. 기록과 이력 데이터는 운영 중 의미가 크기 때문에 물리 삭제보다 소프트 삭제를 우선합니다.

## 패키지 기준

백엔드 기본 패키지는 `com.shuttleplay.server`입니다.

초기 구조는 다음 기준으로 확장합니다.

```txt
com.shuttleplay.server
├── domain
│   ├── user
│   ├── group
│   ├── session
│   ├── participant
│   ├── attendance
│   ├── matching
│   ├── match
│   ├── mmr
│   ├── record
│   └── notification
└── global
    ├── config
    ├── error
    ├── security
    ├── response
    └── websocket
```

처음부터 모든 패키지를 만들 필요는 없습니다. 기능을 구현할 때 필요한 패키지만 추가합니다.

## 주요 도메인

| 도메인 | 역할 |
| --- | --- |
| User | 회원 사용자 |
| Group | 고정 배드민턴 모임 |
| GroupMember | 모임에 소속된 회원 또는 고정 멤버 |
| Session | 특정 날짜에 진행되는 운동 세션 |
| Participant | 특정 세션에 참여하는 참가자 |
| Attendance | 출석, 지각, 불참 정보 |
| MatchQueue | 자동 매칭으로 생성된 경기 후보 |
| MatchQueuePlayer | 경기 후보에 포함된 참가자 |
| Match | 실제 진행된 경기 |
| MatchTeam | 경기 내 A팀/B팀 |
| MatchPlayer | 경기 팀에 속한 참가자 |
| MatchResult | 경기 결과 |
| MmrHistory | MMR 변화 이력 |
| DailyRecord | 일자별 개인 운동 기록 |
| MonthlyRecord | 월별 개인 운동 기록 |
| PlayerMemo | 운영자 메모 |
| Notification | 알림 이력 |
| WebSocketEventLog | 실시간 이벤트 로그 |

## 관계 개요

```txt
User 1:N GroupMember
Group 1:N GroupMember
Group 1:N Session
Session 1:N Participant
Session 1:N Attendance
Session 1:N MatchQueue
Session 1:N Match
Participant 1:1 Attendance
Participant 1:N MatchPlayer
Participant 1:N MmrHistory
Participant 1:N DailyRecord
MatchQueue 1:N MatchQueuePlayer
Match 1:2 MatchTeam
MatchTeam 1:2 MatchPlayer
Match 1:1 MatchResult
User 1:N PlayerMemo
User 1:N Notification
```

## 데이터 설계 기준

### 공통 컬럼

주요 테이블은 아래 컬럼을 기본으로 둡니다.

| 컬럼 | 설명 |
| --- | --- |
| `id` | 기본키 |
| `created_at` | 생성 시각 |
| `updated_at` | 수정 시각 |
| `deleted_at` | 소프트 삭제 시각 |
| `is_deleted` | 삭제 여부 |

경기 결과, MMR 이력, 개인 기록처럼 과거 의미가 중요한 데이터는 삭제하지 않고 이력으로 남깁니다.

### 핵심 테이블

베타 단계에서 우선 구현할 테이블:

- `users`
- `groups`
- `group_members`
- `sessions`
- `participants`
- `attendances`
- `match_queues`
- `match_queue_players`
- `matches`
- `match_teams`
- `match_players`
- `match_results`
- `mmr_histories`
- `daily_records`
- `notifications`

베타 이후 구현하거나 고도화할 테이블:

- `match_result_histories`
- `monthly_records`
- `player_memos`
- `websocket_event_logs`

## 테이블별 핵심 기준

### `users`

회원 사용자를 저장합니다. 비회원 참가자는 `users`에 저장하지 않고 `participants`에 저장합니다.

주요 컬럼:

- `email`
- `password`
- `name`
- `gender`
- `age_group`
- `grade`
- `doubles_mmr`
- `mixed_mmr`
- `role`
- `status`

제약:

- `email`은 중복될 수 없습니다.
- `gender`, `grade`, `role`, `status`는 허용된 값만 저장합니다.
- 회원가입 시 급수 기준으로 복식 MMR과 혼복 MMR 초기값을 설정합니다.

### `groups`

고정 배드민턴 모임 정보를 저장합니다.

주요 컬럼:

- `owner_id`
- `name`
- `location`
- `default_court_count`
- `default_start_time`
- `default_end_time`
- `description`
- `status`

### `sessions`

특정 날짜에 실제로 진행되는 운동 세션입니다.

주요 컬럼:

- `group_id`
- `title`
- `session_date`
- `start_time`
- `end_time`
- `actual_end_time`
- `court_count`
- `session_type`
- `default_match_type`
- `default_play_style`
- `status`
- `invite_code`
- `created_by`

세션 상태:

- `CREATED`
- `ATTENDANCE_OPEN`
- `IN_PROGRESS`
- `CLOSED`

### `participants`

세션에 참여하는 참가자입니다. 회원 참가자와 비회원 참가자를 모두 여기에서 다룹니다.

주요 컬럼:

- `session_id`
- `user_id`
- `participant_type`
- `display_name`
- `gender`
- `age_group`
- `grade`
- `doubles_mmr_snapshot`
- `mixed_mmr_snapshot`
- `current_doubles_mmr`
- `current_mixed_mmr`
- `status`
- `total_match_count`
- `win_count`
- `lose_count`
- `consecutive_play_count`
- `consecutive_rest_count`

세션 중 빠른 매칭 계산을 위해 시작 기준 MMR snapshot과 현재 MMR을 함께 저장합니다. 회원이라도 세션 당시의 급수와 MMR을 저장해 과거 기록의 의미가 바뀌지 않도록 합니다.

### `match_queues`

자동 매칭으로 생성된 경기 후보입니다. 실제 경기가 아니라 코트에 올라가기 전 대기 후보입니다.

주요 컬럼:

- `session_id`
- `queue_order`
- `match_type`
- `play_style`
- `status`
- `score`
- `explanation`
- `assigned_court_number`

### `matches`

실제 진행된 경기입니다.

주요 컬럼:

- `session_id`
- `match_queue_id`
- `court_number`
- `match_type`
- `play_style`
- `status`
- `started_at`
- `ended_at`

운영자가 수동으로 만든 경기는 `match_queue_id`가 없을 수 있습니다.

### `match_players`

경기에 참여한 개별 참가자의 당시 상태를 저장합니다.

주요 컬럼:

- `match_id`
- `match_team_id`
- `participant_id`
- `used_mmr_type`
- `mmr_before`
- `mmr_after`
- `mmr_delta`

경기 당시의 MMR을 저장해야 결과 수정과 이력 추적이 가능합니다.

### `mmr_histories`

MMR 계산의 근거를 저장합니다.

저장해야 하는 값:

- MMR 타입
- 경기 전 MMR
- 경기 후 MMR
- 변동값
- K 값
- 예상 승률
- 점수 차 보정값
- 하한선 적용 여부
- 소프트 캡 적용 여부
- 변경 사유

## 인덱스 기준

| 테이블 | 인덱스 | 목적 |
| --- | --- | --- |
| `users` | `email` | 로그인 조회 |
| `sessions` | `group_id`, `session_date` | 모임별 세션 조회 |
| `participants` | `session_id` | 세션 참가자 조회 |
| `participants` | `session_id`, `status` | 상태별 참가자 조회 |
| `match_queues` | `session_id`, `status`, `queue_order` | 경기 후보 큐 조회 |
| `matches` | `session_id`, `status` | 세션 경기 조회 |
| `match_players` | `participant_id` | 참가자 경기 이력 조회 |
| `match_results` | `match_id` | 경기 결과 조회 |
| `mmr_histories` | `participant_id`, `created_at` | 참가자 MMR 이력 조회 |

## 실시간 동기화 기준

상태 변경의 기본 흐름은 아래와 같습니다.

```txt
클라이언트가 REST API 요청
→ 서버에서 상태 변경
→ DB 저장
→ WebSocket 이벤트 발행
→ 운영자 화면 / 참가자 화면 / 큰 화면 경기판 갱신
```

WebSocket은 현재 상태의 원본이 아닙니다. 화면이 처음 열릴 때는 REST API로 현재 상태를 조회하고, 이후 변경분을 WebSocket으로 반영합니다.

## 환경 설정 기준

백엔드 설정 파일은 공통 설정과 로컬/운영 설정을 분리합니다.

- `application.yml`: 공통 설정. Git에 포함합니다.
- `application-local.yml`: 로컬 DB와 개발용 설정. Git에 올리지 않습니다.
- `application-prod.yml`: 운영 설정. Git에 올리지 않습니다.

로컬/운영 설정에는 DB 접속 정보가 들어갈 수 있으므로 `.gitignore`에 포함합니다.
