/**
 * 콘텐츠 검수 순수 함수 (사양서 10.2절 검수표, 16.2절 콘텐츠 검증).
 * 미션 데이터가 교육적으로 일관되는지 기계적으로 점검한다.
 */
import type { GraphCase, AxisConfig } from '@/types'
import { computeImpression, validateAxisConfig, getTickValues } from './graphScale'

export type ValidationIssue = {
  /** 사양서 10.2절 검수 항목 */
  check: 'values' | 'unit' | 'ticks' | 'start' | 'purpose' | 'sentence'
  /** 어느 미션/변형인지 */
  where: string
  /** 무엇이 문제인지 (사람이 읽는 문장) */
  message: string
}

/** 한 축 설정이 모든 값을 담을 수 있는지 (값이 축 범위 밖이면 안 됨) */
export function axisCoversValues(axis: AxisConfig, values: number[]): boolean {
  return values.every((v) => v >= axis.min && v <= axis.max + 1e-9)
}

/**
 * 단일 미션 검수 (사양서 10.2절 검수표 항목별).
 * 반환된 issue 배열이 비어 있으면 통과.
 */
export function validateGraphCase(caseData: GraphCase): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const where = caseData.title

  // 검수 1. 합계·최대·최소: 그래프와 원자료 값 일치
  for (const variant of caseData.variants) {
    if (!axisCoversValues(variant.axis, caseData.values)) {
      issues.push({
        check: 'values',
        where: `${where} / ${variant.displayName}`,
        message: `축 범위(${variant.axis.min}~${variant.axis.max})가 모든 값을 감싸지 못합니다.`,
      })
    }
    const check = validateAxisConfig(variant.axis)
    if (!check.ok) {
      issues.push({
        check: 'ticks',
        where: `${where} / ${variant.displayName}`,
        message: check.reason,
      })
    }
    // 단위 일치 검사는 미션3처럼 의도적 변환을 허용하므로 엄격 비교 대신
    // fairTarget 단위 검사(아래)에서만 다룬다.
  }

  // 검수 2. 단위: 축 라벨과 unit 일치 여부는 데이터에서 명시하므로 정적 검사는 생략,
  //           대신 fairTarget 단위가 기본 unit과 일치하는지 확인
  if (caseData.fairTarget.unit !== caseData.unit) {
    // 미션3처럼 의도적 변환은 별도 표식이 없으므로, 기본적으로 일치 권장
    issues.push({
      check: 'unit',
      where,
      message: `fairTarget 단위(${caseData.fairTarget.unit})가 미션 기본 단위(${caseData.unit})와 다릅니다. 의도적이면 무시.`,
    })
  }

  // 검수 3. 눈금: 표시 간격 일관성 (미션2 변형은 의도적 비일관성 허용)
  // 정직(fair) 변형은 반드시 일정한 눈금이어야 한다
  for (const variant of caseData.variants) {
    if (variant.tag === 'fair') {
      const ticks = getTickValues(variant.axis)
      if (variant.axis.labeledTicks == null && ticks.length < 2) {
        issues.push({
          check: 'ticks',
          where: `${where} / ${variant.displayName}`,
          message: '정직한 변형인데 눈금이 2개 미만입니다.',
        })
      }
    }
  }

  // 검수 4. 시작점: 막대그래프에서 정직(fair) 변형은 0 시작이 기본 (사양서 5.3절)
  if (caseData.chartType === 'bar') {
    for (const variant of caseData.variants) {
      if (variant.tag === 'fair' && variant.axis.min !== 0) {
        // 선그래프가 아닌 막대에서 정직 변형이 0 시작이 아니면 경고 (강제는 아님)
        issues.push({
          check: 'start',
          where: `${where} / ${variant.displayName}`,
          message: '막대그래프의 정직한 변형이 0에서 시작하지 않습니다. 의도적이면 무시.',
        })
      }
    }
  }

  // 검수 5. 목적: chartType과 intendedPurpose 부합 (사양서 5.3절)
  if (caseData.intendedPurpose === 'compare' && caseData.chartType !== 'bar') {
    issues.push({
      check: 'purpose',
      where,
      message: '비교 목적인데 막대그래프가 아닙니다.',
    })
  }
  if (caseData.intendedPurpose === 'trend' && caseData.chartType !== 'line') {
    issues.push({
      check: 'purpose',
      where,
      message: '추세 목적인데 선그래프가 아닙니다.',
    })
  }

  // 검수 6. 문장: 오개념 방지 문구 ("0이 아니면 무조건 틀림"이 없어야 - 사양서 16.2)
  const forbiddenPhrases = ['무조건 틀', '무조건 거짓', '항상 거짓', '항상 틀']
  for (const tpl of caseData.sentenceTemplates) {
    for (const bad of forbiddenPhrases) {
      if (tpl.includes(bad)) {
        issues.push({
          check: 'sentence',
          where,
          message: `문장 틀에 오개념 유발 문구가 있습니다: "${bad}"`,
        })
      }
    }
  }

  return issues
}

