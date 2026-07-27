/**
 * SVG 직접 렌더링 차트 (사양서 18절 위험 대응: 라이브러리 자동 스케일 차단)
 *  - 축은 axisConfig(min/max/tickStep)로 100% 명시적 제어
 *  - 색이 아닌 라벨·패턴으로 정직/주의 구분 (사양서 12·10.2절)
 *  - role="img" + title/desc로 스크린리더 지원 (사양서 12절)
 *  - 키보드 접근 가능한 데이터 포인트 (사양서 12절)
 */
import { useMemo } from 'react'
import type { GraphVariant, GraphCase } from '@/types'
import { getTickValues, valueToRatio } from '@/lib/graphScale'

type Props = {
  variant: GraphVariant
  caseData: GraphCase
  /** 막대/선에 표시할 값 라벨 (사양서 10.2 접근성: 색 없이도 값 확인) */
  showValueLabels?: boolean
  /** 실제 차이 표시 (수사 도구) */
  showActualDiff?: boolean
  /** 차트 너비 (반응형은 부모가 결정) */
  width?: number
  height?: number
  /** 학생이 이 변형을 '더 크게 보인다'고 선택했는지 */
  selected?: boolean
  onSelect?: (variantId: string) => void
}

const PATTERN_IDS = {
  fair: 'pattern-fair-stripes',
  watch: 'pattern-watch-dots',
}

