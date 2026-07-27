/**
 * 수사 진행 상태 관리 훅 (사양서 6.2절 상태 + 7.1절 5단계 흐름)
 *  - 새로고침 시 초기화 (사양서 6.1 저장: 기본 초기화, 복사만 제공)
 *  - 값 표 확인 없이 다음 단계로 못 넘어감 (사양서 18절 위험 대응)
 *  - state는 ref로도 추적하여 nextPhase가 항상 최신 상태를 기반으로 판정 (React 18 배치 안전)
 */
import { useCallback, useRef, useState } from 'react'
import type { InvestigationState, Phase, AxisConfig, GraphCase } from '@/types'

const PHASE_ORDER: Phase[] = ['observe', 'check-values', 'explain', 'repair', 'reflect']

function createInitialState(missionId: string): InvestigationState {
  return {
    missionId,
    phase: 'observe',
    selectedGraphId: undefined,
    valueTableOpened: false,
    selectedEvidence: [],
    repairedAxis: undefined,
    note: '',
    completed: false,
  }
}

/**
 * 다음 단계로 진행 가능한지 판정하는 순수 함수 (단위 테스트 가능).
 *  - observe → check-values: 항상 가능
 *  - check-values → explain: 값 표를 열었을 때만 (사양서 18절 위험 대응)
 *  - 마지막 단계: 더 진행 불가
 */
export function canAdvance(state: InvestigationState): { ok: boolean; reason?: string; next?: Phase } {
  const idx = PHASE_ORDER.indexOf(state.phase)
  if (idx < 0 || idx >= PHASE_ORDER.length - 1) {
    return { ok: false, reason: undefined }
  }
  if (state.phase === 'check-values' && !state.valueTableOpened) {
    return {
      ok: false,
      reason: '값 표를 먼저 열어 확인해요. 그래프만 보고 넘어가면 안 돼요.',
    }
  }
  return { ok: true, next: PHASE_ORDER[idx + 1] }
}

export function useInvestigationState(mission: GraphCase) {
  const [state, setState] = useState<InvestigationState>(() => createInitialState(mission.id))
  // 최신 state를 ref로 추적 — nextPhase가 클로저 stale 없이 판정 (React 18 배치 안전)
  const stateRef = useRef(state)
  stateRef.current = state

  /** 미션을 바꾸면 상태 초기화 */
  const resetForMission = useCallback((newMission: GraphCase) => {
    setState(createInitialState(newMission.id))
  }, [])

  const setPhase = useCallback((phase: Phase) => {
    setState((s) => ({ ...s, phase }))
  }, [])

  /** 값 표를 열었음을 기록 (다음 단계 진입 조건) */
  const markValueTableOpened = useCallback(() => {
    setState((s) => ({ ...s, valueTableOpened: true }))
  }, [])

  /** '차이가 더 크게 보이는 그래프' 선택 */
  const selectGraph = useCallback((variantId: string) => {
    setState((s) => ({ ...s, selectedGraphId: variantId }))
  }, [])

  /** 근거 단서 토글 */
  const toggleEvidence = useCallback((evidenceId: string) => {
    setState((s) => {
      const has = s.selectedEvidence.includes(evidenceId)
      const next = has
        ? s.selectedEvidence.filter((e) => e !== evidenceId)
        : [...s.selectedEvidence, evidenceId]
      return { ...s, selectedEvidence: next }
    })
  }, [])

  /** 축 수리 결과 저장 */
  const setRepairedAxis = useCallback((axis: AxisConfig) => {
    setState((s) => ({ ...s, repairedAxis: axis }))
  }, [])

  /** 설명 문장 저장 */
  const setNote = useCallback((note: string) => {
    setState((s) => ({ ...s, note }))
  }, [])

  /**
   * 다음 단계로 이동. 순수 함수 canAdvance로 판정한 뒤 setState 적용.
   * 반환값은 실제 진행 결과 (React 18 배치에서도 정확).
   */
  const nextPhase = useCallback((): { ok: boolean; reason?: string } => {
    const decision = canAdvance(stateRef.current)
    if (decision.ok && decision.next) {
      setState((s) => ({ ...s, phase: decision.next! }))
    }
    return { ok: decision.ok, reason: decision.reason }
  }, [])

  /** 미션 완료 표시 */
  const complete = useCallback(() => {
    setState((s) => ({ ...s, completed: true }))
  }, [])

  return {
    state,
    resetForMission,
    setPhase,
    markValueTableOpened,
    selectGraph,
    toggleEvidence,
    setRepairedAxis,
    setNote,
    nextPhase,
    complete,
  }
}
