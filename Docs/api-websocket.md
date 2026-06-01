# API & WebSocket

셔틀플레이는 REST API와 WebSocket을 함께 사용합니다.

REST API는 조회, 생성, 수정, 삭제 요청을 처리합니다. WebSocket은 상태 변경 결과를 운영자 화면, 참가자 화면, 큰 화면 경기판에 실시간으로 전달합니다.

## 설계 원칙

1. 최초 화면 진입 시 REST API로 현재 상태를 조회합니다.
2. 상태 변경은 REST API 요청으로 처리합니다.
3. 상태 변경이 끝나면 서버가 WebSocket 이벤트를 발행합니다.
4. WebSocket 이벤트는 화면 동기화용입니다. 데이터 원본은 서버와 DB입니다.
5. WebSocket 연결이 끊기면 재연결 후 REST API로 최신 상태를 다시 조회합니다.
6. 운영자 권한이 필요한 API는 반드시 권한을 검증합니다.
7. 비회원 참가자는 세션 참가 토큰으로 해당 세션 범위 안에서만 접근합니다.
8. 참가자 개인 정보와 운영자 메모는 권한에 따라 접근을 제한합니다.

## 기본 정보

### Local

```txt
API: http://localhost:8080/api
WebSocket: ws://localhost:8080/ws
STOMP endpoint: /ws-stomp
```

### Production

운영 URL은 배포 환경이 정해진 뒤 설정합니다. 문서에는 서버 IP, 계정, 인증 정보, 실제 운영 DB 정보는 적지 않습니다.

## 공통 Header

인증이 필요한 API:

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

비회원 세션 접근 API:

```http
X-Session-Token: {sessionParticipantToken}
Content-Type: application/json
```

## 공통 응답

성공:

```json
{
  "success": true,
  "message": "요청이 처리되었습니다.",
  "data": {}
}
```

실패:

```json
{
  "success": false,
  "message": "요청 처리 중 오류가 발생했습니다.",
  "error": {
    "code": "ERROR_CODE",
    "detail": "상세 오류 메시지"
  }
}
```

## 공통 에러 코드

| 코드 | 설명 |
| --- | --- |
| `INVALID_REQUEST` | 요청값이 올바르지 않음 |
| `UNAUTHORIZED` | 인증 필요 |
| `FORBIDDEN` | 접근 권한 없음 |
| `NOT_FOUND` | 리소스를 찾을 수 없음 |
| `CONFLICT` | 중복 또는 충돌 발생 |
| `SESSION_CLOSED` | 종료된 세션 |
| `PARTICIPANT_NOT_AVAILABLE` | 참가자가 경기 가능 상태가 아님 |
| `MATCH_ALREADY_STARTED` | 이미 시작된 경기 |
| `RESULT_ALREADY_ENTERED` | 이미 결과가 입력된 경기 |
| `WEBSOCKET_CONNECTION_FAILED` | WebSocket 연결 실패 |
| `INTERNAL_SERVER_ERROR` | 서버 내부 오류 |

## 인증 API

| Method | Path | 설명 | 우선순위 |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | 회원가입 | P1 |
| `POST` | `/auth/login` | 로그인 | P0 |
| `GET` | `/users/me` | 내 정보 조회 | P1 |

회원가입 요청:

```json
{
  "email": "user@example.com",
  "password": "password1234",
  "name": "홍길동",
  "gender": "MALE",
  "ageGroup": "TWENTIES",
  "grade": "D"
}
```

회원가입 응답:

```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "grade": "D",
    "doublesMmr": 950,
    "mixedMmr": 950
  }
}
```

## 모임 API

| Method | Path | 설명 | 우선순위 |
| --- | --- | --- | --- |
| `POST` | `/groups` | 모임 생성 | P0 |
| `GET` | `/groups` | 내 모임 목록 조회 | P1 |
| `GET` | `/groups/{groupId}` | 모임 상세 조회 | P1 |
| `PATCH` | `/groups/{groupId}` | 모임 정보 수정 | P1 |
| `GET` | `/groups/{groupId}/members` | 모임 멤버 목록 조회 | P1 |
| `POST` | `/groups/{groupId}/members` | 모임 멤버 추가 | P1 |

모임 생성 요청:

```json
{
  "name": "셔틀플레이 테스트 모임",
  "location": "OO 체육관",
  "defaultCourtCount": 4,
  "defaultStartTime": "19:00",
  "defaultEndTime": "22:00",
  "description": "정기 배드민턴 모임입니다."
}
```

## 세션 API