export function InvestigationChart({
  variant,
  caseData,
  showValueLabels = true,
  showActualDiff = false,
  width = 360,
  height = 280,
  selected = false,
  onSelect,
}: Props) {
  const { axis } = variant
  const chartType = variant.chartType ?? caseData.chartType
  const values = caseData.values
  const categories = caseData.categories

  // 여백: 왼쪽(축 라벨), 아래(범주), 위(여유). 라벨 가독성 위해 여유 확대 (스크린샷 개선점)
  const margin = { top: 28, right: 18, bottom: 54, left: 54 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const ticks = useMemo(() => {
    try {
      return getTickValues(axis)
    } catch {
      return []
    }
  }, [axis])

  // 값 → y 좌표 (위가 클 값, SVG는 아래가 큰 y)
  const valueToY = (v: number) => margin.top + (1 - valueToRatio(v, axis)) * innerH

  // 막대 너비
  const barSlot = innerW / Math.max(1, categories.length)
  const barWidth = Math.min(48, barSlot * 0.6)
  const barX = (i: number) => margin.left + barSlot * i + (barSlot - barWidth) / 2

  // 실제 차이 (수사 도구)
  const actualMax = Math.max(...values)
  const actualMin = Math.min(...values)
  const actualDiff = actualMax - actualMin

  const variantLabel = variant.tag === 'fair' ? '정직하게 보임' : '주의해서 보기'
  const title = `${variant.displayName}: ${caseData.title}. ${variantLabel}. 세로축 ${axis.min}부터 ${axis.max}까지, 한 칸 ${axis.tickStep}${axis.unit}.`

  // 정직/주의 패턴 - 색 외에 텍스처로 구분 (사양서 12절 색 의존 금지)
  const patternId = PATTERN_IDS[variant.tag]

  return (
    <figure
      className={`gi-chart-figure ${selected ? 'gi-chart-selected' : ''}`}
      aria-label={title}
    >
      <div className="gi-chart-header">
        <span className={`gi-chart-tag gi-chart-tag-${variant.tag}`}>
          {variant.displayName}
          <span className="gi-chart-tag-label"> {variantLabel}</span>
        </span>
        {onSelect && (
          <button
            type="button"
            className="gi-chart-select-btn"
            onClick={() => onSelect(variant.id)}
            aria-pressed={selected}
            aria-label={`${variant.displayName}을(를) 차이가 더 크게 보이는 그래프로 선택`}
          >
            {selected ? '선택됨' : '이쪽이 더 커 보여요'}
          </button>
        )}
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`${variant.id}-title ${variant.id}-desc`}
        className="gi-chart-svg"
      >
        <title id={`${variant.id}-title`}>{title}</title>
        <desc id={`${variant.id}-desc`}>
          {caseData.categories
            .map((c, i) => `${c} ${values[i]}${axis.unit}`)
            .join(', ')}
          . 실제 값 차이 {actualDiff}
          {axis.unit}.
        </desc>

        <defs>
          {/* 정직: 사선 패턴 / 주의: 점 패턴. 색 외 텍스처로 구분 (사양서 12절) */}
          <pattern
            id={PATTERN_IDS.fair}
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <rect width="6" height="6" fill="#dbeafe" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#2563eb" strokeWidth="2" />
          </pattern>
          <pattern
            id={PATTERN_IDS.watch}
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
          >
            <rect width="6" height="6" fill="#fef3c7" />
            <circle cx="3" cy="3" r="1.5" fill="#d97706" />
          </pattern>
        </defs>

        {/* 세로축 눈금 + 라벨 */}
        {ticks.map((t, i) => {
          const y = margin.top + (1 - (t - axis.min) / (axis.max - axis.min)) * innerH
          return (
            <g key={`tick-${i}`} className="gi-chart-tick">
              <line
                x1={margin.left}
                y1={y}
                x2={width - margin.right}
                y2={y}
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <text
                x={margin.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                className="gi-chart-axis-text"
              >
                {t}
              </text>
            </g>
          )
        })}

        {/* 세로축 선 */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + innerH}
          stroke="#475569"
          strokeWidth="1.5"
        />
        {/* 가로축 선 */}
        <line
          x1={margin.left}
          y1={margin.top + innerH}
          x2={width - margin.right}
          y2={margin.top + innerH}
          stroke="#475569"
          strokeWidth="1.5"
        />

        {/* 세로축 라벨 (단위 포함) */}
        <text
          x={12}
          y={margin.top - 10}
          fontSize="12"
          className="gi-chart-axis-label"
        >
          {axis.label}
        </text>
        {/* 한 칸 값 안내 */}
        <text
          x={12}
          y={height - 6}
          fontSize="11"
          className="gi-chart-axis-text"
        >
          한 칸 = {axis.tickStep}{axis.unit}
        </text>

        {/* 차트 본문: 막대 or 선 */}
        {chartType === 'bar' &&
          values.map((v, i) => {
            const y = valueToY(v)
            const h = margin.top + innerH - y
            return (
              <g key={`bar-${i}`}>
                <rect
                  x={barX(i)}
                  y={y}
                  width={barWidth}
                  height={Math.max(0, h)}
                  fill={`url(#${patternId})`}
                  stroke={variant.tag === 'fair' ? '#2563eb' : '#d97706'}
                  strokeWidth="1.5"
                />
                {showValueLabels && (
                  <text
                    x={barX(i) + barWidth / 2}
                    y={y - 7}
                    textAnchor="middle"
                    fontSize="12"
                    className="gi-chart-value-label"
                  >
                    {v}
                  </text>
                )}
                <text
                  x={barX(i) + barWidth / 2}
                  y={margin.top + innerH + 20}
                  textAnchor="middle"
                  fontSize="12"
                  className="gi-chart-category"
                >
                  {categories[i]}
                </text>
              </g>
            )
          })}

        {chartType === 'line' && (
          <>
            {/* 영역 채우기 */}
            <path
              d={
                values
                  .map((v, i) => {
                    const x = margin.left + barSlot * i + barSlot / 2
                    const y = valueToY(v)
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                  })
                  .join(' ') +
                ` L ${margin.left + barSlot * (values.length - 1) + barSlot / 2} ${margin.top + innerH} L ${margin.left + barSlot / 2} ${margin.top + innerH} Z`
              }
              fill={variant.tag === 'fair' ? 'rgba(37, 99, 235, 0.12)' : 'rgba(217, 119, 6, 0.12)'}
            />
            {/* 선 */}
            <polyline
              points={values
                .map((v, i) => {
                  const x = margin.left + barSlot * i + barSlot / 2
                  const y = valueToY(v)
                  return `${x},${y}`
                })
                .join(' ')}
              fill="none"
              stroke={variant.tag === 'fair' ? '#2563eb' : '#d97706'}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeDasharray={variant.tag === 'watch' ? '6 3' : undefined}
            />
            {/* 포인트 + 값 라벨 */}
            {values.map((v, i) => {
              const x = margin.left + barSlot * i + barSlot / 2
              const y = valueToY(v)
              return (
                <g key={`pt-${i}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill={variant.tag === 'fair' ? '#2563eb' : '#d97706'}
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  {showValueLabels && (
                    <text
                      x={x}
                      y={y - 11}
                      textAnchor="middle"
                      fontSize="12"
                      className="gi-chart-value-label"
                    >
                      {v}
                    </text>
                  )}
                  <text
                    x={x}
                    y={margin.top + innerH + 20}
                    textAnchor="middle"
                    fontSize="12"
                    className="gi-chart-category"
                  >
                    {categories[i]}
                  </text>
                </g>
              )
            })}
          </>
        )}

        {/* 실제 차이 표시 (수사 도구) */}
        {showActualDiff && (
          <g>
            <text
              x={width - margin.right}
              y={margin.top - 8}
              textAnchor="end"
              fontSize="11"
              fontWeight="700"
              className="gi-chart-diff-label"
            >
              실제 차이: {actualDiff}{axis.unit}
            </text>
          </g>
        )}
      </svg>
    </figure>
  )
}
