/**
 * 그래프 눈금·축 계산 순수 함수 (사양서 15절)
 * 모든 함수는 부작용이 없고 입력만으로 결정된다 - 단위 테스트 대상(사양서 16.1).
 */
import type { AxisConfig } from '@/types'

/**
 * 지정한 인덱스의 눈금 값을 계산한다 (사양서 15.1).
 * getTickValue(0, 2, 3) === 6  →  0에서 시작해 한 칸이 2인 축의 3번째 눈금
 */
export function getTickValue(min: number, tickStep: number, index: number): number {
  if (tickStep <= 0) {
    throw new Error(`tickStep는 0보다 커야 합니다. 받은 값: ${tickStep}`)
  }
  if (index < 0) {
    throw new Error(`index는 0 이상이어야 합니다. 받은 값: ${index}`)
  }
  return min + tickStep * index
}

/**
 * 축 설정 유효성 검사 (사양서 15.1 검증 항목).
 * - tickStep > 0
 * - max > min
 */
export function validateAxisConfig(axis: AxisConfig): { ok: true } | { ok: false; reason: string } {
  if (axis.tickStep <= 0) {
    return { ok: false, reason: `눈금 한 칸은 0보다 커야 합니다. (입력: ${axis.tickStep})` }
  }
  if (axis.max <= axis.min) {
    return { ok: false, reason: `축 끝값은 시작값보다 커야 합니다. (시작 ${axis.min}, 끝 ${axis.max})` }
  }
  return { ok: true }
}

/** 축의 표시할 눈금값 배열을 만든다. labeledTicks가 있으면 그것을, 없으면 tickStep 간격 사용. */
export function getTickValues(axis: AxisConfig): number[] {
  const check = validateAxisConfig(axis)
  if (!check.ok) {
    throw new Error(check.reason)
  }
  if (axis.labeledTicks && axis.labeledTicks.length > 0) {
    // 미션2 변형: 표시 위치가 따로 주어진 경우
    return [...axis.labeledTicks].sort((a, b) => a - b)
  }
  const ticks: number[] = []
  let current = axis.min
  // 부동소수 오차 방지를 위해 반올림
  const round = (n: number) => Math.round(n * 1e9) / 1e9
  while (round(current) <= round(axis.max)) {
    ticks.push(round(current))
    current += axis.tickStep
  }
  return ticks
}

/**
 * 값 → 축 픽셀 비율(0~1) 변환. 차트 높이를 곱해 막대 높이를 얻는다.
 * 이 함수가 "잘린 축" 효과를 수학적으로 만든다.
 *  - min=0, max=60, 값 50 → 50/60 ≈ 0.83 (정직)
 *  - min=46, max=60, 값 50 → (50-46)/(60-46) ≈ 0.29... 가 아니라
 *    (50-46)/14 ≈ 0.286 (과장: 같은 값이 낮게 시작해 상대적으로 더 큰 막대)
 *
 * 축 범위 밖의 값은 0~1로 클램프한다.
 */
export function valueToRatio(value: number, axis: AxisConfig): number {
  const check = validateAxisConfig(axis)
  if (!check.ok) {
    throw new Error(check.reason)
  }
  const range = axis.max - axis.min
  const ratio = (value - axis.min) / range
  return Math.max(0, Math.min(1, ratio))
}

/** 값 → 픽셀 높이. chartHeight는 축 영역 높이. */
export function valueToPixel(value: number, axis: AxisConfig, chartHeight: number): number {
  return valueToRatio(value, axis) * chartHeight
}

/**
 * 한 축 설정이 0에서 시작하는지 (사양서 5.3절 - 막대그래프 기본 권장).
 */
export function startsAtZero(axis: AxisConfig): boolean {
  return axis.min === 0
}

/**
 * 눈금 간격이 일정한지 (사양서 5.4절).
 * labeledTicks가 있으면 인접 눈금 차이가 모두 같은지 확인한다.
 */
