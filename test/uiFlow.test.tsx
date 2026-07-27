/**
 * 사양서 16.3절 UI 흐름 검증 (jsdom 렌더링)
 *  - 시작 → 미션 → 값 표 → 근거 → 축 수리 → 결과 카드 흐름
 *  - 키보드 접근성, ARIA 역할, 게이트(값 표 확인 없이 다음 단계 불가) 검증
 *  - IAB 웹뷰가 이 환경에서 준비되지 않아 시각 브라우저 테스트를 대신함.
 *    DOM/ARIA 검증으로 컴포넌트 렌더링과 상호작용을 기계적으로 확인한다.
 */
// @vitest-environment jsdom
/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom/vitest'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphInvestigatorApp } from '@/features/graph-investigator/GraphInvestigatorApp'
import { InvestigationChart } from '@/features/graph-investigator/InvestigationChart'
import { graphCases } from '@/data/graphCases'

describe('사양서 11.1절 시작 화면', () => {
  it('제목과 안내, 6개 사건 카드가 렌더링된다', () => {
    render(<GraphInvestigatorApp />)
    expect(screen.getByText('그래프 눈금 수사대')).toBeInTheDocument()
    expect(screen.getByText(/같은 자료를 다른 축으로/)).toBeInTheDocument()
    const missionButtons = screen.getAllByRole('button').filter((b) =>
      b.textContent?.includes('사건') || b.textContent?.includes('훈련소'),
    )
    expect(missionButtons.length).toBeGreaterThanOrEqual(6)
  })

  it('업데이트 내역 버튼이 열리고 닫힌다 (사양서 11.3절)', async () => {
    const user = userEvent.setup()
    render(<GraphInvestigatorApp />)
    const btn = screen.getByRole('button', { name: /업데이트 내역/ })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    await user.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/최초 MVP 공개/)).toBeInTheDocument()
  })

  it('사건 1을 누르면 미션 화면으로 진입한다', async () => {
    const user = userEvent.setup()
    render(<GraphInvestigatorApp />)
    const m1 = screen.getByRole('button', { name: /사건 1\. 잘린 축 사건/ })
    await user.click(m1)
    expect(screen.getByText('사건 1. 잘린 축 사건')).toBeInTheDocument()
    expect(screen.getByText(/네 반이 모은 재활용 병 수/)).toBeInTheDocument()
  })
})

describe('사양서 11.2절 미션 화면 - 그래프 비교', () => {
  it('두 그래프 변형(A/B)이 모두 렌더링되고, 정직/주의 태그가 텍스트로 표시된다', () => {
    const case1 = graphCases[1] // 미션1
    const { container } = render(
      <InvestigationChart
        variant={case1.variants[0]}
        caseData={case1}
      />,
    )
    // 정직 변형 태그 텍스트 (사양서 12절: 색 외 텍스트로 구분) - 태그 + title에 모두 나올 수 있어 getAllByText
    expect(screen.getAllByText(/정직하게 보임/).length).toBeGreaterThan(0)
    // 한 칸 값 안내
    expect(screen.getAllByText(/한 칸 = 10개/).length).toBeGreaterThan(0)
    expect(container).toBeTruthy()
  })

  it('주의 변형은 "주의해서 보기"로 표시된다 (색 비의존)', () => {
    const case1 = graphCases[1]
    render(
      <InvestigationChart
        variant={case1.variants[1]}
        caseData={case1}
      />,
    )
    expect(screen.getAllByText(/주의해서 보기/).length).toBeGreaterThan(0)
  })

  it('SVG에 접근성 title/desc가 있다 (사양서 12절 스크린리더)', () => {
    const case1 = graphCases[1]
    const { container } = render(
      <InvestigationChart variant={case1.variants[0]} caseData={case1} />,
    )
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.querySelector('title')).not.toBeNull()
    expect(svg?.querySelector('desc')).not.toBeNull()
    expect(svg?.getAttribute('role')).toBe('img')
  })

  it('미션1에서 실제 값(48,50,52,54)이 차트에 라벨로 표시된다', () => {
    const case1 = graphCases[1]
    const { container } = render(
      <InvestigationChart variant={case1.variants[0]} caseData={case1} />,
    )
    // 값은 SVG text 요소로 표시됨. 모든 값이 차트 내 어딘가에 등장하는지 확인.
    const svgText = container.querySelector('svg')?.textContent ?? ''
    for (const v of case1.values) {
      expect(svgText).toContain(String(v))
    }
  })
})

describe('사양서 18절 위험 대응: 값 표 게이트', () => {
  it('값 표를 열지 않으면 check-values → explain으로 넘어갈 수 없다', async () => {
    const user = userEvent.setup()
    render(<GraphInvestigatorApp />)
    // 미션1 진입
    await user.click(screen.getByRole('button', { name: /사건 1\. 잘린 축 사건/ }))
    // observe → check-values (한 번 next)
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))
    // check-values 단계 안내문 확인 (strong 태그로 분할되어 있어 부분 매치)
    await screen.findByText(/실제 숫자를 확인하세요/)
    // 값 표 열지 않고 다시 next → 게이트 메시지 (role=alert로 대기)
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))
    const gate = await screen.findByRole('alert')
    expect(gate).toHaveTextContent(/값 표를 먼저 열어/)
    // 여전히 check-values 단계에 있어야 (다음으로 안 넘어감)
    expect(screen.getByText(/실제 숫자를 확인하세요/)).toBeInTheDocument()
  })

  it('값 표를 열면 다음 단계로 넘어갈 수 있다', async () => {
    const user = userEvent.setup()
    render(<GraphInvestigatorApp />)
    await user.click(screen.getByRole('button', { name: /사건 1\. 잘린 축 사건/ }))
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))
    // 값 표 열기
    await user.click(screen.getByRole('button', { name: /값 표 보기/ }))
    // 값 표 본문 등장 (최댓값 54)
    expect(screen.getByText(/최댓값 54/)).toBeInTheDocument()
    // 이제 next 통과
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))
    // explain 단계: 근거 모으기
    expect(screen.getByText('근거 모으기')).toBeInTheDocument()
  })
})

