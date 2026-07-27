/**
 * 사양서 16.1 단위 검증 - 축 계산·눈금·값 위치·단위 변환·불규칙 눈금 안내
 */
import { describe, it, expect } from 'vitest'
import {
  getTickValue,
  validateAxisConfig,
  getTickValues,
  valueToRatio,
  valueToPixel,
  startsAtZero,
  hasRegularTicks,
  computeImpression,
  pickMoreEmphasized,
} from '@/lib/graphScale'
import { convertUnit, sameQuantity, isUnitConversionValid } from '@/lib/unitConvert'
import type { AxisConfig } from '@/types'

describe('getTickValue (사양서 15.1)', () => {
  it('min에서 시작해 tickStep 간격으로 눈금 값을 계산한다', () => {
    expect(getTickValue(0, 2, 3)).toBe(6)
    expect(getTickValue(46, 1, 4)).toBe(50)
    expect(getTickValue(0, 5, 2)).toBe(10)
  })

  it('tickStep이 0 이하이면 에러를 던진다 (사양서 15.1 검증: tickStep > 0)', () => {
    expect(() => getTickValue(0, 0, 1)).toThrow()
    expect(() => getTickValue(0, -1, 1)).toThrow()
  })

  it('음수 index를 거부한다', () => {
    expect(() => getTickValue(0, 2, -1)).toThrow()
  })
})

describe('validateAxisConfig', () => {
  it('유효한 축은 ok: true', () => {
    const axis: AxisConfig = { min: 0, max: 60, tickStep: 10, unit: '개', label: 'x' }
    expect(validateAxisConfig(axis)).toEqual({ ok: true })
  })

  it('max <= min이면 거부한다 (사양서 15.1 검증: max > min)', () => {
    const axis: AxisConfig = { min: 50, max: 50, tickStep: 5, unit: '개', label: 'x' }
    const r = validateAxisConfig(axis)
    expect(r.ok).toBe(false)
  })

  it('tickStep <= 0이면 거부한다', () => {
    const axis: AxisConfig = { min: 0, max: 50, tickStep: 0, unit: '개', label: 'x' }
    expect(validateAxisConfig(axis).ok).toBe(false)
  })
})

describe('getTickValues', () => {
  it('tickStep 간격으로 눈금 배열을 만든다', () => {
    const axis: AxisConfig = { min: 0, max: 60, tickStep: 10, unit: '개', label: 'x' }
    expect(getTickValues(axis)).toEqual([0, 10, 20, 30, 40, 50, 60])
  })

  it('labeledTicks가 있으면 그것을 정렬해 반환한다 (미션2 중간눈금 변형)', () => {
    const axis: AxisConfig = {
      min: 0,
      max: 30,
      tickStep: 5,
      unit: '개',
      label: 'x',
      labeledTicks: [0, 5, 10, 15],
    }
    expect(getTickValues(axis)).toEqual([0, 5, 10, 15])
  })
})

describe('valueToRatio (잘린 축 효과 - 사양서 미션1 핵심)', () => {
  it('0 시작 축에서 값 50/60 ≈ 0.833', () => {
    const axis: AxisConfig = { min: 0, max: 60, tickStep: 10, unit: '개', label: 'x' }
    expect(valueToRatio(50, axis)).toBeCloseTo(0.8333, 3)
  })

  it('잘린 축(46 시작)에서 값 50은 (50-46)/14 ≈ 0.286 (정직축보다 낮게 시작 → 막대가 더 큼)', () => {
    const axis: AxisConfig = { min: 46, max: 60, tickStep: 1, unit: '개', label: 'x' }
    expect(valueToRatio(50, axis)).toBeCloseTo(0.2857, 3)
  })

  it('축 범위 밖 값은 0~1로 클램프', () => {
    const axis: AxisConfig = { min: 0, max: 10, tickStep: 2, unit: '개', label: 'x' }
    expect(valueToRatio(-5, axis)).toBe(0)
    expect(valueToRatio(20, axis)).toBe(1)
  })

  it('valueToPixel은 ratio * chartHeight', () => {
    const axis: AxisConfig = { min: 0, max: 100, tickStep: 20, unit: '개', label: 'x' }
    expect(valueToPixel(50, axis, 200)).toBeCloseTo(100, 5)
  })
})

