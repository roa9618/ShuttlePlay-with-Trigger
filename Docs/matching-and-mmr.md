# 매칭과 MMR

셔틀플레이의 자동 매칭은 4명을 무작위로 묶는 기능이 아닙니다. 현장에서 운영자가 납득할 수 있고, 참가자도 공정하다고 느낄 수 있는 경기 후보를 만드는 것이 목표입니다.

MMR도 단순히 이기면 오르고 지면 내려가는 값으로만 두지 않습니다. 복식 경기 특성상 팀원 실력 차이, 경기 유형, 점수 차, 누적 경기 수를 함께 봅니다.

## 자동 매칭 목표

- 출석했고 경기 가능한 사람만 매칭합니다.
- 특정 참가자가 너무 오래 쉬지 않도록 합니다.
- 3연속 경기처럼 과도한 연속 경기를 방지합니다.
- 같은 파트너와 반복해서 경기하지 않도록 합니다.
- 같은 상대를 반복해서 만나는 일을 줄입니다.
- 남복, 여복, 혼복, 성별 무관 조건을 최대한 반영합니다.
- 즐겜과 빡겜에 따라 다른 기준으로 후보를 평가합니다.
- 급수, 나이대, 성별 보정, 복식/혼복 MMR을 함께 고려합니다.
- 운영자가 이해할 수 있도록 매칭 결과 설명을 제공합니다.
- 조건이 완벽하지 않아도 가능한 최선의 후보를 만듭니다.

## 매칭 대상 상태

| 참가자 상태 | 매칭 포함 |
| --- | --- |
| `NOT_ARRIVED` | 제외 |
| `LATE_EXPECTED` | 제외 |
| `ATTENDED` | 조건부 |
| `AVAILABLE` | 포함 |
| `WAITING` | 포함 |
| `SCHEDULED` | 제외 |
| `PLAYING` | 제외 |
| `RESTING` | 제외 |
| `LEFT` | 제외 |
| `ABSENT` | 제외 |

기본 자동 매칭은 `AVAILABLE`, `WAITING` 참가자를 대상으로 합니다.

## 매칭 처리 흐름

```txt
1. 세션 정보 조회
2. 경기 가능 참가자 조회
3. 참가자별 계산용 정보 구성
4. 매칭 옵션 확인
5. 가능한 4인 조합 생성
6. 4인 조합별 가능한 팀 구성 생성
7. 각 팀 구성 점수 계산
8. 벌점 / 가산점 적용
9. 점수가 높은 후보 정렬
10. 참가자 중복 없이 코트 수만큼 후보 선택
11. 경기 후보 큐 저장
12. 후보 참가자 상태를 SCHEDULED로 변경
13. WebSocket 이벤트 발행
```

## 자동 매칭 요청값

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

| 필드 | 설명 |
| --- | --- |
| `matchType` | 남복, 여복, 혼복, 성별 무관 |
| `playStyle` | 즐겜 또는 빡겜 |
| `courtCount` | 생성할 최대 경기 수 |
| `preservedQueueIds` | 유지할 기존 경기 후보 |
| `excludedParticipantIds` | 이번 매칭에서 제외할 참가자 |
| `forcedParticipantIds` | 가능한 한 포함할 참가자 |

## 계산용 참가자 모델

DB Entity를 그대로 계산에 사용하지 않고, 매칭 계산용 모델로 변환합니다.

```java
public class MatchParticipant {
    private Long participantId;
    private String displayName;
    private Gender gender;
    private AgeGroup ageGroup;
    private Grade grade;
    private int doublesMmr;
    private int mixedMmr;
    private int totalMatchCount;
    private int winCount;
    private int loseCount;
    private int consecutivePlayCount;
    private int consecutiveRestCount;
    private boolean newcomer;
    private ParticipantStatus status;
    private List<Long> recentPartnerIds;
    private List<Long> recentOpponentIds;
}
```

계산용 값:

| 값 | 설명 |
| --- | --- |
| `baseMmr` | 경기 유형에 따라 선택된 MMR |
| `adjustedSkill` | 급수, 나이대, 성별 보정이 반영된 계산용 실력 |
| `fatiguePenalty` | 연속 경기 벌점 |
| `restBonus` | 연속 휴식 가산점 |
| `duplicatePenalty` | 파트너/상대 중복 벌점 |

## 경기 유형 정책

경기 유형은 절대 조건이 아니라 우선 조건입니다.

| 경기 유형 | 우선 조건 |
| --- | --- |
| `MENS_DOUBLES` | 남성 4명 우선 |
| `WOMENS_DOUBLES` | 여성 4명 우선 |
| `MIXED_DOUBLES` | 남성 2명 + 여성 2명, 팀별 남녀 1명 우선 |
| `ANY` | 성별보다 실력 균형과 참여 기회 우선 |

인원 구성이 맞지 않으면 유연 매칭을 적용합니다. 유연 매칭이 적용된 경우 매칭 설명에 남깁니다.

## 플레이 스타일 정책

### `FUN`

즐겜은 다양한 조합과 공정한 참여 기회를 우선합니다.

가중치를 높게 둘 항목:

- 경기 횟수 균등
- 연속 휴식 방지
- 파트너 중복 최소화
- 상대 중복 최소화
- 신규 참가자 배려
- 과도한 연속 경기 방지

### `COMPETITIVE`

빡겜은 경기 몰입도와 실력 균형을 우선합니다.

가중치를 높게 둘 항목:

- 팀 평균 MMR 차이 최소화
- 팀 내부 실력 차이 완화
- 경기 전체 실력 편차 완화
- 급수/MMR 기반 밸런스

## 팀 구성

4명이 정해지면 가능한 팀 구성은 3가지입니다.

```txt
A+B vs C+D
A+C vs B+D
A+D vs B+C
```

각 팀 구성에 대해 점수를 계산하고 가장 좋은 팀 구성을 후보로 사용합니다.

## 후보 점수 계산

모든 후보는 기본 점수 100점에서 시작합니다.

```txt
finalScore =
  baseScore
  - teamBalancePenalty
  - duplicatePartnerPenalty
  - duplicateOpponentPenalty
  - consecutivePlayPenalty
  - matchCountGapPenalty
  - typeMismatchPenalty
  + restPriorityBonus
  + forcedParticipantBonus
  + newcomerCareBonus
```

계산 결과 모델:

```java
public class MatchScoreResult {
    private List<TeamCase> teams;
    private double score;
    private boolean valid;
    private List<String> explanations;
}
```

## 벌점과 가산점

### 팀 평균 MMR 차이

| 팀 MMR 차이 | 벌점 |
| --- | --- |
| 0~50 | 0 |
| 51~100 | -5 |
| 101~150 | -10 |
| 151~250 | -20 |
| 251 이상 | -35 |

### 팀 내부 MMR 차이

| 팀원 간 MMR 차이 | 벌점 |
| --- | --- |
| 0~200 | 0 |
| 201~400 | -5 |
| 401~600 | -10 |
| 601 이상 | -15 |

즐겜에서 고수와 초보를 섞어 배려 매칭을 만들 필요가 있으면 이 벌점은 약하게 적용할 수 있습니다.

### 경기 수 차이

후보 4명의 오늘 경기 수 차이를 계산합니다.

| 경기 수 차이 | 벌점 |
| --- | --- |
| 0 | 0 |
| 1 | -5 |
| 2 | -12 |
| 3 이상 | -25 |

### 연속 경기

| 연속 경기 수 | 벌점 |
| --- | --- |
| 0 | 0 |
| 1 | -10 |
| 2 | -35 |
| 3 이상 | 후보 제외에 가까운 강한 벌점 |

`consecutivePlayCount >= 3`이면 자동 매칭에서는 invalid 처리할 수 있습니다. 다만 경기 가능 인원이 부족한 경우 운영자 수동 배정은 허용할 수 있습니다.

### 연속 휴식