describe('사양서 9절: 근거 선택 + 설명 문장', () => {
  it('근거 체크하면 설명이 나타나고 피드백이 업데이트된다', async () => {
    const user = userEvent.setup()
    render(<GraphInvestigatorApp />)
    await user.click(screen.getByRole('button', { name: /사건 1\. 잘린 축 사건/ }))
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))
    await user.click(screen.getByRole('button', { name: /값 표 보기/ }))
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))

    // 근거: 값 표 + 시작점 체크 → full 피드백
    const valueTableCb = screen.getByRole('checkbox', { name: /실제 값 표 확인/ })
    const startCb = screen.getByRole('checkbox', { name: /축이 0에서 시작하는지 확인/ })
    await user.click(valueTableCb)
    await user.click(startCb)
    expect(screen.getByText(/수치와 표현을 함께 확인했어요/)).toBeInTheDocument()
  })

  it('문장 틀 빈칸이 렌더링된다', async () => {
    const user = userEvent.setup()
    render(<GraphInvestigatorApp />)
    await user.click(screen.getByRole('button', { name: /사건 1\. 잘린 축 사건/ }))
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))
    await user.click(screen.getByRole('button', { name: /값 표 보기/ }))
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))
    expect(screen.getByText(/설명 문장 완성하기/)).toBeInTheDocument()
    // 빈칸 입력들
    const blanks = screen.getAllByRole('textbox')
    expect(blanks.length).toBeGreaterThanOrEqual(1)
  })
})

describe('사양서 11.1절 축 수리 화면', () => {
  it('축 수리 패널에 시작값/끝값/눈금/단위 입력이 있다', async () => {
    const user = userEvent.setup()
    render(<GraphInvestigatorApp />)
    await user.click(screen.getByRole('button', { name: /사건 1\. 잘린 축 사건/ }))
    // repair 단계까지 진입 (observe → check-values[+값표] → explain → repair)
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))
    await user.click(screen.getByRole('button', { name: /값 표 보기/ }))
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))

    expect(screen.getByText('공정한 그래프로 고치기')).toBeInTheDocument()
    expect(screen.getByLabelText(/시작값/)).toBeInTheDocument()
    expect(screen.getByLabelText(/끝값/)).toBeInTheDocument()
    expect(screen.getByLabelText(/눈금 한 칸/)).toBeInTheDocument()
    expect(screen.getByLabelText(/단위/)).toBeInTheDocument()
  })

  it('0 시작 공정한 축으로 고치면 인정 피드백이 나온다', async () => {
    const user = userEvent.setup()
    render(<GraphInvestigatorApp />)
    await user.click(screen.getByRole('button', { name: /사건 1\. 잘린 축 사건/ }))
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))
    await user.click(screen.getByRole('button', { name: /값 표 보기/ }))
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))

    // 시작값을 0으로
    await user.clear(screen.getByLabelText(/시작값/))
    await user.type(screen.getByLabelText(/시작값/), '0')
    await user.click(screen.getByRole('button', { name: /이 설정으로 고치기/ }))

    expect(screen.getByText(/공정한 표현이에요|✓ 공정한 표현/)).toBeInTheDocument()
  })
})

describe('사양서 11.1절 결과 카드', () => {
  it('reflect 단계에서 수사 기록 카드가 렌더링된다', async () => {
    const user = userEvent.setup()
    render(<GraphInvestigatorApp />)
    await user.click(screen.getByRole('button', { name: /사건 1\. 잘린 축 사건/ }))
    // repair까지 진입
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))
    await user.click(screen.getByRole('button', { name: /값 표 보기/ }))
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))
    // reflect로
    await user.click(screen.getByRole('button', { name: /다음 단계로/ }))

    expect(screen.getByText('수사 기록 카드')).toBeInTheDocument()
    expect(screen.getByText(/기록 복사/)).toBeInTheDocument()
  })
})

describe('사양서 12절 접근성', () => {
  it('모든 상호작용 요소가 키보드로 접근 가능하다 (버튼/체크박스 역할)', () => {
    render(<GraphInvestigatorApp />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
    // 버튼은 기본적으로 키보드 포커스 가능
    buttons.forEach((b) => {
      expect(b.tagName).toBe('BUTTON')
    })
  })

  it('phase 표시기에 aria-current가 활성 단계에 표시된다', async () => {
    const user = userEvent.setup()
    render(<GraphInvestigatorApp />)
    await user.click(screen.getByRole('button', { name: /사건 1\. 잘린 축 사건/ }))
    const activeStep = screen.getByText(/1\. 그래프 관찰/)
    expect(activeStep).toHaveAttribute('aria-current', 'step')
  })

  it('낙인 없는 문구 사용: "왜 틀렸"이 없다 (사양서 12절)', () => {
    const { container } = render(<GraphInvestigatorApp />)
    const text = container.textContent ?? ''
    expect(text).not.toMatch(/왜 틀렸/)
  })
})