describe('startsAtZero / hasRegularTicks', () => {
  it('startsAtZero', () => {
    expect(startsAtZero({ min: 0, max: 10, tickStep: 2, unit: 'x', label: 'y' })).toBe(true)
    expect(startsAtZero({ min: 46, max: 60, tickStep: 1, unit: 'x', label: 'y' })).toBe(false)
  })

  it('일정한 간격 눈금은 regular', () => {
    expect(hasRegularTicks({ min: 0, max: 60, tickStep: 10, unit: 'x', label: 'y' })).toBe(true)
  })

  it('불규칙 labeledTicks은 irregular (사양서 5.4절: 0,5,10,20 구분)', () => {
    expect(
      hasRegularTicks({
        min: 0,
        max: 30,
        tickStep: 5,
        unit: 'x',
        label: 'y',
        labeledTicks: [0, 5, 10, 20],
      }),
    ).toBe(false)
  })
})

describe('computeImpression (사양서 15.2)', () => {
  const values = [48, 50, 52, 54]

  it('실제 최대-최소 차이를 계산한다', () => {
    const fair: AxisConfig = { min: 0, max: 60, tickStep: 10, unit: '개', label: 'x' }
    const imp = computeImpression(values, fair)
    expect(imp.actualRange).toBe(6) // 54-48
    expect(imp.actualMax).toBe(54)
    expect(imp.actualMin).toBe(48)
    expect(imp.startsAtZero).toBe(true)
  })

  it('잘린 축은 visibleRatio가 더 크다 (같은 차이가 화면을 더 많이 채움)', () => {
    const fair: AxisConfig = { min: 0, max: 60, tickStep: 10, unit: '개', label: 'x' }
    const cut: AxisConfig = { min: 46, max: 60, tickStep: 1, unit: '개', label: 'x' }
    const impFair = computeImpression(values, fair)
    const impCut = computeImpression(values, cut)
    expect(impCut.visibleRatio).toBeGreaterThan(impFair.visibleRatio)
    expect(impCut.emphasisScore).toBeGreaterThan(impFair.emphasisScore)
  })
})

describe('pickMoreEmphasized (사양서 미션1 질문)', () => {
  it('잘린 축이 더 크게 보인다고 판정', () => {
    const values = [48, 50, 52, 54]
    const fair: AxisConfig = { min: 0, max: 60, tickStep: 10, unit: '개', label: 'x' }
    const cut: AxisConfig = { min: 46, max: 60, tickStep: 1, unit: '개', label: 'x' }
    const result = pickMoreEmphasized(values, fair, cut)
    expect(result.id).toBe('b') // 잘린 축(b)이 더 강조
  })
})

describe('단위 변환 (사양서 8절 미션3, 15.1 - 값 의미 불변)', () => {
  it('m → cm 변환: 120m = 12000cm', () => {
    expect(convertUnit(120, 'm', 'cm')).toBe(12000)
    expect(convertUnit(150, 'm', 'cm')).toBe(15000)
  })

  it('cm → mm 변환', () => {
    expect(convertUnit(5, 'cm', 'mm')).toBe(50)
  })

  it('같은 양 판정: 120m 와 12000cm는 같은 양 (사양서 미션3 핵심)', () => {
    expect(sameQuantity(120, 'm', 12000, 'cm')).toBe(true)
    expect(sameQuantity(120, 'm', 120, 'cm')).toBe(false)
  })

  it('왕복 변환으로 값 의미 불변 검증', () => {
    expect(isUnitConversionValid(180, 'm', 'cm')).toBe(true)
    expect(isUnitConversionValid(45, 'cm', 'mm')).toBe(true)
  })
})
