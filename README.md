# ShuttlePlay with Team Trigger

셔틀플레이는 배드민턴 모임 운영을 돕기 위한 웹 서비스입니다.

모임 운영자는 참가자 출석을 확인하고, 참가자 상태를 관리하며, 자동 매칭을 통해 다음 경기를 배정할 수 있습니다. 참가자는 본인의 현재 경기 상태, 다음 경기 여부, 경기 기록을 확인할 수 있습니다.

이 프로젝트는 실제 배드민턴 모임 현장에서 사용할 수 있는 운영 도구를 목표로 합니다. 모바일, 태블릿, 노트북, 큰 화면 디스플레이에서 사용할 수 있도록 반응형 웹과 PWA를 기반으로 개발합니다.

주요 기능은 다음과 같습니다.

- 모임 생성
- 초대 링크 및 QR 공유
- 회원/비회원 참가
- 출석, 지각, 불참, 휴식, 경기 중 상태 관리
- 자동 매칭 후보 생성
- 경기 후보 큐 관리
- 코트 배정 및 경기 진행
- 경기 결과 입력
- 복식/혼복 MMR 계산
- 개인 경기 기록 저장
- 운영자 화면, 참가자 화면, 큰 화면 경기판 실시간 동기화

## Tech Stack

Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- Zustand 또는 Jotai
- CSS Modules 또는 styled-components
- WebSocket Client 또는 STOMP Client
- PWA

Backend

- Java
- Spring Boot
- Spring Data JPA
- Spring Security
- Spring WebSocket
- Gradle
- JUnit
- Swagger / OpenAPI

Database

- MySQL

## Getting Started

Frontend

```bash
cd Frontend
npm install
npm run dev
```

```text
http://localhost:5173
```

Backend

```bash
cd Backend
./gradlew bootRun
```

Windows

```bash
cd Backend
gradlew bootRun
```

```text
http://localhost:8080
```

Database

```sql
CREATE DATABASE `ShuttlePlay_with_Trigger`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

## Project Structure

```text
ShuttlePlay-with-Trigger/
├── Frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── Backend/
│   ├── src/
│   ├── build.gradle
│   ├── settings.gradle
│   └── gradlew
├── Docs/
├── README.md
├── .gitignore
├── .gitattributes
└── .editorconfig
```
