/**
 * 수사 기록 카드 (사양서 11.1절 결과 카드, 6.1절 저장: 텍스트 복사만)
 *  - 학생이 확인한 단서, 고친 항목, 완성한 문장 표시
 *  - 텍스트 복사 기능 (사양서 6.1)
 *  - 낙인 없는 회고 문구 (사양서 12절)
 */
import { useState } from 'react'
import type { GraphCase, InvestigationState } from '@/types'
import { summarizeEvidence } from '@/data/feedbackRules'

type Props = {
  caseData: GraphCase
  state: InvestigationState
  onPrev: () => void
  onNext: () => void
  isLast: boolean
}

export function ResultCard({ caseData, state, onPrev, onNext, isLast }: Props) {
  const [copied, setCopied] = useState(false)
  const [showTextFallback, setShowTextFallback] = useState(false)

  const lines = [
    `[수사 기록] ${caseData.title}`,
    `핵심 개념: ${caseData.coreConcept}`,
    summarizeEvidence(state, caseData),
    state.selectedGraphId
      ? `차이가 더 크게 보인 그래프: ${state.selectedGraphId}`
      : '선택한 그래프: 없음',
    state.repairedAxis
      ? `고친 축: ${state.repairedAxis.min}~${state.repairedAxis.max}, 한 칸 ${state.repairedAxis.tickStep}${state.repairedAxis.unit}`
      : '고친 축: 없음',
    `설명: ${state.note || '(미작성)'}`,
  ]
  const text = lines.join('\n')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 클립보드 미지원/거부 시 — 텍스트를 선택 가능한 영역으로 노출해 수동 복사 유도
      setCopied(false)
      setShowTextFallback(true)
    }
  }

  return (
    <section className="gi-result-card" aria-labelledby="result-heading">
      <h3 id="result-heading" className="gi-section-title">
        수사 기록 카드
      </h3>
      <p className="gi-result-cheer">
        수사를 마쳤어요! 그래프의 모양만 보지 않고 단서를 찾은 점이 훌륭합니다.
      </p>

      <div className="gi-result-body">
        <div className="gi-result-row">
          <span className="gi-result-label">핵심 개념</span>
          <span className="gi-result-value">{caseData.coreConcept}</span>
        </div>
        <div className="gi-result-row">
          <span className="gi-result-label">확인한 단서</span>
          <span className="gi-result-value">
            {state.selectedEvidence.length === 0
              ? '없음'
              : state.selectedEvidence
                  .map(
                    (id) =>
                      caseData.evidencePrompts.find((e) => e.id === id)?.label ?? id,
                  )
                  .join(', ')}
          </span>
        </div>
        <div className="gi-result-row">
          <span className="gi-result-label">고친 축</span>
          <span className="gi-result-value">
            {state.repairedAxis
              ? `${state.repairedAxis.min}~${state.repairedAxis.max}, 한 칸 ${state.repairedAxis.tickStep}${state.repairedAxis.unit}`
              : '고치지 않음'}
          </span>
        </div>
        <div className="gi-result-row gi-result-note-row">
          <span className="gi-result-label">내 설명</span>
          <span className="gi-result-value">{state.note || '(설명을 작성하지 않았어요)'}</span>
        </div>
      </div>

      <div className="gi-result-actions">
        <button type="button" className="gi-secondary-btn" onClick={handleCopy}>
          {copied ? '✓ 복사됨' : '기록 복사'}
        </button>
        <span className="gi-sr-only" role="status" aria-live="polite">
          {copied ? '수사 기록이 클립보드에 복사되었습니다.' : ''}
        </span>
        {showTextFallback && (
          <label className="gi-copy-fallback">
            복사가 안 되면 아래 글을 직접 드래그해서 복사하세요.
            <textarea readOnly value={text} rows={6} onFocus={(e) => e.currentTarget.select()} />
          </label>
        )}
      </div>

      <div className="gi-phase-nav gi-result-nav">
        <button type="button" className="gi-link-btn" onClick={onPrev}>
          ← 이전 미션
        </button>
        <button type="button" className="gi-primary-btn" onClick={onNext}>
          {isLast ? '수사 종료 →' : '다음 미션 →'}
        </button>
      </div>
    </section>
  )
}
