import { GraphInvestigatorApp } from '@/features/graph-investigator/GraphInvestigatorApp'

export default function App() {
  return (
    <>
      <a href="#gi-main" className="gi-skip-link">
        본문으로 건너뛰기
      </a>
      <main id="gi-main">
        <GraphInvestigatorApp />
      </main>
    </>
  )
}