export function hasRegularTicks(axis: AxisConfig): boolean {
  const ticks = getTickValues(axis)
  if (ticks.length < 2) return true
  if (axis.labeledTicks) {
    // 표시된 눈금들 사이 간격 검사
    const steps: number[] = []
    for (let i = 1; i < ticks.length; i++) {
      steps.push(Math.round((ticks[i] - ticks[i - 1]) * 1e9) / 1e9)
    }
    const first = steps[0]
    return steps.every((s) => Math.abs(s - first) < 1e-6)
  }
  return true
}

/**
 * 시각적 인상 지표 계산 (사양서 15.2절).
 * "과장 정도"는 자연법칙이 아니라 보조 지표로만 쓴다(사양서 15.2 끝문단).
 *
 * 반환값:
 *  - actualRange: 실제 값의 최대-최소 차이
 *  - axisRange: 축의 표현 범위 (max-min)
 *  - visibleRatio: actualRange / axisRange. 클수록 같은 차이가 화면을 더 많이 채운다.
 *                  0.3 이상이면 같은 차이가 화면을 꽉 채워 "커 보임".
 *  - startsAtZero: 0 시작 여부
 *  - regularTicks: 눈금 간격 일정 여부
 *  - maxBarRatio / minBarRatio: 최대값/최소값의 막대 비율 (둘 다 클수록 차이가 부각)
 */
export type Impression = {
  actualRange: number
  actualMax: number
  actualMin: number
  axisRange: number
  visibleRatio: number
  startsAtZero: boolean
  regularTicks: boolean
  maxBarRatio: number
  minBarRatio: number
  /** 같은 차이가 화면에서 얼마나 크게 보이는지 0~1 보조 지표 (정답이 아닌 참고용) */
  emphasisScore: number
}

export function computeImpression(values: number[], axis: AxisConfig): Impression {
  if (values.length === 0) {
    throw new Error('values가 비어 있습니다.')
  }
  const check = validateAxisConfig(axis)
  if (!check.ok) {
    throw new Error(check.reason)
  }
  const actualMax = Math.max(...values)
  const actualMin = Math.min(...values)
  const actualRange = actualMax - actualMin
  const axisRange = axis.max - axis.min
  const visibleRatio = axisRange > 0 ? actualRange / axisRange : 0
  const maxBarRatio = valueToRatio(actualMax, axis)
  const minBarRatio = valueToRatio(actualMin, axis)
  // 강조 점수: 막대 높이 차이가 크고 축이 좁을수록 높다 (참고용 보조 지표)
  const emphasisScore = Math.max(0, Math.min(1, maxBarRatio - minBarRatio))
  return {
    actualRange,
    actualMax,
    actualMin,
    axisRange,
    visibleRatio,
    startsAtZero: startsAtZero(axis),
    regularTicks: hasRegularTicks(axis),
    maxBarRatio,
    minBarRatio,
    emphasisScore,
  }
}

/**
 * 두 축 설정 중 어느 쪽이 같은 차이를 더 크게 보이게 하는지 (사양서 8절 미션1 질문).
 * emphasisScore가 더 큰 쪽이 "차이를 더 크게 느끼게 한다".
 */
export function pickMoreEmphasized(
  values: number[],
  a: AxisConfig,
  b: AxisConfig,
): { id: 'a' | 'b' | 'tie'; aScore: number; bScore: number } {
  const ia = computeImpression(values, a)
  const ib = computeImpression(values, b)
  const diff = Math.abs(ia.emphasisScore - ib.emphasisScore)
  if (diff < 1e-6) return { id: 'tie', aScore: ia.emphasisScore, bScore: ib.emphasisScore }
  return ia.emphasisScore > ib.emphasisScore
    ? { id: 'a', aScore: ia.emphasisScore, bScore: ib.emphasisScore }
    : { id: 'b', aScore: ia.emphasisScore, bScore: ib.emphasisScore }
}
