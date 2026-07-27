/**
 * 근거 패널 + 설명 문장 조립 (사양서 7.2절 근거 형광펜, 9.2절 문장 틀)
 *  - 학생이 근거 단서를 선택 (사양서 5.1절 읽기 절차)
 *  - 문장 틀을 골라 빈칸 채우기 (사양서 9.2절)
 *  - 선택 근거에 따라 부분 인정 피드백 (사양서 9.1절)
 */
import { useState } from 'react'
import type { GraphCase, InvestigationState } from '@/types'
import { getEvidenceFeedback } from '@/data/feedbackRules'

type Props = {
  caseData: GraphCase
  state: InvestigationState
  onToggleEvidence: (id: string) => void
  onNoteChange: (note: string) => void
}

export function EvidencePanel({ caseData, state, onToggleEvidence, onNoteChange }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const template = caseData.sentenceTemplates[selectedTemplate] ?? ''
  const blankCount = (template.match(/___/g) ?? []).length
  const [blanks, setBlanks] = useState<string[]>([])

  const handleBlankChange = (idx: number, value: string) => {
    setBlanks((prev) => {
      const next = [...prev]
      next[idx] = value
      // 조립된 문장을 note로 저장
      let assembled = template
      next.forEach((b) => {
        assembled = assembled.replace('___', b || '___')
      })
      onNoteChange(assembled)
      return next
    })
  }

  const handleTemplateChange = (idx: number) => {
    setSelectedTemplate(idx)
    setBlanks([])
    onNoteChange(caseData.sentenceTemplates[idx])
  }

  const feedback = getEvidenceFeedback(state, caseData)

  return (
    <section className="gi-evidence-panel" aria-labelledby="evidence-heading">
      <h3 id="evidence-heading" className="gi-section-title">
        근거 모으기
      </h3>
      <p className="gi-section-desc">
        확인한 단서에 형광펜을 치세요. 그래프만 보지 않고 실제 값·축·단위·눈금을 찾는 게 수사예요.
      </p>

      <ul className="gi-evidence-list" role="group" aria-label="근거 단서 선택">
        {caseData.evidencePrompts.map((ev) => {
          const checked = state.selectedEvidence.includes(ev.id)
          return (
            <li key={ev.id}>
              <label className={`gi-evidence-item ${checked ? 'gi-evidence-on' : ''}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleEvidence(ev.id)}
                />
                <span className="gi-evidence-label">{ev.label}</span>
                {checked && (
                  <span className="gi-evidence-explain">{ev.explanation}</span>
                )}
              </label>
            </li>
          )
        })}
      </ul>

      <div
        className={`gi-evidence-feedback gi-feedback-${feedback.level}`}
        role="status"
        aria-live="polite"
      >
        {feedback.message}
      </div>

      <div className="gi-sentence-builder">
        <h4 className="gi-subsection-title">설명 문장 완성하기</h4>
        <div className="gi-template-row" role="radiogroup" aria-label="문장 틀 선택">
          {caseData.sentenceTemplates.map((_, i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selectedTemplate === i}
              className={`gi-template-btn ${selectedTemplate === i ? 'gi-template-on' : ''}`}
              onClick={() => handleTemplateChange(i)}
            >
              틀 {i + 1}
            </button>
          ))}
        </div>

        <div className="gi-sentence-fill">
          {template.split('___').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <input
                  type="text"
                  className="gi-blank-input"
                  value={blanks[i] ?? ''}
                  onChange={(e) => handleBlankChange(i, e.target.value)}
                  placeholder={`빈칸 ${i + 1}`}
                  aria-label={`빈칸 ${i + 1}`}
                  style={{ width: `${Math.max(60, (blanks[i]?.length ?? 4) * 12 + 40)}px` }}
                />
              )}
            </span>
          ))}
          <span className="gi-blank-count" aria-hidden="true">
            ({blankCount}개 빈칸)
          </span>
        </div>
      </div>
    </section>
  )
}