| Method | Path | 설명 | 우선순위 |
| --- | --- | --- | --- |
| `POST` | `/groups/{groupId}/sessions` | 세션 생성 | P0 |
| `GET` | `/sessions/{sessionId}` | 세션 상세 조회 | P0 |
| `PATCH` | `/sessions/{sessionId}/status` | 세션 상태 변경 | P1 |
| `POST` | `/sessions/{sessionId}/close` | 세션 종료 | P0 |
| `GET` | `/sessions/{sessionId}/summary` | 세션 요약 조회 | P1 |

세션 생성 요청:

```json
{
  "title": "6월 정기모임",
  "sessionDate": "2026-06-15",
  "startTime": "19:00",
  "endTime": "22:00",
  "courtCount": 4,
  "sessionType": "REGULAR",
  "defaultMatchType": "ANY",
  "defaultPlayStyle": "FUN"
}
```

세션 생성 응답:

```json
{
  "success": true,
  "message": "세션이 생성되었습니다.",
  "data": {
    "sessionId": 1,
    "groupId": 1,
    "inviteCode": "ABCD1234",
    "inviteUrl": "https://example.com/sessions/1/join?code=ABCD1234"
  }
}
```

세션 상태 변경 시 발행 이벤트:

- `SESSION_STATUS_UPDATED`

세션 종료 시 발행 이벤트:

- `SESSION_STATUS_UPDATED`
- `REPORT_UPDATED`

## 초대 링크 / QR API

| Method | Path | 설명 | 우선순위 |
| --- | --- | --- | --- |
| `GET` | `/sessions/{sessionId}/invite` | 초대 정보 조회 | P0 |
| `GET` | `/sessions/{sessionId}/invite/qr` | QR 이미지 조회 | P0 |

QR 이미지 응답은 `image/png`입니다.

## 참가자 API

| Method | Path | 설명 | 우선순위 |
| --- | --- | --- | --- |
| `POST` | `/sessions/{sessionId}/participants/member` | 회원 참가 등록 | P1 |
| `POST` | `/sessions/{sessionId}/participants/guest` | 비회원 참가 등록 | P0 |
| `GET` | `/sessions/{sessionId}/participants` | 세션 참가자 목록 조회 | P0 |
| `PATCH` | `/participants/{participantId}/status` | 참가자 상태 변경 | P0 |
| `GET` | `/sessions/{sessionId}/participants/me` | 내 세션 상태 조회 | P0 |

비회원 참가 등록 요청:

```json
{
  "displayName": "홍길동",
  "gender": "MALE",
  "ageGroup": "TWENTIES",
  "grade": "D"
}
```

비회원 참가 등록 응답:

```json
{
  "success": true,
  "message": "비회원 참가자가 등록되었습니다.",
  "data": {
    "participantId": 10,
    "sessionId": 1,
    "displayName": "홍길동",
    "participantType": "GUEST",
    "status": "NOT_ARRIVED",
    "sessionParticipantToken": "guest-session-token"
  }
}
```

참가자 상태 변경 시 발행 이벤트:

- `PARTICIPANT_STATUS_UPDATED`

## 출석 API

| Method | Path | 설명 | 우선순위 |
| --- | --- | --- | --- |
| `POST` | `/participants/{participantId}/attendance/check-in` | 출석 체크 | P0 |
| `POST` | `/participants/{participantId}/attendance/late` | 지각 예정 등록 | P1 |
| `POST` | `/participants/{participantId}/attendance/absent` | 불참 처리 | P1 |

출석 체크 응답:

```json
{
  "success": true,
  "message": "출석 체크가 완료되었습니다.",
  "data": {
    "participantId": 1,
    "attendanceStatus": "ATTENDED",
    "participantStatus": "AVAILABLE",
    "checkedAt": "2026-06-15T18:55:00"
  }
}
```

출석 관련 이벤트:

- `ATTENDANCE_UPDATED`
- `PARTICIPANT_STATUS_UPDATED`

## 자동 매칭 API

| Method | Path | 설명 | 우선순위 |
| --- | --- | --- | --- |
| `POST` | `/sessions/{sessionId}/matching/generate` | 자동 매칭 생성 | P0 |
| `GET` | `/sessions/{sessionId}/match-queues` | 경기 후보 큐 조회 | P0 |
| `PATCH` | `/match-queues/{matchQueueId}` | 경기 후보 수정 | P1 |
| `POST` | `/match-queues/{matchQueueId}/cancel` | 경기 후보 취소 | P1 |

자동 매칭 생성 요청:

```json
{
  "matchType": "ANY",
  "playStyle": "FUN",
  "courtCount": 4,
  "preservedQueueIds": [],
  "excludedParticipantIds": [],
  "forcedParticipantIds": []
}
```

필드 설명:

| 필드 | 설명 |
| --- | --- |
| `matchType` | `MENS_DOUBLES`, `WOMENS_DOUBLES`, `MIXED_DOUBLES`, `ANY` |
| `playStyle` | `FUN`, `COMPETITIVE` |
| `courtCount` | 생성할 최대 경기 수 |
| `preservedQueueIds` | 유지할 기존 경기 후보 |
| `excludedParticipantIds` | 이번 생성에서 제외할 참가자 |
| `forcedParticipantIds` | 가능한 한 포함할 참가자 |

자동 매칭 생성 시 발행 이벤트:

- `MATCH_QUEUE_UPDATED`
- `MATCH_ASSIGNED`
- `NOTIFICATION_SENT`

## 경기 API

| Method | Path | 설명 | 우선순위 |
| --- | --- | --- | --- |
| `POST` | `/match-queues/{matchQueueId}/start` | 경기 시작 | P0 |
| `GET` | `/sessions/{sessionId}/matches` | 경기 목록 조회 | P0 |
| `POST` | `/matches/{matchId}/complete` | 경기 종료 | P0 |
| `POST` | `/matches/{matchId}/result` | 경기 결과 입력 | P0 |
| `PATCH` | `/matches/{matchId}/result` | 경기 결과 수정 | P1 |

경기 시작 요청:

```json
{
  "courtNumber": 2
}
```

경기 결과 입력 요청:

```json
{
  "winnerTeamSide": "A",
  "teamAScore": 25,
  "teamBScore": 18
}
```

경기 결과 입력 응답:

```json
{
  "success": true,
  "message": "경기 결과가 입력되었습니다.",
  "data": {
    "matchId": 10,
    "winnerTeamSide": "A",
    "teamAScore": 25,
    "teamBScore": 18,
    "scoreGap": 7,
    "scoreMultiplier": 1.0,
    "mmrResults": [
      {
        "participantId": 1,
        "displayName": "홍길동",
        "mmrType": "DOUBLES",
        "mmrBefore": 950,
        "mmrAfter": 957,
        "mmrDelta": 7
      }
    ]
  }
}
```

경기 관련 이벤트:

- `MATCH_STARTED`
- `MATCH_COMPLETED`
- `MATCH_RESULT_UPDATED`
- `MMR_UPDATED`
- `REPORT_UPDATED`
- `PARTICIPANT_STATUS_UPDATED`

## MMR API

| Method | Path | 설명 | 우선순위 |
| --- | --- | --- | --- |
| `GET` | `/participants/{participantId}/mmr-histories` | 참가자 MMR 이력 조회 | P1 |
| `GET` | `/users/me/mmr` | 내 MMR 조회 | P1 |
| `GET` | `/mmr/grade-ranges` | 급수별 MMR 기준 조회 | P1 |

## 기록 / 리포트 API

| Method | Path | 설명 | 우선순위 |
| --- | --- | --- | --- |
| `GET` | `/users/me/records/daily` | 내 일자별 기록 조회 | P1 |
| `GET` | `/users/me/records/monthly` | 내 월별 기록 조회 | P2 |
| `GET` | `/sessions/{sessionId}/report` | 세션 리포트 조회 | P0 |

## 알림 API

| Method | Path | 설명 | 우선순위 |
| --- | --- | --- | --- |
| `GET` | `/notifications` | 내 알림 목록 조회 | P2 |
| `PATCH` | `/notifications/{notificationId}/read` | 알림 읽음 처리 | P2 |
| `POST` | `/push-subscriptions` | PWA Push 구독 등록 | P2 |
| `DELETE` | `/push-subscriptions/{subscriptionId}` | PWA Push 구독 해제 | P2 |

## 운영자 메모 API

| Method | Path | 설명 | 우선순위 |
| --- | --- | --- | --- |
| `GET` | `/groups/{groupId}/members/{memberId}/memo` | 참가자 메모 조회 | P2 |
| `POST` | `/groups/{groupId}/members/{memberId}/memo` | 참가자 메모 저장 | P2 |

## WebSocket 채널

| 채널 | 설명 | 대상 |
| --- | --- | --- |
| `/topic/sessions/{sessionId}` | 세션 전체 이벤트 | 운영자, 참가자, 디스플레이 |
| `/topic/sessions/{sessionId}/admin` | 운영자 전용 이벤트 | 운영자 |
| `/topic/sessions/{sessionId}/display` | 큰 화면 경기판 이벤트 | 디스플레이 |
| `/user/queue/notifications` | 개인 알림 | 특정 사용자 |
| `/user/queue/session-status` | 개인 세션 상태 | 특정 참가자 |

## 공통 이벤트 형식

