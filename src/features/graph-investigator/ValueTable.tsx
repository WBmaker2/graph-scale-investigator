/**
 * 원자료 값 표 (사양서 7.2절 "값 보기" 도구)
 *  - 그래프 보기 전에 실제 숫자 확인 유도 (사양서 5.1절 읽기 절차 4)
 *  - 모바일: 가로 스크롤 또는 카드형 (사양서 12절)
 */
import type { GraphCase } from '@/types'

type Props = {
  caseData: GraphCase
  opened: boolean
  onToggle: () => void
  /** 필수 액션이 남아 강조 애니메이션을 켤지 (학생 안내) */
  highlight?: boolean
}

export function ValueTable({ caseData, opened, onToggle, highlight = false }: Props) {
  return (
    <section className="gi-value-table-section" aria-labelledby="value-table-heading">
      <button
        type="button"
        className={`gi-tool-toggle ${highlight ? 'gi-pulse' : ''}`}
        onClick={onToggle}
        aria-expanded={opened}
        aria-controls="value-table-body"
      >
        <span className="gi-tool-icon" aria-hidden="true">
          {opened ? '▼' : '▶'}
        </span>
        <span id="value-table-heading">값 표 보기 (실제 숫자 확인)</span>
        <span className="gi-tool-required" aria-label="필수">
          필수
        </span>
      </button>

      {opened && (
        <div id="value-table-body" className="gi-value-table-body">
          <table className="gi-value-table">
            <caption className="gi-sr-only">
              {caseData.title}의 실제 값 표. 모든 그래프는 이 값을 그대로 사용합니다.
            </caption>
            <thead>
              <tr>
                <th scope="col">항목</th>
                {caseData.categories.map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  값({caseData.unit})
                </th>
                {caseData.values.map((v, i) => (
                  <td key={i}>{v}</td>
                ))}
              </tr>
            </tbody>
          </table>
          <p className="gi-value-table-note">
            최댓값 {Math.max(...caseData.values)}{caseData.unit}, 최솟값{' '}
            {Math.min(...caseData.values)}{caseData.unit}, 실제 차이{' '}
            {Math.max(...caseData.values) - Math.min(...caseData.values)}
            {caseData.unit}
          </p>
        </div>
      )}
    </section>
  )
}