| 연속 휴식 수 | 가산점 |
| --- | --- |
| 0 | 0 |
| 1 | +5 |
| 2 | +30 |
| 3 이상 | +50 |

### 파트너 중복

파트너 중복은 상대 중복보다 강하게 줄입니다.

| 같은 파트너 횟수 | 벌점 |
| --- | --- |
| 0 | 0 |
| 1 | -15 |
| 2 | -30 |
| 3 이상 | -50 |

즐겜에서는 이 벌점을 1.2~1.5배까지 강화할 수 있습니다.

### 상대 중복

| 같은 상대 횟수 | 벌점 |
| --- | --- |
| 0 | 0 |
| 1 | -7 |
| 2 | -15 |
| 3 이상 | -30 |

### 경기 유형 불일치

| 상황 | 벌점 |
| --- | --- |
| 경기 유형 완전 충족 | 0 |
| 유연 매칭 필요하지만 실력 균형 양호 | -5 |
| 성별 조건 크게 불일치 | -20 |

### 나이대 보정

나이대 보정은 실제 MMR을 바꾸지 않고 계산용 실력값에만 반영합니다.

| 나이대 | 보정값 |
| --- | --- |
| 10대 | 0 |
| 20대 | 0 |
| 30대 | 0 |
| 40대 | -0.15 |
| 50대 | -0.35 |
| 60대 이상 | -0.60 |

권장 변환:

```txt
ageAdjustmentScore = ageAdjustmentValue * 100
adjustedSkill = baseMmr + ageAdjustmentScore
```

### 신규 참가자 배려

| 상황 | 점수 |
| --- | --- |
| 신규 참가자가 아직 0경기 | +15 |
| 신규 참가자가 2연속 휴식 | +30 |
| 신규 참가자가 지나치게 강한 경기 후보에 포함 | -15 |

## 후보 선택

모든 후보를 점수순으로 정렬합니다.

동점이면 아래 순서로 비교합니다.

1. 2연속 휴식 참가자를 더 많이 포함한 후보
2. 팀 MMR 차이가 더 작은 후보
3. 파트너 중복이 더 적은 후보
4. 전체 경기 수가 적은 참가자를 포함한 후보

한 참가자는 여러 후보에 중복 포함될 수 없습니다.

```java
selectedCandidates = new ArrayList<>();

for (candidate : sortedCandidates) {
    if (!candidate.hasOverlappingParticipants(selectedCandidates)) {
        selectedCandidates.add(candidate);
    }

    if (selectedCandidates.size() == courtCount) {
        break;
    }
}
```

## 매칭 설명

매칭 설명은 운영자에게만 보여줍니다.

설명에 포함할 수 있는 항목:

- 2연속 휴식 참가자 포함
- 팀 전력 차이 낮음
- 파트너 중복 없음
- 유연 매칭 적용
- 신규 참가자 배려
- 강제 포함 참가자 반영

예시:

```txt
이 매칭이 선택된 이유:
- 2연속 휴식 참가자를 우선 배정했습니다.
- 팀 전력 차이가 가장 낮은 조합입니다.
- 파트너 중복이 없는 조합입니다.
- 혼복 인원 부족으로 유연 매칭이 적용되었습니다.
```

## MMR 종류

셔틀플레이는 경기 유형에 따라 MMR을 분리합니다.

| MMR | 설명 |
| --- | --- |
| `doublesMmr` | 남자 복식 / 여자 복식 계열 MMR |
| `mixedMmr` | 혼합 복식 MMR |

혼복은 남복/여복과 자리 배치와 전술이 다를 수 있습니다. 같은 급수라도 경기 유형에 따라 체감 실력이 다르기 때문에 하나의 MMR만 사용하지 않습니다.

## 경기 유형별 사용 MMR

| 경기 유형 | 사용 MMR |
| --- | --- |
| `MENS_DOUBLES` | `doublesMmr` |
| `WOMENS_DOUBLES` | `doublesMmr` |
| `MIXED_DOUBLES` | `mixedMmr` |
| `ANY` | 실제 조합과 운영자 선택 기준에 따라 결정 |

