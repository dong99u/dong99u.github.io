// 글 하나 더하기: entries 에 객체 하나를 더하고 partials/<project>/<slug>.html 을 쓴다. css·js 는 있으면 css/<project>/<slug>.css, js/<project>/<slug>.js 가 그 페이지에만 실린다.
// 프로젝트 하나 더하기: projects 에 객체 하나(slug, name, line)를 더한다. 목록 순서가 곧 화면 순서이고 이전·다음 순서다.
// 그다음 `node build.mjs`. 메인, 프로젝트 페이지, <project>/<slug>/index.html 이 모두 다시 만들어진다.

export const owner = { name: '박동규', line: '포트폴리오에서 더 보여 주고 싶은 것들' };

export const projects = [
  { slug: 'dero', name: 'DERO', line: '데스크테리어 3D 시뮬레이터 DERO에서 한 일' },
  { slug: 'fin', name: '떠먹는 금융', line: '금융 뉴스 AI 플랫폼 떠먹는 금융에서 한 일' },
];

// 글의 본문은 장(<section class="ch" data-ch="…">)으로 쓴다. 규칙은 css/base.css 머리말에 있다.
// when: 머리 장의 문장 아래 한 줄(기간 등, 없어도 된다). oldHash: 예전 한 장짜리 주소의 #이름.
// scroll: 2판 틀에서만 쓴다(장면이 붙잡혀 있는 스크롤 길이). 3판으로 옮긴 글에서는 지운다.
export const entries = [
  {
    project: 'dero', slug: 'intent-docs', label: 'DERO ①', name: '의도 문서', oldHash: 'intent', when: '2026-10-03 도입 · 2026-11-22 폐지',
    sentence: '의도 문서부터 쓰는 절차를 50일 운영했고, 문서 209개 중 181개가 끝내 open으로 남았다.',
  },
  {
    project: 'dero', slug: 'merge-gate', label: 'DERO ②', name: '머지 조건', oldHash: 'loop', when: '2026-11-22 첫 판 · 11-24까지 지금 구성',
    sentence: '코드를 쓰지 않은 검증자가 통과시킨 커밋이 PR의 최신 커밋과 같을 때만 머지된다.',
  },
  {
    project: 'dero', slug: 'comment-gate', label: 'DERO ③', name: '규칙을 검사로', oldHash: 'rules',
    sentence: '같은 지적을 두 번 하게 되면 문서에 한 줄 더 쓰지 않고, 어기면 막히는 검사로 옮긴다.',
  },
  {
    project: 'dero', slug: 'doc-weight', label: 'DERO ④', name: '줄 수와 토큰', oldHash: 'cases',
    sentence: '줄 수로는 문서의 무게를 알 수 없었다. 69줄 문서가 17,597토큰, 99줄 문서가 4,025토큰이었다.',
  },
  {
    project: 'dero', slug: 'connection-pool', label: 'DERO ⑤', name: '연결 풀', when: '그런 호출 3곳에서 기다리는 구간을 연결 밖으로 뺐다 · 2026-08-06~07',
    sentence: 'DB 연결을 쥔 채 외부 응답을 기다리면, 재현 프로그램에서 연결 10개에 동시 요청 16개로 상관없는 조회가 5초대로 느려졌다.',
  },
  {
    project: 'dero', slug: 'search-min-gram', label: 'DERO ⑥', name: '검색 설정 한 줄', when: '2026-08-07 수정 · 2026-11-26 로컬 재현',
    sentence: '없는 제품 이름을 쳐도 결과가 나오던 검색을, 색인 설정의 숫자 하나를 1에서 2로 바꿔 0건이 나오게 고쳤다. 오타 검색은 그대로 된다.',
  },
  {
    project: 'dero', slug: 'gardener', label: 'DERO ⑦', name: '정원사', when: '2026-11-22 검사 도입 · 11-26까지 18곳에서 16곳',
    sentence: '에이전트는 통과하는 가장 짧은 길로 간다. 그래서 임시방편은 늘지 못하게 숫자로 묶고, 정원사가 하루에 하나씩 맞는 길로 바꿔 그 숫자를 내린다.',
  },
  {
    project: 'dero', slug: 'queue-kept', label: 'DERO ⑧', name: '남긴 큐', when: '2026-07-31 설계 · 08-06 생성기 교체 · 08-18 휴면 · 10-12 삭제',
    sentence: '이미지 생성기를 노트북에서 외부 API로 바꾸기로 한 날, 큐를 둔 첫 이유는 사라졌지만 서버가 재시작해도 작업을 잃지 않는다는 이유로 큐는 그대로 두었다.',
  },
  {
    project: 'fin', slug: 'qa-sources', label: '떠먹는 금융 ①', name: '답과 출처', when: '2026-06-25 수정 · 07-06 보완',
    sentence: '검색은 늘 5건을 돌려준다. 그 5건을 점수 바닥, 1등 대비 85%, 답변이 거부문인지로 세 번 거른 뒤 남은 것만 출처로 보여 준다.',
  },
  {
    project: 'fin', slug: 'sent-before-confirm', label: '떠먹는 금융 ②', name: '보내고, 확인하고, 기록', when: '2026-05-29 수정',
    sentence: '크롤러가 전달을 확인하기 전에 보냈다고 기록하던 순서를, 보내고 확인한 뒤에 전달된 것만 기록하는 순서로 바꿨다.',
  },
  {
    project: 'fin', slug: 'llm-provider', label: '떠먹는 금융 ③', name: 'LLM 호출 한 곳', when: '2026-07-02 정리',
    sentence: 'LLM 클라이언트를 만드는 줄이 5곳이던 것을 1곳으로 모아, 공급자를 환경변수로 바꾸게 했다.',
  },
];
