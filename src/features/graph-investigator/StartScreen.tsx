/**
 * 시작 화면 + 업데이트 내역 (사양서 11.1절, 11.3절)
 *  - 제목, 수사 안내, 학년·수업 시간 안내
 *  - 업데이트 내역 버튼 (사양서 11.3절)
 */
import { useState } from 'react'
import { graphCases } from '@/data/graphCases'

type Props = {
  onStart: (missionIndex: number) => void
}

export function StartScreen({ onStart }: Props) {
  const [showUpdates, setShowUpdates] = useState(false)

  return (
    <div className="gi-start">
      <header className="gi-start-header">
        <p className="gi-start-eyebrow">초등 5~6학년 수학 · 미디어 문해</p>
        <h1 className="gi-start-title">그래프 눈금 수사대</h1>
        <p className="gi-start-subtitle">
          같은 자료를 다른 축으로 그리면 판단이 어떻게 달라지는지 수사하는 한 차시 활동
        </p>
      </header>

      <section className="gi-start-intro" aria-labelledby="intro-heading">
        <h2 id="intro-heading" className="gi-sr-only">
          수사 안내
        </h2>
        <p>
          그래프는 같은 자료라도 <strong>축의 시작점·눈금 간격·단위</strong>가 다르면
          다르게 보일 수 있어요. 이 수사대에서는 그래프의 모양만 보지 않고, 실제 숫자와
          표현을 함께 확인하는 연습을 합니다.
        </p>
        <ol className="gi-start-procedure">
          <li>제목과 두 축, 단위, 눈금 한 칸을 찾습니다.</li>
          <li>값 표를 열어 실제 숫자를 확인합니다.</li>
          <li>시각적 인상과 실제 수치 차이를 비교합니다.</li>
          <li>공정한 그래프로 축을 고치고 이유를 씁니다.</li>
        </ol>
        <p className="gi-start-meta">
          수업 시간: 약 20분 · 서버 없이 브라우저에서만 실행 · 새로고침하면 처음부터
        </p>
      </section>

      <section className="gi-start-missions" aria-labelledby="missions-heading">
        <h2 id="missions-heading" className="gi-start-h2">
          사건 선택
        </h2>
        <ul className="gi-mission-list">
          {graphCases.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                className="gi-mission-card"
                onClick={() => onStart(i)}
              >
                <span className="gi-mission-card-num">
                  {c.isTutorial ? '연습' : `${i}번`}
                </span>
                <span className="gi-mission-card-title">{c.title}</span>
                <span className="gi-mission-card-concept">{c.coreConcept}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="gi-start-updates" aria-labelledby="updates-heading">
        <button
          type="button"
          className="gi-link-btn"
          aria-expanded={showUpdates}
          aria-controls="updates-body"
          onClick={() => setShowUpdates((v) => !v)}
        >
          <span aria-hidden="true">{showUpdates ? '▼' : '▶'}</span> 업데이트 내역
        </button>
        {showUpdates && (
          <div id="updates-body" className="gi-updates-body">
            <ul>
              <li>
                <strong>2026-07-27</strong> · 최초 MVP 공개. 튜토리얼 + 5개 사건(잘린 축,
                눈금 한 칸, 단위 바꾸기, 선 기울기 착시, 목적에 맞는 그래프).
              </li>
              <li>
                <strong>2026-07-27</strong> · 판정 문구 조정: "왜곡" 대신 "과장되어 보일 수
                있음" 사용. "0이 아니면 무조건 틀림" 오개념 방지 문구 추가.
              </li>
              <li>
                <strong>2026-07-27</strong> · 접근성: 색 외 텍스처(사선/점)로 정직/주의
                구분, 키보드 조작·스크린리더 지원.
              </li>
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}
