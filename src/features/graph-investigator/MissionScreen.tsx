/**
 * 미션 화면 컨테이너 (사양서 7.1절 5단계 흐름, 11.1절 미션 화면)
 *  observe → check-values → explain → repair → reflect
 *  - 값 표 확인 없이 check-values → explain 으로 못 넘어감 (사양서 18절)
 *  - 각 단계마다 수사 도구 노출 (사양서 7.2절)
 *  - 모바일: 자료→그래프→근거→수정 세로 흐름 (사양서 11.2절)
 */
import { useEffect, useRef, useState } from 'react'
import type { GraphCase } from '@/types'
import { useInvestigationState } from './useInvestigationState'
import { GraphComparePanel } from './GraphComparePanel'
import { ValueTable } from './ValueTable'
import { EvidencePanel } from './EvidencePanel'
import { AxisRepairPanel } from './AxisRepairPanel'
import { ResultCard } from './ResultCard'

type Props = {
  caseData: GraphCase
  missionIndex: number
  totalMissions: number
  onPrev: () => void
  onNext: () => void
  onExit: () => void
}

const PHASE_LABELS: Record<string, string> = {
  observe: '1. 그래프 관찰',
  'check-values': '2. 실제 값 확인',
  explain: '3. 근거·설명',
  repair: '4. 축 고치기',
  reflect: '5. 수사 기록',
}

export function MissionScreen({
  caseData,
  missionIndex,
  totalMissions,
  onPrev,
  onNext,
  onExit,
}: Props) {
  const {
    state,
    markValueTableOpened,
    selectGraph,
    toggleEvidence,
    setRepairedAxis,
    setNote,
    nextPhase,
    complete,
  } = useInvestigationState(caseData)

  const [valueTableOpen, setValueTableOpen] = useState(false)
  const [zeroStartTool, setZeroStartTool] = useState(false)
  const [gateMsg, setGateMsg] = useState<string | null>(null)
  const phaseRef = useRef<HTMLOListElement>(null)

  // 단계가 바뀌면 단계 표시기로 부드럽게 스크롤 (prefers-reduced-motion 존중은 브라우저가 처리)
  useEffect(() => {
    phaseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [state.phase])

  const handleNextPhase = () => {
    const r = nextPhase()
    if (!r.ok) {
      setGateMsg(r.reason ?? null)
    } else {
      setGateMsg(null)
      if (state.phase === 'repair') {
        complete()
      }
    }
  }

  const toggleValueTable = () => {
    const next = !valueTableOpen
    setValueTableOpen(next)
    if (next) {
      markValueTableOpened()
      setGateMsg(null)
    }
  }

  const isLastPhase = state.phase === 'reflect'

  return (
    <div className="gi-mission">
      <header className="gi-mission-header">
        <button type="button" className="gi-link-btn" onClick={onExit}>
          ← 미션 목록
        </button>
        <div className="gi-mission-progress" role="status" aria-label="미션 진행 상태">
          미션 {missionIndex + 1} / {totalMissions}
        </div>
      </header>

      <div className="gi-mission-title-block">
        <h2 className="gi-mission-title">{caseData.title}</h2>
        <p className="gi-mission-story">{caseData.story}</p>
      </div>

      {/* 단계 표시기 */}
      <ol ref={phaseRef} className="gi-phase-indicator" aria-label="수사 단계">
        {Object.entries(PHASE_LABELS).map(([key, label]) => (
          <li
            key={key}
            className={`gi-phase-dot ${state.phase === key ? 'gi-phase-active' : ''}`}
            aria-current={state.phase === key ? 'step' : undefined}
          >
            {label}
          </li>
        ))}
      </ol>

      {/* 값 표 - 모든 단계에서 접근 가능 (사양서 7.2절 "값 보기") */}
      <ValueTable caseData={caseData} opened={valueTableOpen} onToggle={toggleValueTable} />

      {/* 단계별 본문 */}
      <div className="gi-phase-body">
        {(state.phase === 'observe' || state.phase === 'check-values') && (
          <>
            <div className="gi-tool-row" role="group" aria-label="수사 도구">
              <button
                type="button"
                className={`gi-tool-chip ${zeroStartTool ? 'gi-tool-chip-on' : ''}`}
                aria-pressed={zeroStartTool}
                onClick={() => setZeroStartTool((v) => !v)}
              >
                축 0으로 보기
              </button>
            </div>
            <GraphComparePanel
              caseData={caseData}
              selectable={state.phase === 'observe'}
              selectedVariantId={state.selectedGraphId}
              onSelectVariant={selectGraph}
              forceZeroStart={zeroStartTool}
            />
            {state.phase === 'observe' && (
              <p
                className={`gi-observe-hint ${state.selectedGraphId ? 'gi-hint-done' : ''}`}
                aria-live="polite"
              >
                {state.selectedGraphId ? (
                  <>✓ {state.selectedGraphId}번 그래프를 골랐어요. 이제 실제 값을 확인하러 가요.</>
                ) : (
                  <>두 그래프를 살펴보고, 차이가 더 크게 보이는 쪽을 골라보세요.</>
                )}
              </p>
            )}
            {state.phase === 'check-values' && (
              <p className="gi-check-values-prompt">
                그래프만 보지 말고, 위 <strong>값 표</strong>를 열어 실제 숫자를 확인하세요.
                최댓값과 최솟값의 차이가 몇인지 직접 계산해 보세요.
              </p>
            )}
          </>
        )}

        {state.phase === 'explain' && (
          <>
            <GraphComparePanel caseData={caseData} />
            <EvidencePanel
              caseData={caseData}
              state={state}
              onToggleEvidence={toggleEvidence}
              onNoteChange={setNote}
            />
          </>
        )}

        {state.phase === 'repair' && (
          <>
            <AxisRepairPanel caseData={caseData} onRepaired={setRepairedAxis} />
          </>
        )}

        {state.phase === 'reflect' && (
          <ResultCard
            caseData={caseData}
            state={state}
            onPrev={onPrev}
            onNext={onNext}
            isLast={missionIndex === totalMissions - 1}
          />
        )}
      </div>

      {/* 단계 이동 */}
      {!isLastPhase && (
        <div className="gi-phase-nav gi-phase-nav-sticky">
          {gateMsg && (
            <p className="gi-gate-msg" role="alert">
              {gateMsg}
            </p>
          )}
          <button type="button" className="gi-link-btn" onClick={onPrev} disabled={missionIndex === 0}>
            이전 미션
          </button>
          <button type="button" className="gi-primary-btn" onClick={handleNextPhase}>
            다음 단계로 →
          </button>
        </div>
      )}
    </div>
  )
}
