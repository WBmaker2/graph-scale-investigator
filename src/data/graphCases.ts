/**
 * 미션 데이터 (사양서 8절 MVP 미션 구성)
 * 모든 변형은 같은 values 배열을 참조하고 축 설정(axis)만 다르다 (사양서 10.1).
 * 값은 정수 중심, 눈금 계산이 가능한 범위로 제한 (사양서 10.1).
 */
import type { GraphCase } from '@/types'

export const graphCases: GraphCase[] = [
  // ─────────────────────────────────────────────────────────────
  // 미션 0. 수사관 훈련소 (튜토리얼)
  // 사양서 8절: 동일한 네 값으로 정직/과장 막대 비교, 읽기 절차 안내
  // ─────────────────────────────────────────────────────────────
  {
    id: 'm0',
    title: '훈련소: 눈금 수사 첫걸음',
    story: '같은 자료를 두 가지로 그린 그래프를 나란히 봅니다. 어느 쪽이 차이를 더 크게 보이게 할까요?',
    chartType: 'bar',
    categories: ['김', '이', '박', '최'],
    values: [20, 22, 24, 26],
    unit: '점',
    valueAxisLabel: '받은 점수(점)',
    intendedPurpose: 'compare',
    isTutorial: true,
    variants: [
      {
        id: 'A',
        displayName: '그래프 A',
        tag: 'fair',
        axis: { min: 0, max: 30, tickStep: 5, unit: '점', label: '받은 점수(점)' },
      },
      {
        id: 'B',
        displayName: '그래프 B',
        tag: 'watch',
        axis: { min: 18, max: 30, tickStep: 2, unit: '점', label: '받은 점수(점)' },
      },
    ],
    fairTarget: { min: 0, max: 30, tickStep: 5, unit: '점', label: '받은 점수(점)' },
    acceptableRepairs: [
      { min: 0, max: 30, tickStep: 5, unit: '점', label: '받은 점수(점)' },
      { min: 0, max: 28, tickStep: 4, unit: '점', label: '받은 점수(점)' },
    ],
    evidencePrompts: [
      { id: 'title', label: '제목 읽기', explanation: '그래프가 무엇을 보여주는지 제목으로 확인했어요.' },
      { id: 'axes', label: '가로축·세로축 확인', explanation: '두 축이 각각 무엇을 나타내는지 찾았어요.' },
      { id: 'unit', label: '단위 확인', explanation: '세로축의 단위(점)를 찾았어요.' },
      { id: 'tickstep', label: '눈금 한 칸 계산', explanation: '눈금 한 칸이 몇 점인지 계산했어요.' },
      { id: 'valuetable', label: '실제 값 표 확인', explanation: '그래프만 보지 않고 실제 숫자를 확인했어요.' },
    ],
    coreConcept: '그래프를 읽을 때는 제목·축·단위·눈금 한 칸·실제 값을 차례로 확인합니다.',
    sentenceTemplates: [
      '실제 값의 차이는 ___인데, 그래프에서는 ___처럼 보입니다.',
      '이 그래프의 한 칸은 ___ ___이므로, ___의 값은 ___입니다.',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 미션 1. 잘린 축 사건
  // 사양서 8절: 재활용 병 48,50,52,54 / A:0시작, B:46시작
  // ─────────────────────────────────────────────────────────────
  {
    id: 'm1',
    title: '사건 1. 잘린 축 사건',
    story: '네 반이 모은 재활용 병 수를 비교하려고 합니다. 두 그래프는 같은 자료인데 인상이 다릅니다.',
    chartType: 'bar',
    categories: ['1반', '2반', '3반', '4반'],
    values: [48, 50, 52, 54],
    unit: '개',
    valueAxisLabel: '재활용 병 수(개)',
    intendedPurpose: 'compare',
    variants: [
      {
        id: 'A',
        displayName: '그래프 A',
        tag: 'fair',
        axis: { min: 0, max: 60, tickStep: 10, unit: '개', label: '재활용 병 수(개)' },
      },
      {
        id: 'B',
        displayName: '그래프 B',
        tag: 'watch',
        axis: { min: 46, max: 60, tickStep: 2, unit: '개', label: '재활용 병 수(개)' },
      },
    ],
    fairTarget: { min: 0, max: 60, tickStep: 10, unit: '개', label: '재활용 병 수(개)' },
    acceptableRepairs: [
      { min: 0, max: 60, tickStep: 10, unit: '개', label: '재활용 병 수(개)' },
      { min: 0, max: 60, tickStep: 6, unit: '개', label: '재활용 병 수(개)' },
    ],
    evidencePrompts: [
      { id: 'start', label: '축이 0에서 시작하는지 확인', explanation: '축의 시작값이 0인지 아닌지 찾았어요.' },
      { id: 'range', label: '실제 최대·최소 차이 확인', explanation: '54-48=6개로 실제 차이는 작다는 것을 확인했어요.' },
      { id: 'unit', label: '단위 확인', explanation: '세로축 단위가 개라는 것을 찾았어요.' },
      { id: 'valuetable', label: '실제 값 표 확인', explanation: '값 표를 먼저 확인했어요.' },
    ],
    coreConcept: '축이 0에서 시작하지 않으면 작은 차이가 크게 보일 수 있습니다. 시작점과 실제 차이를 분리해 봅니다.',
    sentenceTemplates: [
      '실제 값의 차이는 ___인데, 그래프에서는 ___처럼 보입니다.',
      '나는 ___을(를) 고쳤습니다. 자료를 ___하게 비교하기 위해서입니다.',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 미션 2. 눈금 한 칸 실종 사건
  // 사양서 8절: 우유팩 0,10,20,30 / 세로축 0,5,10,15 표시이나 막대는 두 칸마다 숫자 변형
  // ─────────────────────────────────────────────────────────────
  {
    id: 'm2',
    title: '사건 2. 눈금 한 칸 실종 사건',
    story: '일주일 동안 모은 우유팩 수를 정리했습니다. 그래프 B는 숫자가 찍힌 칸 사이에 숫자 없는 칸이 숨어 있어요.',
    chartType: 'bar',
    categories: ['월', '화', '수', '목'],
    values: [0, 10, 20, 30],
    unit: '개',
    valueAxisLabel: '우유팩 수(개)',
    intendedPurpose: 'compare',
    variants: [
      {
        id: 'A',
        displayName: '그래프 A',
        tag: 'fair',
        axis: { min: 0, max: 30, tickStep: 10, unit: '개', label: '우유팩 수(개)' },
      },
      {
        id: 'B',
        displayName: '그래프 B',
        tag: 'watch',
        // 사양서 5.4절: 눈금 사이 중간 표시가 있으면 한 칸의 값을 다시 계산.
        // 표시는 0,5,10,15 이지만 실제 한 칸은 5. 학생이 "숫자 없는 칸"을 읽어야.
        axis: {
          min: 0,
          max: 30,
          tickStep: 5,
          unit: '개',
          label: '우유팩 수(개)',
          labeledTicks: [0, 5, 10, 15],
        },
      },
    ],
    fairTarget: { min: 0, max: 30, tickStep: 10, unit: '개', label: '우유팩 수(개)' },
    acceptableRepairs: [
      { min: 0, max: 30, tickStep: 10, unit: '개', label: '우유팩 수(개)' },
      { min: 0, max: 30, tickStep: 5, unit: '개', label: '우유팩 수(개)' },
    ],
    evidencePrompts: [
      { id: 'tickstep', label: '눈금 한 칸 계산', explanation: '숫자가 적힌 눈금 사이의 간격을 계산했어요.' },
      { id: 'midtick', label: '숫자 없는 칸 확인', explanation: '숫자가 없는 칸에도 값이 있다는 것을 찾았어요.' },
      { id: 'unit', label: '단위 확인', explanation: '세로축 단위가 개라는 것을 찾았어요.' },
      { id: 'valuetable', label: '실제 값 표 확인', explanation: '값 표와 그래프를 대조했어요.' },
    ],
    coreConcept: '눈금 사이에 숫자 없는 칸이 있으면 한 칸의 값을 다시 계산해야 합니다. 단위와 눈금 간격을 함께 봅니다.',
    sentenceTemplates: [
      '이 그래프의 한 칸은 ___ ___이므로, ___의 값은 ___입니다.',
      '나는 ___을(를) 고쳤습니다. 자료를 ___하게 비교하기 위해서입니다.',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 미션 3. 단위 바꾸기 사건
  // 사양서 8절: 운동장 길이 120,150,180 / A:m, B:cm(축 제목 가림)
  // 주의: 값은 그대로, 단위만 변환. 120m=12000cm
  // ─────────────────────────────────────────────────────────────
  {
    id: 'm3',
    title: '사건 3. 단위 바꾸기 사건',
    story: '세 학교 운동장 길이를 비교합니다. 그래프 B는 숫자가 훨씬 커 보이는데, 축 제목이 가려져 있어요.',
    chartType: 'bar',
    categories: ['서초', '역삼', '개포'],
    values: [120, 150, 180],
    unit: 'm',
    valueAxisLabel: '운동장 길이(m)',
    intendedPurpose: 'compare',
    variants: [
      {
        id: 'A',
        displayName: '그래프 A',
        tag: 'fair',
        axis: { min: 0, max: 200, tickStep: 50, unit: 'm', label: '운동장 길이(m)' },
      },
      {
        id: 'B',
        displayName: '그래프 B',
        tag: 'watch',
        // 같은 양을 cm로 표시. 120m=12000cm. 단위만 바뀌어 숫자가 커 보임.
        axis: { min: 0, max: 20000, tickStep: 5000, unit: 'cm', label: '???' },
      },
    ],
    fairTarget: { min: 0, max: 200, tickStep: 50, unit: 'm', label: '운동장 길이(m)' },
    acceptableRepairs: [
      { min: 0, max: 200, tickStep: 50, unit: 'm', label: '운동장 길이(m)' },
    ],
    evidencePrompts: [
      { id: 'unit', label: '축 단위 확인', explanation: '그래프 B의 단위가 cm라는 것을 찾았어요.' },
      { id: 'label', label: '축 제목 복원', explanation: '가려진 축 제목이 길이라는 것을 확인했어요.' },
      { id: 'relation', label: '단위와 비교 관계', explanation: '단위가 달라도 실제 비교 관계는 같다는 것을 알았어요.' },
      { id: 'valuetable', label: '실제 값 표 확인', explanation: '값 표를 확인했어요.' },
    ],
    coreConcept: '단위가 바뀌면 숫자는 달라져도 실제 양은 같을 수 있습니다. 축의 단위와 제목을 반드시 함께 봅니다.',
    sentenceTemplates: [
      '단위가 ___에서 ___(으)로 바뀌면 숫자는 ___배 커지지만, 실제 양은 ___합니다.',
      '나는 ___을(를) 고쳤습니다. 자료를 ___하게 비교하기 위해서입니다.',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 미션 4. 선의 기울기 착시 사건
  // 사양서 8절: 도서 대출 40,42,44,46 / 좁은 세로축 선 vs 전체 범위 선
  // ─────────────────────────────────────────────────────────────
  {
    id: 'm4',
    title: '사건 4. 선의 기울기 착시 사건',
    story: '월별 도서 대출 권수입니다. 그래프 B는 기울기가 가파르게 보이지만, 전체 범위를 보면 다를 수 있어요.',
    chartType: 'line',
    categories: ['3월', '4월', '5월', '6월'],
    values: [40, 42, 44, 46],
    unit: '권',
    valueAxisLabel: '대출 권수(권)',
    intendedPurpose: 'trend',
    variants: [
      {
        id: 'A',
        displayName: '그래프 A (전체 범위)',
        tag: 'fair',
        axis: { min: 0, max: 50, tickStep: 10, unit: '권', label: '대출 권수(권)' },
      },
      {
        id: 'B',
        displayName: '그래프 B (좁은 축)',
        tag: 'watch',
        // 사양서 5.3절: 선그래프는 작은 변화 확대를 허용하되 전체 범위와 함께 제시.
        // watch지만 "무조건 거짓"이 아님 - 확대 목적일 수 있음.
        axis: { min: 38, max: 48, tickStep: 2, unit: '권', label: '대출 권수(권)' },
      },
    ],
    fairTarget: { min: 0, max: 50, tickStep: 10, unit: '권', label: '대출 권수(권)' },
    acceptableRepairs: [
      { min: 0, max: 50, tickStep: 10, unit: '권', label: '대출 권수(권)' },
    ],
    evidencePrompts: [
      { id: 'slope', label: '기울기 관찰', explanation: '두 그래프의 선 기울기가 다르게 보이는 것을 확인했어요.' },
      { id: 'actualdelta', label: '실제 증가량 확인', explanation: '한 달에 2권씩 늘었다는 것을 확인했어요.' },
      { id: 'range', label: '축 범위 확인', explanation: '그래프 B가 좁은 범위만 보여준다는 것을 찾았어요.' },
      { id: 'valuetable', label: '실제 값 표 확인', explanation: '값 표를 먼저 확인했어요.' },
    ],
    coreConcept: '선그래프에서 축 범위를 좁히면 작은 변화가 커 보입니다. 확대 그래프와 전체 범위 그래프를 함께 봅니다.',
    sentenceTemplates: [
      '실제 값의 차이는 ___인데, 그래프에서는 ___처럼 보입니다.',
      '이 그래프는 ___을 비교하는 목적에 더 알맞습니다. 근거는 ___입니다.',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 미션 5. 목적에 맞는 그래프 사건
  // 사양서 8절: 급식 메뉴 선호도 12,15,16,17 / 막대·선·비율 중 목적에 맞는 것 선택
  // ─────────────────────────────────────────────────────────────
  {
    id: 'm5',
    title: '사건 5. 목적에 맞는 그래프 사건',
    story: '네 가지 급식 메뉴의 선호도 자료입니다. 무엇을 보여주고 싶은지에 따라 알맞은 그래프가 다를 수 있어요.',
    chartType: 'bar',
    categories: ['비빔밥', '김치찌개', '돈까스', '제육볶음'],
    values: [12, 15, 16, 17],
    unit: '명',
    valueAxisLabel: '좋아하는 학생 수(명)',
    intendedPurpose: 'compare',
    variants: [
      {
        id: 'A',
        displayName: '그래프 A (막대, 0 시작)',
        tag: 'fair',
        axis: { min: 0, max: 20, tickStep: 5, unit: '명', label: '좋아하는 학생 수(명)' },
      },
      {
        id: 'B',
        displayName: '그래프 B (막대, 10 시작)',
        tag: 'watch',
        axis: { min: 10, max: 20, tickStep: 2, unit: '명', label: '좋아하는 학생 수(명)' },
      },
    ],
    fairTarget: { min: 0, max: 20, tickStep: 5, unit: '명', label: '좋아하는 학생 수(명)' },
    acceptableRepairs: [
      { min: 0, max: 20, tickStep: 5, unit: '명', label: '좋아하는 학생 수(명)' },
      { min: 0, max: 18, tickStep: 3, unit: '명', label: '좋아하는 학생 수(명)' },
    ],
    evidencePrompts: [
      { id: 'purpose', label: '보여줄 목적 정하기', explanation: '범주별 양을 비교할 것인지, 변화를 볼 것인지 정했어요.' },
      { id: 'charttype', label: '그래프 종류 선택', explanation: '목적에 맞는 그래프 종류를 골랐어요.' },
      { id: 'axis', label: '축과 단위 확인', explanation: '제목·축·단위가 자료 내용과 맞는지 확인했어요.' },
      { id: 'valuetable', label: '실제 값 표 확인', explanation: '값 표를 확인했어요.' },
    ],
    coreConcept: '공정한 그래프는 모양 하나가 아니라 목적과 읽기 쉬움을 고려한 표현입니다. 목적에 맞는 축과 종류를 고릅니다.',
    sentenceTemplates: [
      '이 그래프는 ___을 비교하는 목적에 더 알맞습니다. 근거는 ___입니다.',
      '나는 ___을(를) 고쳤습니다. 자료를 ___하게 비교하기 위해서입니다.',
    ],
  },
]

/** id로 미션 찾기 */
export function getCaseById(id: string): GraphCase | undefined {
  return graphCases.find((c) => c.id === id)
}