`ANY` 경기의 초기 구현 기준:

- 기본값은 `doublesMmr`
- 혼복 형태가 명확하면 `mixedMmr`
- 완전히 섞인 유연 매칭이면 `doublesMmr`를 기본으로 사용하되 `mixedMmr`를 보조값으로 참고할 수 있음

## 급수별 MMR 기준

| 급수 | 설명 | 초기 MMR | 하한 MMR | 소프트 캡 |
| --- | --- | ---: | ---: | ---: |
| E | 초심 | 700 | 500 | 900 |
| D | 초급 | 950 | 750 | 1150 |
| C | 중급 | 1200 | 1000 | 1450 |
| B | 상급 | 1500 | 1250 | 1750 |
| A | 최상급 | 1800 | 1500 | 2100 |
| S | 준자강 | 2150 | 1800 | 2450 |
| SS | 자강 / 선수 출신 | 2500 | 2100 | 2800 |

회원가입 또는 참가자 최초 등록 시 급수를 기준으로 복식 MMR과 혼복 MMR 초기값을 부여합니다.

```txt
doublesMmr = grade.initialMmr
mixedMmr = grade.initialMmr
```

## K 값 정책

K 값은 한 경기 결과가 MMR에 얼마나 크게 반영되는지를 결정합니다.

| 상황 | K 값 |
| --- | ---: |
| 즐겜 | 6 |
| 승패만 입력된 일반 경기 | 8 |
| 점수까지 입력된 일반 경기 | 10 |
| 빡겜 | 10 |
| 교류전 / 공식전 성격 경기 | 12 |

K 값 선택 우선순위:

1. 교류전 / 공식전 여부
2. 플레이 스타일
3. 점수 입력 여부
4. 기본 일반 경기 여부

권장 구현:

```java
if (sessionType == SessionType.EXCHANGE) {
    k = 12;
} else if (playStyle == PlayStyle.FUN) {
    k = 6;
} else if (playStyle == PlayStyle.COMPETITIVE) {
    k = 10;
} else if (scoreEntered) {
    k = 10;
} else {
    k = 8;
}
```

## 예상 승리 확률

팀 평균 MMR:

```txt
teamAAvgMmr = (A1.mmr + A2.mmr) / 2
teamBAvgMmr = (B1.mmr + B2.mmr) / 2
```

Elo 기반 예상 승률:

```txt
d = opponentTeamMmr - myTeamMmr
p = 1 / (1 + 10^(d / 400))
```

낮은 MMR 팀이 이기면 더 많이 오르고, 높은 MMR 팀이 지면 더 많이 떨어집니다.

## 기본 MMR 변동값

승리 팀:

```txt
delta = K * (1 - expectedWinRate)
```

패배 팀:

```txt
delta = -K * expectedWinRate
```

## 점수 차 보정

점수까지 입력된 경기는 승패뿐 아니라 경기 내용도 반영합니다.

| 점수 차 | 해석 | 보정 계수 |
| --- | --- | ---: |
| 1~2점 | 거의 접전 | 0.7 |
| 3~5점 | 약한 우세 | 0.85 |
| 6~9점 | 일반적인 승리 | 1.0 |
| 10~14점 | 확실한 우세 | 1.15 |
| 15점 이상 | 압도적 승리 | 1.3 |

계산식:

```txt
승리 팀 증가값 = K * (1 - expectedWinRate) * scoreMultiplier
패배 팀 감소값 = K * expectedWinRate * scoreMultiplier
```

보정 계수는 0.7~1.3 범위 안으로 제한합니다.

## 경기 수 신뢰도 보정

누적 경기 수가 적은 참가자는 MMR 신뢰도가 낮습니다. 초반 몇 경기만으로 MMR이 크게 흔들리지 않도록 반영 비율을 조정합니다.

| 누적 경기 수 | 반영 비율 |
| --- | ---: |
| 0~5경기 | 50% |
| 6~15경기 | 75% |
| 16경기 이상 | 100% |

```txt
adjustedDelta = rawDelta * confidenceMultiplier
```

