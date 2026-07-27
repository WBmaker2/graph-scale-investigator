/**
 * 판정·피드백 규칙 (사양서 9.1·9.2절)
 * 정답 하나가 아니라 근거 사용 정도에 따라 부분 인정 (사양서 6.1 채점, 9절).
 * 낙인을 줄이는 문구 사용 (사양서 12절).
 */
import type { InvestigationState, GraphCase } from '@/types'

/** 학생이 선택한 근거 id 묶음에 따른 피드백 (사양서 9.1절 표) */
export type FeedbackResult = {
  /** 피드백 문장 (낙인 없는 표현) */
  message: string
  /** 근거를 얼마나 고루 사용했는지 단계 */
  level: 'full' | 'partial' | 'hint'
}

/**
 * 근거 선택 피드백 (사양서 9.1절 표 기반).
 *  - 값+축 모두 확인 → full
 *  - 인상만 설명 → partial + 값 찾아보라 유도
 *  - 시작점만 → partial + 눈금·단위도 보라 유도
 */
export function getEvidenceFeedback(
  state: InvestigationState,
  caseData: GraphCase,
): FeedbackResult {
  const evidence = new Set(state.selectedEvidence)
  const hasValueTable = evidence.has('valuetable') || evidence.has('range')
  const hasAxis = evidence.has('start') || evidence.has('tickstep') || evidence.has('axes') || evidence.has('axis')
  const hasUnit = evidence.has('unit')
  const hasImpressionOnly =
    evidence.has('slope') && !hasValueTable && !hasAxis

  // 값 표와 축을 모두 확인
  if (hasValueTable && (hasAxis || hasUnit)) {
    return {
      level: 'full',
      message: '수치와 표현을 함께 확인했어요. 훌륭한 수사예요.',
    }
  }

  // 인상만 설명 (기울기/모양만 보고 값 표 건너뜀)
  if (hasImpressionOnly) {
    return {
      level: 'partial',
      message: '그래프의 모양뿐 아니라 실제 값도 찾아보세요. 어떤 단서를 더 확인하면 좋을까요?',
    }
  }

  // 시작점만 지적
  if (evidence.has('start') && !hasUnit) {
    return {
      level: 'partial',
      message: '좋아요. 시작점을 찾았어요. 눈금 간격과 단위도 확인해 볼까요?',
    }
  }

  // 단위만 바뀐 것을 크기 변화로 판단 (미션3)
  if (caseData.id === 'm3' && evidence.has('unit') && !evidence.has('relation')) {
    return {
      level: 'partial',
      message: '단위가 바뀌면 숫자는 달라져도 실제 양은 같을 수 있어요. 비교 관계도 함께 살펴요.',
    }
  }

  // 값 표는 봤지만 축은 안 본 경우
  if (hasValueTable && !hasAxis) {
    return {
      level: 'partial',
      message: '값은 확인했어요. 이제 축의 시작점과 눈금 간격도 살펴볼까요?',
    }
  }

  // 기본: 유도
  return {
    level: 'hint',
    message: '어떤 단서를 더 확인하면 좋을까요? 제목·축·단위·눈금·값 표를 차례로 봐요.',
  }
}

/**
 * "0이 아니면 무조건 틀림" 오개념 방지 안내 (사양서 5.3절, 9.1절, 18절 위험표).
 * 막대그래프에서 0 시작을 권장하지만, 선그래프까지 강요하지 않도록.
 */
export function getZeroStartGuidance(caseData: GraphCase): string | null {
  if (caseData.chartType === 'line') {
    return '선그래프는 변화를 살펴는 목적에 따라 확대 그래프가 도움이 될 수 있어요. 단, 전체 범위 그래프도 함께 보면 좋아요.'
  }
  if (caseData.chartType === 'bar') {
    return '막대그래프는 양을 비교할 때 0에서 시작하면 공정하게 보여요.'
  }
  return null
}

/** 결과 카드용 한 줄 요약 - 학생이 선택한 근거 수로 표현 */
export function summarizeEvidence(state: InvestigationState, caseData: GraphCase): string {
  const count = state.selectedEvidence.length
  const total = caseData.evidencePrompts.length
  if (count === 0) return '확인한 단서: 없음'
  if (count >= total) return `확인한 단서: ${count}/${total} (모든 단서 확인)`
  return `확인한 단서: ${count}/${total}`
}
