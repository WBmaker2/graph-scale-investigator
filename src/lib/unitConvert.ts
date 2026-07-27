/**
 * 단위 변환 순수 함수 (사양서 8절 미션3, 15.1절 검증 "단위 변환은 값의 의미를 바꾸지 않는다").
 * 길이(m/cm/mm) 변환을 다룬다. 값의 의미(실제 양)는不变하고 표시값만 바뀐다.
 */

export type LengthUnit = 'm' | 'cm' | 'mm'

/** 한 단위가 기준 단위(mm)로 환산된 값 */
const TO_MM: Record<LengthUnit, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
}

/** 두 단위 간 변환 배율. convertUnit(120, 'm', 'cm') === 12000 */
export function convertUnit(value: number, from: LengthUnit, to: LengthUnit): number {
  if (!TO_MM[from]) throw new Error(`알 수 없는 단위: ${from}`)
  if (!TO_MM[to]) throw new Error(`알 수 없는 단위: ${to}`)
  const inMm = value * TO_MM[from]
  return inMm / TO_MM[to]
}

/**
 * 두 (값, 단위) 쌍이 같은 양을 가리키는지 (사양서 8절 미션3 핵심 - 단위가 달라도 비교 관계는 같다).
 * convertUnit(120, 'm', 'cm') 과 비교해 12000과 같은지.
 */
export function sameQuantity(
  valueA: number,
  unitA: LengthUnit,
  valueB: number,
  unitB: LengthUnit,
): boolean {
  return Math.abs(convertUnit(valueA, unitA, 'mm') - convertUnit(valueB, unitB, 'mm')) < 1e-6
}

/** 단위 변환이 "배율만" 바뀌는지 검증 (사양서 15.1 - 값 의미 불변). */
export function isUnitConversionValid(
  value: number,
  from: LengthUnit,
  to: LengthUnit,
): boolean {
  // 다시 원래 단위로 돌아왔을 때 같아야 함
  const roundTrip = convertUnit(convertUnit(value, from, to), to, from)
  return Math.abs(roundTrip - value) < 1e-6
}