## 팀 내 실력 차이 보정

상위 급수자가 초보자와 팀을 이루어 패배했을 때 상위자의 MMR이 과도하게 떨어지지 않도록 합니다.

| 팀 내 MMR 차이 | 상위자 패배 감소량 완화 |
| --- | ---: |
| 0~200 | 0% |
| 201~400 | 20% |
| 401~600 | 40% |
| 601 이상 | 60% |

```txt
if player is higherMmrPlayer and result == LOSE:
    delta = delta * (1 - reductionRate)
```

## 개인별 책임도 보정

초기 베타에서는 복잡한 개인 책임도 모델을 만들지 않고 아래 정도만 적용합니다.

| 상황 | 보정 |
| --- | --- |
| 상위자가 하위자와 팀을 이루어 패배 | 하락폭 20~60% 완화 |
| 하위자가 상위자와 팀을 이루어 승리 | 상승폭 최대 120%까지만 허용 |
| 팀 내 MMR 차이 600 이상 | 전체 변동폭을 80%로 제한 가능 |

## 하한선과 소프트 캡

하한선은 모든 보정이 끝난 뒤 최종 MMR에 적용합니다.

```txt
finalMmr = currentMmr + finalDelta
finalMmr = max(finalMmr, grade.floorMmr)
```

소프트 캡은 상승할 때만 적용합니다.

```txt
softCapStart = grade.softCapMmr - 50
```

| 현재 MMR 위치 | 상승폭 반영 |
| --- | ---: |
| 상한선 -50 미만 | 100% |
| 상한선 -50 이상 | 50% |
| 상한선 이상 | 25% |

현재 MMR이 급수 상한선을 여러 경기 이상 초과하고 최근 승률이 높으면 운영자에게 급수 재평가 안내를 제공할 수 있습니다.

## 최종 MMR 계산 흐름

```txt
1. 경기 유형에 맞는 MMR 선택
2. 팀 평균 MMR 계산
3. 예상 승리 확률 계산
4. K 값 결정
5. 승패 기반 기본 변동값 계산
6. 점수가 입력된 경우 점수 차 보정 적용
7. 경기 수 신뢰도 보정 적용
8. 팀 내 실력 차이 보정 적용
9. 개인별 책임도 보정 적용
10. 상한선 소프트 캡 적용
11. 하한선 보호 적용
12. 최종 MMR 저장
13. MMR 이력 저장
14. 개인 기록 갱신
15. WebSocket 이벤트 발행
```

## 경기 결과 수정 시 재계산

결과 수정이 필요한 경우:

- 승리 팀을 잘못 선택함
- 점수를 잘못 입력함
- 승패만 저장했다가 나중에 점수를 추가함

처리 기준:

1. 기존 경기 결과 이력을 저장합니다.
2. 기존 MMR 이력을 확인합니다.
3. 기존 MMR 반영을 되돌리는 보정 이력을 추가합니다.
4. 수정된 경기 결과 기준으로 MMR을 다시 계산합니다.
5. 새로운 MMR 이력을 저장합니다.
6. 개인 일자별 기록과 세션 리포트를 재계산합니다.

## 테스트 기준

매칭 테스트:

- 경기 중 참가자가 후보에 포함되지 않는지 확인
- 다음 경기 예정자가 중복 포함되지 않는지 확인
- 2연속 휴식자가 우선 배정되는지 확인
- 3연속 경기가 방지되는지 확인
- 파트너 중복이 줄어드는지 확인
- 팀 MMR 차이가 너무 크지 않은지 확인
- 유연 매칭이 필요한 상황에서도 후보가 생성되는지 확인

MMR 테스트:

- 경기 유형별 MMR 선택
- 팀 평균 MMR 계산
- 예상 승률 계산
- 점수 차 보정
- 급수별 하한선 적용
- 급수별 소프트 캡 적용
- MMR 이력 저장
- 경기 결과 수정 시 재계산
- 경기 수 신뢰도 보정
- 팀 내 실력 차이 보정
- 급수 재평가 안내 조건
