/**
 * 그래프 눈금 수사대 핵심 타입 정의
 * 사양서 6.2절 "핵심 상태" 참고. 데이터 계산과 판정은 순수 함수로 분리한다(사양서 14·16절).
 */

/** 축 설정. 그래프 변형은 values 배열이 아니라 이 값만 바꾼다(사양서 10.1). */
export type AxisConfig = {
  /** 축의 시작값 (0 시작 여부가 인상에 영향) */
  min: number
  /** 축의 끝값 */
  max: number
  /** 눈금 한 칸의 값 (사양서 5.4절) */
  tickStep: number
  /** 단위 라벨. 예: '명', '개', 'cm', '원' */
  unit: string
  /** 축 제목. 예: '재활용 병 수(개)' */
  label: string
  /**
   * 숫자가 표시되는 눈금 위치를 따로 지정할 때 사용.
   * 지정하지 않으면 tickStep 간격을 따른다. 미션2(중간 눈금 변형)에서 사용.
   * 사양서 5.4절 "눈금 사이의 중간 표시".
   */
  labeledTicks?: number[]
}

export type ChartType = 'bar' | 'line'
export type IntendedPurpose = 'compare' | 'trend' | 'overview'

/**
 * 한 그래프 표현 변형.
 * misleadingVariant/fairVariants 모두 같은 values를 참조하고 축 설정만 다르다.
 */
export type GraphVariant = {
  /** 변형 식별자. 예: 'A', 'B' */
  id: string
  /** 학생에게 보여줄 짧은 이름. 예: '그래프 A' */
  displayName: string
  /** 이 변형의 한 줄 설명 (정직/과장 성격). 색이 아닌 텍스트로 구분 - 사양서 12절 */
  tag: 'fair' | 'watch'
  axis: AxisConfig
  chartType?: ChartType
}

/** 학생이 확인해야 할 근거 단서 (사양서 7.2절 "근거 형광펜") */
export type EvidencePrompt = {
  id: string
  /** 학생에게 보여줄 근거 항목 이름 */
  label: string
  /** 이 근거가 맞을 때의 한 줄 설명 */
  explanation: string
}

/**
 * 한 미션(사건).
 * 사양서 8절의 6개 미션을 이 타입으로 표현한다.
 */
export type GraphCase = {
  id: string
  /** 미션 번호 + 제목. 예: '사건 1. 잘린 축 사건' */
  title: string
  /** 사건 배경 한 문장 (학생 친화) */
  story: string
  chartType: ChartType
  /** 가로축 범주. 예: ['1반','2반','3반','4반'] */
  categories: string[]
  /** 실제 원자료. 모든 변형이 이 배열을 공유한다(사양서 10.1). */
  values: number[]
  /** 기본 단위 (값 표·정직 변형이 이 단위 사용) */
  unit: string
  /** 세로축 기본 라벨 */
  valueAxisLabel: string
  /** 이 미션의 그래프 목적(사양서 8절 핵심 개념) */
  intendedPurpose: IntendedPurpose
  /** 비교 대상이 되는 그래프 변형들. 보통 2개. */
  variants: GraphVariant[]
  /** 학생이 수리 패널에서 만들어야 하는 '공정한 축' 설정 */
  fairTarget: AxisConfig
  /** 수리 패널에서 허용하는 축 옵션들 (정답 하나가 아님 - 사양서 9절) */
  acceptableRepairs?: AxisConfig[]
  /** 학생이 확인하는 근거 단서 목록 (사양서 7.2절) */
  evidencePrompts: EvidencePrompt[]
  /** 이 사건에서 학생이 배우는 핵심 개념 (결과 카드에 표시) */
  coreConcept: string
  /** 설명 문장 틀 선택지 (사양서 9.2절). 학생이 빈칸을 채운다 */
  sentenceTemplates: string[]
  /** 튜토리얼 여부 (미션0은 절차 안내 중심) */
  isTutorial?: boolean
}

/** 미션 내 단계 (사양서 7.1절 학습 흐름) */
export type Phase = 'observe' | 'check-values' | 'explain' | 'repair' | 'reflect'

/** 미션 진행 중 상태 */
export type InvestigationState = {
  missionId: string
  phase: Phase
  /** 학생이 '차이가 더 크게 보이는 그래프'로 선택한 변형 id */
  selectedGraphId?: string
  /** 값 표를 확인했는지 (다음 단계 진입 조건 - 사양서 18절 위험 대응) */
  valueTableOpened: boolean
  /** 학생이 선택한 근거 id 들 */
  selectedEvidence: string[]
  /** 학생이 수리한 축 설정 */
  repairedAxis?: AxisConfig
  /** 학생이 완성한 설명 문장 */
  note: string
  /** 미션 완료 여부 */
  completed: boolean
}
