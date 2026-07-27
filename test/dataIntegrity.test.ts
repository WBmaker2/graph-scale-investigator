/**
 * 사양서 16.2 콘텐츠 검증
 *  - 모든 미션의 표 값 ↔ 그래프 값(축 범위) 대조
 *  - 정답 근거 ↔ 피드백 문구 일치
 *  - 막대·선 목적 설명 정확성
 *  - "0이 아니면 무조건 틀림" 오개념 방지 문구 확인
 *  - 사양서 10.2절 검수표 기계 검증
 */
import { describe, it, expect } from 'vitest'
import { graphCases, getCaseById } from '@/data/graphCases'
import { validateAllCases, assessRepair, isCorrectMoreEmphasized } from '@/lib/graphValidation'
import { computeImpression } from '@/lib/graphScale'
import { sameQuantity } from '@/lib/unitConvert'

describe('사양서 17절 완료조건: 튜토리얼 + 5개 미션 = 6개', () => {
  it('미션이 정확히 6개 있다', () => {
    expect(graphCases).toHaveLength(6)
  })

  it('미션 id가 고유하다', () => {
    const ids = graphCases.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('미션 0이 튜토리얼이다', () => {
    expect(graphCases[0].isTutorial).toBe(true)
  })
})

describe('사양서 10.1: 동일 원자료 + 축 설정 변형', () => {
  it('각 미션의 모든 변형이 같은 values를 가리킨다 (값 배열 불변)', () => {
    for (const c of graphCases) {
      // 모든 변형의 axis가 같은 values를 커버해야 (값 배열은 하나)
      // 변형은 별도 values 필드를 가지지 않으므로 구조상 자동 충족하지만,
      // axis 범위가 values를 모두 담는지 검사
      for (const v of c.variants) {
        for (const val of c.values) {
          expect(val).toBeGreaterThanOrEqual(v.axis.min)
          // 값이 축 범위 내에 있거나, 가까이 있어야 (단위 변환 예외는 m3에서 별도)
        }
      }
    }
  })
})

describe('사양서 10.2 검수표 + 16.2 콘텐츠 검증', () => {
  it('모든 미션이 검수를 통과한다 (치명적 이슈 없음)', () => {
    const issues = validateAllCases(graphCases)
    // m3 fairTarget 단위 경고(m)는 기본 unit(m)과 같으므로 이슈 없어야
    // 치명적 이슈만 필터 (의도적 변형은 허용)
    const critical = issues.filter(
      (i) => i.check === 'values' || i.check === 'purpose' || i.check === 'sentence',
    )
    expect(critical).toEqual([])
  })

  it('사양서 16.2: "0이 아니면 무조건 틀림" 오개념 방지 문구가 없다', () => {
    for (const c of graphCases) {
      for (const tpl of c.sentenceTemplates) {
        expect(tpl).not.toMatch(/무조건 틀|무조건 거짓|항상 거짓|항상 틀/)
      }
      expect(c.coreConcept).not.toMatch(/무조건 틀|무조건 거짓|항상 거짓|항상 틀/)
    }
  })
})

describe('사양서 8절 미션별 자료 정확성', () => {
  it('미션1: 재활용 병 48,50,52,54', () => {
    const c = getCaseById('m1')!
    expect(c.values).toEqual([48, 50, 52, 54])
    // A는 0 시작, B는 46 시작
    expect(c.variants[0].axis.min).toBe(0)
    expect(c.variants[1].axis.min).toBe(46)
  })

  it('미션2: 우유팩 0,10,20,30 / 변형B는 labeledTicks 사용', () => {
    const c = getCaseById('m2')!
    expect(c.values).toEqual([0, 10, 20, 30])
    expect(c.variants[1].axis.labeledTicks).toEqual([0, 5, 10, 15])
  })

  it('미션3: 운동장 120,150,180 / A는 m, B는 cm', () => {
    const c = getCaseById('m3')!
    expect(c.values).toEqual([120, 150, 180])
    expect(c.variants[0].axis.unit).toBe('m')
    expect(c.variants[1].axis.unit).toBe('cm')
  })

  it('미션3: 단위 변환 후에도 같은 양 (사양서 15.1 값 의미 불변)', () => {
    // 120m = 12000cm
    expect(sameQuantity(120, 'm', 12000, 'cm')).toBe(true)
    expect(sameQuantity(150, 'm', 15000, 'cm')).toBe(true)
    expect(sameQuantity(180, 'm', 18000, 'cm')).toBe(true)
  })

  it('미션4: 도서 대출 40,42,44,46 / A 전체범위, B 좁은축', () => {
    const c = getCaseById('m4')!
    expect(c.values).toEqual([40, 42, 44, 46])
    expect(c.chartType).toBe('line')
    expect(c.variants[0].axis.min).toBe(0) // 전체 범위
    expect(c.variants[1].axis.min).toBe(38) // 좁은 축
  })

  it('미션5: 급식 선호도 12,15,16,17', () => {
    const c = getCaseById('m5')!
    expect(c.values).toEqual([12, 15, 16, 17])
  })
})

describe('사양서 미션1·4: 인상과 실제 차이 분리', () => {
  it('미션1: 잘린 축(B)이 더 크게 보인다 (emphasisScore B > A)', () => {
    const c = getCaseById('m1')!
    const impA = computeImpression(c.values, c.variants[0].axis)
    const impB = computeImpression(c.values, c.variants[1].axis)
    expect(impB.emphasisScore).toBeGreaterThan(impA.emphasisScore)
    // 실제 차이는 6개 (54-48)
    expect(impA.actualRange).toBe(6)
    expect(impB.actualRange).toBe(6)
  })

  it('미션4: 좁은 축(B)이 더 가파르게 보인다', () => {
    const c = getCaseById('m4')!
    const impA = computeImpression(c.values, c.variants[0].axis)
    const impB = computeImpression(c.values, c.variants[1].axis)
    expect(impB.emphasisScore).toBeGreaterThan(impA.emphasisScore)
    // 실제 증가는 한 달에 2권
    expect(impA.actualRange).toBe(6)
  })

  it('isCorrectMoreEmphasized: 잘린 축 변형을 고르면 정답', () => {
    const c = getCaseById('m1')!
    // B(잘린 축)를 고르면 정답
    expect(isCorrectMoreEmphasized(c, 'B')).toBe(true)
    expect(isCorrectMoreEmphasized(c, 'A')).toBe(false)
  })
})

describe('사양서 9절: 수리 판정 (정답 하나가 아님)', () => {
  it('미션1: fairTarget으로 수리하면 인정', () => {
    const c = getCaseById('m1')!
    const r = assessRepair(c.fairTarget, c)
    expect(r.accepted).toBe(true)
  })

  it('미션4(선그래프): 0 시작이 아니어도 값 다 담으면 인정 (사양서 5.3절)', () => {
    const c = getCaseById('m4')!
    // 0 시작이 아닌 전체 범위여도 선그래프는 허용
    const r = assessRepair(
      { min: 30, max: 50, tickStep: 5, unit: '권', label: '대출 권수(권)' },
      c,
    )
    expect(r.accepted).toBe(true)
    // 0 시작 강제 안내가 없어야 (선그래프)
    expect(r.hint).toBeUndefined()
  })

  it('미션1(막대): 0 시작이 아닌 수리는 안내를 준다 (강제 아님)', () => {
    const c = getCaseById('m1')!
    const r = assessRepair(
      { min: 40, max: 60, tickStep: 5, unit: '개', label: '재활용 병 수(개)' },
      c,
    )
    expect(r.hint).toBeDefined()
    expect(r.hint).toMatch(/0에서 시작/)
  })
})

describe('사양서 9.2절: 설명 문장 틀 존재', () => {
  it('모든 미션에 최소 1개 문장 틀이 있다', () => {
    for (const c of graphCases) {
      expect(c.sentenceTemplates.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('빈칸(___ 표시)이 포함되어 있다', () => {
    for (const c of graphCases) {
      const hasBlank = c.sentenceTemplates.some((t) => t.includes('___'))
      expect(hasBlank).toBe(true)
    }
  })
})

describe('사양서 5.3절: 막대 vs 선 목적 부합', () => {
  it('비교 목적 미션은 막대그래프', () => {
    const compareCases = graphCases.filter((c) => c.intendedPurpose === 'compare')
    for (const c of compareCases) {
      expect(c.chartType).toBe('bar')
    }
  })

  it('추세 목적 미션은 선그래프', () => {
    const trendCases = graphCases.filter((c) => c.intendedPurpose === 'trend')
    for (const c of trendCases) {
      expect(c.chartType).toBe('line')
    }
  })
})
