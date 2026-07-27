/**
 * 그래프 비교 패널 (사양서 11.2절 중앙 영역, 7.2절 수사 도구)
 *  - 두 변형 그래프를 나란히 표시
 *  - 수사 도구 토글: 실제 차이 표시 / 값 라벨 / 0으로 보기 등
 *  - 모바일에서는 세로 흐름으로 전환 (사양서 11.2절)
 */
import { useState } from 'react'
import type { GraphCase } from '@/types'
import { InvestigationChart } from './InvestigationChart'

type Props = {
  caseData: GraphCase
  selectedVariantId?: string
  onSelectVariant?: (id: string) => void
  /** observe 단계에서 선택 가능 여부 */
  selectable?: boolean
  /** 강제로 0 시작 축으로 미리보기 (수사 도구 "축 0으로 보기") */
  forceZeroStart?: boolean
}

export function GraphComparePanel({
  caseData,
  selectedVariantId,
  onSelectVariant,
  selectable = false,
  forceZeroStart = false,
}: Props) {
  const [showValueLabels, setShowValueLabels] = useState(true)
  const [showActualDiff, setShowActualDiff] = useState(false)

  return (
    <section className="gi-compare-panel" aria-labelledby="compare-heading">
      <div className="gi-compare-header">
        <h3 id="compare-heading" className="gi-compare-title">
          두 그래프 비교
        </h3>
        <div className="gi-tool-row" role="group" aria-label="수사 도구">
          <button
            type="button"
            className={`gi-tool-chip ${showValueLabels ? 'gi-tool-chip-on' : ''}`}
            aria-pressed={showValueLabels}
            onClick={() => setShowValueLabels((v) => !v)}
          >
            값 표시
          </button>
          <button
            type="button"
            className={`gi-tool-chip ${showActualDiff ? 'gi-tool-chip-on' : ''}`}
            aria-pressed={showActualDiff}
            onClick={() => setShowActualDiff((v) => !v)}
          >
            실제 차이 표시
          </button>
        </div>
      </div>

      <div className="gi-compare-grid">
        {caseData.variants.map((v) => {
          // forceZeroStart 도구: min을 0으로 강제 (수사 도구 "축 0으로 보기")
          const variant = forceZeroStart
            ? { ...v, axis: { ...v.axis, min: 0 } }
            : v
          return (
            <InvestigationChart
              key={v.id}
              variant={variant}
              caseData={caseData}
              showValueLabels={showValueLabels}
              showActualDiff={showActualDiff}
              selected={selectable && selectedVariantId === v.id}
              onSelect={selectable ? onSelectVariant : undefined}
            />
          )
        })}
      </div>

      {selectable && (
        <p className="gi-compare-prompt">
          어느 쪽이 차이를 <strong>더 크게</strong> 보이게 하나요? 그래프를 선택해 보세요.
        </p>
      )}
    </section>
  )
}