/** 모든 미션을 검수하고 이슈를 모은다 (사양서 16.2). */
export function validateAllCases(cases: GraphCase[]): ValidationIssue[] {
  return cases.flatMap((c) => validateGraphCase(c))
}

/**
 * 학생이 수리한 축이 "공정한 표현"으로 인정되는지 (사양서 9.1절 부분 인정 정신).
 * 정답 하나가 아니라, 합리적 기준을 통과하면 인정한다.
 *
 * 인정 기준:
 *  - 막대그래프: 0 시작 + 모든 값 포함 + 눈금 간격 일정
 *  - 선그래프: 모든 값 포함 + 눈금 간격 일정 (0 시작 강제 아님 - 사양서 5.3절)
 */
export type RepairAssessment = {
  accepted: boolean
  reasons: string[]
  /** 더 확인하라는 유도 (낙인 없는 피드백 - 사양서 12절) */
  hint?: string
}

export function assessRepair(
  repaired: AxisConfig,
  caseData: GraphCase,
): RepairAssessment {
  const reasons: string[] = []
  const check = validateAxisConfig(repaired)
  if (!check.ok) {
    return { accepted: false, reasons: [check.reason], hint: '축 시작값·끝값·눈금 간격을 다시 살펴봐요.' }
  }

  // 모든 값 포함
  if (!axisCoversValues(repaired, caseData.values)) {
    reasons.push('축 범위가 모든 값을 감싸지 못합니다.')
  }

  // 막대그래프는 0 시작 권장 (강제 아님 - 사양서 5.3절 "0이 아니면 무조건 틀림" 방지)
  let zeroStartNote = false
  if (caseData.chartType === 'bar' && repaired.min !== 0) {
    zeroStartNote = true
  }

  // 허용 옵션이 있으면 그 중 하나와 일치하는지 우선 확인
  if (caseData.acceptableRepairs && caseData.acceptableRepairs.length > 0) {
    const match = caseData.acceptableRepairs.some((opt) =>
      Math.abs(opt.min - repaired.min) < 1e-6 &&
      Math.abs(opt.max - repaired.max) < 1e-6 &&
      Math.abs(opt.tickStep - repaired.tickStep) < 1e-6,
    )
    if (match) {
      return {
        accepted: true,
        reasons: ['제시된 공정한 축 설정과 일치합니다.'],
      }
    }
  }

  // 일반 기준
  const accepted = reasons.length === 0
  const hint = zeroStartNote
    ? '막대그래프는 0에서 시작하면 양을 비교하기 좋아요. (단, 선그래프는 목적에 따라 다를 수 있어요.)'
    : accepted
      ? undefined
      : '어떤 단서를 더 확인하면 좋을까요? 값 표와 축 범위를 다시 비교해 봐요.'

  return { accepted, reasons, hint }
}

/**
 * 학생이 선택한 "더 크게 보이는 그래프"가 실제로 emphasisScore가 더 큰지 검증.
 * 사양서 8절 미션1 질문 "어떤 그래프가 차이를 더 크게 느끼게 하는가" 기계 검증용.
 */
export function isCorrectMoreEmphasized(
  caseData: GraphCase,
  selectedVariantId: string,
): boolean {
  if (caseData.variants.length < 2) return true
  const [a, b] = caseData.variants
  const impA = computeImpression(caseData.values, a.axis)
  const impB = computeImpression(caseData.values, b.axis)
  const expected = impA.emphasisScore >= impB.emphasisScore ? a.id : b.id
  return expected === selectedVariantId
}
