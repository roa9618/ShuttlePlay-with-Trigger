# 문서

셔틀플레이 with 팀 트리코어 x 트리거 개발 기준을 정리한 폴더입니다.

첨부된 PDF를 그대로 복사하지 않고, 공개 저장소에 둘 수 있는 내용만 개발 중 바로 확인할 수 있게 옮겼습니다. 예산, 계정, 서버 접속 정보, 운영 DB 정보, 개인 메모, 내부 의사결정 기록은 이 폴더에 두지 않습니다.

## 문서 목록

| 문서 | 내용 |
| --- | --- |
| [project-overview.md](./project-overview.md) | 프로젝트 목표, 사용자 역할, 전체 서비스 흐름 |
| [requirements.md](./requirements.md) | 베타 기준 요구사항과 우선순위 |
| [architecture.md](./architecture.md) | 기술 스택, 시스템 구조, 데이터 설계 기준 |
| [api-websocket.md](./api-websocket.md) | REST API와 WebSocket 이벤트 설계 |
| [matching-and-mmr.md](./matching-and-mmr.md) | 자동 매칭 알고리즘과 MMR 계산 정책 |
| [development-workflow.md](./development-workflow.md) | 개발 환경, 브랜치, 커밋, PR 기준 |
| [beta-operation.md](./beta-operation.md) | 실제 모임 베타 테스트와 운영 체크리스트 |

## 관리 기준

- 구현이 바뀌면 관련 문서도 같이 고칩니다.
- API, DB, 매칭, MMR 정책 변경은 코드보다 문서가 먼저 틀어지기 쉬우므로 PR에서 함께 확인합니다.
- 공개 저장소에 올릴 수 없는 값은 예시라도 적지 않습니다.
- 확정되지 않은 아이디어는 이 폴더에 넣지 않고, 실제 작업 기준으로 정리된 내용만 남깁니다.
