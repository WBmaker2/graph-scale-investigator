/**
 * 최상위 앱 (사양서 7.1절 전체 흐름)
 *  - 시작 화면 → 미션 화면 → 결과(=미션 종료 후 시작 화면 복귀)
 *  - 서버 없이 브라우저에서만 동작 (사양서 6.1)
 */
import { useState } from 'react'
import { graphCases } from '@/data/graphCases'
import { StartScreen } from './StartScreen'
import { MissionScreen } from './MissionScreen'

type View = { kind: 'start' } | { kind: 'mission'; index: number }

export function GraphInvestigatorApp() {
  const [view, setView] = useState<View>({ kind: 'start' })

  if (view.kind === 'start') {
    return <StartScreen onStart={(i) => setView({ kind: 'mission', index: i })} />
  }

  const caseData = graphCases[view.index]
  if (!caseData) {
    setView({ kind: 'start' })
    return null
  }

  const goNext = () => {
    if (view.index < graphCases.length - 1) {
      setView({ kind: 'mission', index: view.index + 1 })
    } else {
      // 마지막 미션 종료 → 시작 화면으로 (사양서 6.1 저장 없음)
      setView({ kind: 'start' })
    }
  }
  const goPrev = () => {
    if (view.index > 0) {
      setView({ kind: 'mission', index: view.index - 1 })
    }
  }

  return (
    <MissionScreen
      // key를 바꾸어 미션 전환 시 상태 초기화 (useInvestigationState가 미션별 새 인스턴스)
      key={caseData.id}
      caseData={caseData}
      missionIndex={view.index}
      totalMissions={graphCases.length}
      onPrev={goPrev}
      onNext={goNext}
      onExit={() => setView({ kind: 'start' })}
    />
  )
}
