/**
 * 축 수리 패널 (사양서 11.1절 "축 수리 화면", 7.2절)
 *  - 시작점·최댓값·눈금 간격·단위 입력
 *  - 입력 결과를 즉시 미리보기 차트로 표시 (사양서 12절 애니메이션은 짧은 전환만)
 *  - assessRepair로 부분 인정 피드백 (사양서 9절)
 */
import { useState, useMemo } from 'react'
import type { GraphCase, AxisConfig, GraphVariant } from '@/types'
import { assessRepair } from '@/lib/graphValidation'
import { InvestigationChart } from './InvestigationChart'

type Props = {
  caseData: GraphCase
  onRepaired: (axis: AxisConfig) => void
}

export function AxisRepairPanel({ caseData, onRepaired }: Props) {
  // 입력 시작값은 watch 변형의 설정에서 가져와 학생이 고치게
  const watchVariant = caseData.variants.find((v) => v.tag === 'watch') ?? caseData.variants[0]
  const [min, setMin] = useState(String(watchVariant.axis.min))
  const [max, setMax] = useState(String(watchVariant.axis.max))
  const [tickStep, setTickStep] = useState(String(watchVariant.axis.tickStep))
  const [unit, setUnit] = useState(caseData.unit)
  const [submitted, setSubmitted] = useState(false)

  const repaired: AxisConfig = useMemo(
    () => ({
      min: Number(min) || 0,
      max: Number(max) || 0,
      tickStep: Number(tickStep) || 1,
      unit,
      label: caseData.valueAxisLabel,
    }),
    [min, max, tickStep, unit, caseData.valueAxisLabel],
  )

  const assessment = useMemo(
    () => (submitted ? assessRepair(repaired, caseData) : null),
    [submitted, repaired, caseData],
  )

  const handleApply = () => {
    setSubmitted(true)
    onRepaired(repaired)
  }

  const previewVariant: GraphVariant = {
    id: 'repair-preview',
    displayName: '내가 고친 그래프',
    tag: 'fair',
    axis: repaired,
  }

  return (
    <section className="gi-repair-panel" aria-labelledby="repair-heading">
      <h3 id="repair-heading" className="gi-section-title">
        공정한 그래프로 고치기
      </h3>
      <p className="gi-section-desc">
        시작점·끝값·눈금 한 칸·단위를 바꿔 보세요. 막대그래프는 0에서 시작하면 양 비교에 좋아요.
        (선그래프는 목적에 따라 다를 수 있어요.)
      </p>

      <div className="gi-repair-grid">
        <fieldset className="gi-repair-form">
          <legend className="gi-sr-only">축 설정 입력</legend>
          <label className="gi-field">
            <span className="gi-field-label">시작값</span>
            <input
              type="number"
              name="axis-min"
              autoComplete="off"
              className="gi-field-input"
              value={min}
              onChange={(e) => {
                setMin(e.target.value)
                setSubmitted(false)
              }}
              inputMode="numeric"
            />
          </label>
          <label className="gi-field">
            <span className="gi-field-label">끝값</span>
            <input
              type="number"
              name="axis-max"
              autoComplete="off"
              className="gi-field-input"
              value={max}
              onChange={(e) => {
                setMax(e.target.value)
                setSubmitted(false)
              }}
              inputMode="numeric"
            />
          </label>
          <label className="gi-field">
            <span className="gi-field-label">눈금 한 칸</span>
            <input
              type="number"
              name="axis-tickstep"
              autoComplete="off"
              className="gi-field-input"
              value={tickStep}
              onChange={(e) => {
                setTickStep(e.target.value)
                setSubmitted(false)
              }}
              inputMode="numeric"
              min="1"
            />
          </label>
          <label className="gi-field">
            <span className="gi-field-label">단위</span>
            <select
              className="gi-field-input"
              autoComplete="off"
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value)
                setSubmitted(false)
              }}
            >
              <option value={caseData.unit}>{caseData.unit}</option>
              {/* 미션3 단위 변환 옵션 */}
              {caseData.id === 'm3' && <option value="cm">cm</option>}
            </select>
          </label>

          <button type="button" className="gi-primary-btn" onClick={handleApply}>
            이 설정으로 고치기
          </button>
        </fieldset>

        <div className="gi-repair-preview">
          <InvestigationChart
            variant={previewVariant}
            caseData={caseData}
            showValueLabels
            showActualDiff
          />
        </div>
      </div>

      {assessment && (
        <div
          className={`gi-repair-feedback ${assessment.accepted ? 'gi-feedback-ok' : 'gi-feedback-hint'}`}
          role="status"
        >
          <p className="gi-feedback-status">
            {assessment.accepted ? '✓ 공정한 표현이에요' : 'ℹ 다시 살펴볼까요?'}
          </p>
          <ul className="gi-feedback-reasons">
            {assessment.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          {assessment.hint && <p className="gi-feedback-hint-text">{assessment.hint}</p>}
        </div>
      )}
    </section>
  )
}