```json
{
  "eventId": "evt-uuid",
  "eventType": "MATCH_ASSIGNED",
  "sessionId": 1,
  "occurredAt": "2026-06-15T19:35:00",
  "payload": {}
}
```

## WebSocket 이벤트

| 이벤트 | 설명 | 주요 수신 대상 |
| --- | --- | --- |
| `SESSION_STATUS_UPDATED` | 세션 상태 변경 | 세션 전체 |
| `ATTENDANCE_UPDATED` | 출석, 지각, 불참 상태 변경 | 운영자 |
| `PARTICIPANT_STATUS_UPDATED` | 참가자 경기 상태 변경 | 세션 전체, 개인 상태 |
| `MATCH_QUEUE_UPDATED` | 경기 후보 큐 생성/수정/취소 | 세션 전체, 디스플레이 |
| `MATCH_ASSIGNED` | 참가자가 다음 경기 후보에 배정됨 | 개인 알림, 디스플레이 |
| `MATCH_STARTED` | 경기 시작 | 세션 전체, 디스플레이, 개인 알림 |
| `MATCH_COMPLETED` | 경기 종료 | 세션 전체 |
| `MATCH_RESULT_UPDATED` | 경기 결과 입력/수정 | 세션 전체, 개인 상태 |
| `MMR_UPDATED` | 참가자 MMR 변경 | 개인 상태 |
| `NOTIFICATION_SENT` | 웹 내부 알림 또는 PWA 알림 생성 | 개인 알림 |
| `REPORT_UPDATED` | 세션 리포트 또는 개인 기록 갱신 | 운영자, 개인 상태 |

## REST API와 WebSocket 연동 흐름

### 출석 체크

```txt
POST /participants/{participantId}/attendance/check-in
→ attendances 업데이트
→ participants.status 변경
→ ATTENDANCE_UPDATED 발행
→ PARTICIPANT_STATUS_UPDATED 발행
```

### 자동 매칭 생성

```txt
POST /sessions/{sessionId}/matching/generate
→ 경기 가능 참가자 조회
→ 후보 조합 생성
→ match_queues 저장
→ match_queue_players 저장
→ 참가자 상태 SCHEDULED 변경
→ MATCH_QUEUE_UPDATED 발행
→ MATCH_ASSIGNED 발행
→ NOTIFICATION_SENT 발행
```

### 경기 시작

```txt
POST /match-queues/{matchQueueId}/start
→ match 생성
→ match_team 생성
→ match_player 생성
→ match_queue 상태 STARTED
→ 참가자 상태 PLAYING
→ MATCH_STARTED 발행
→ PARTICIPANT_STATUS_UPDATED 발행
```

### 경기 종료

```txt
POST /matches/{matchId}/complete
→ match 상태 COMPLETED
→ 참가자 상태 WAITING 또는 AVAILABLE
→ 코트 빈 상태 처리
→ MATCH_COMPLETED 발행
→ PARTICIPANT_STATUS_UPDATED 발행
```

### 경기 결과 입력

```txt
POST /matches/{matchId}/result
→ match_result 저장
→ 점수 차 보정 계수 계산
→ MMR 계산
→ mmr_history 저장
→ participant current MMR 갱신
→ daily_record 갱신
→ MATCH_RESULT_UPDATED 발행
→ MMR_UPDATED 발행
→ REPORT_UPDATED 발행
```

## 권한 기준

운영자 권한이 필요한 API:

- `POST /groups`
- `PATCH /groups/{groupId}`
- `POST /groups/{groupId}/sessions`
- `PATCH /sessions/{sessionId}/status`
- `POST /sessions/{sessionId}/close`
- `POST /sessions/{sessionId}/matching/generate`
- `PATCH /match-queues/{matchQueueId}`
- `POST /match-queues/{matchQueueId}/cancel`
- `POST /match-queues/{matchQueueId}/start`
- `POST /matches/{matchId}/complete`
- `POST /matches/{matchId}/result`
- `PATCH /matches/{matchId}/result`

참가자가 접근 가능한 API:

- `GET /sessions/{sessionId}`
- `POST /sessions/{sessionId}/participants/member`
- `POST /sessions/{sessionId}/participants/guest`
- `POST /participants/{participantId}/attendance/check-in`
- `POST /participants/{participantId}/attendance/late`
- `POST /participants/{participantId}/attendance/absent`
- `GET /sessions/{sessionId}/participants/me`
- `GET /notifications`

비회원 접근 정책:

- 비회원은 세션 참가 토큰으로 해당 세션에만 접근합니다.
- 비회원은 운영자 API에 접근할 수 없습니다.
- 비회원 접근 권한은 세션 종료 후 제한합니다.
