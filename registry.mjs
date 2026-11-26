// 글 하나 더하기: entries 에 객체 하나를 더하고 partials/<project>/<slug>.html 을 쓴다. css·js 는 있으면 css/<project>/<slug>.css, js/<project>/<slug>.js 가 그 페이지에만 실린다.
// 프로젝트 하나 더하기: projects 에 객체 하나(slug, name, line)를 더한다. 목록 순서가 곧 화면 순서이고 이전·다음 순서다.
// 그다음 `node build.mjs`. 메인, 프로젝트 페이지, <project>/<slug>/index.html 이 모두 다시 만들어진다.

export const owner = { name: '박동규', line: '포트폴리오에서 더 보여 주고 싶은 것들' };

export const projects = [
  { slug: 'dero', name: 'DERO', line: '데스크테리어 3D 시뮬레이터 DERO에서 한 일' },
];

// scroll: 장면이 붙잡혀 있는 스크롤 길이(화면 높이의 배수). oldHash: 예전 한 장짜리 주소의 #이름.
export const entries = [
  {
    project: 'dero', slug: 'intent-docs', label: 'DERO ①', name: '의도 문서', scroll: 3, oldHash: 'intent',
    sentence: '의도 문서부터 쓰는 절차를 50일 운영했고, 문서 209개 중 181개가 끝내 open으로 남았다.',
  },
  {
    project: 'dero', slug: 'merge-gate', label: 'DERO ②', name: '머지 조건', scroll: 3, oldHash: 'loop',
    sentence: '코드를 쓰지 않은 검증자가 통과시킨 커밋이 PR의 최신 커밋과 같을 때만 머지된다.',
  },
  {
    project: 'dero', slug: 'comment-gate', label: 'DERO ③', name: '규칙을 검사로', scroll: 3, oldHash: 'rules',
    sentence: '같은 지적을 두 번 하게 되면 문서에 한 줄 더 쓰지 않고, 어기면 막히는 검사로 옮긴다.',
  },
  {
    project: 'dero', slug: 'doc-weight', label: 'DERO ④', name: '줄 수와 토큰', scroll: 2, oldHash: 'cases',
    sentence: '줄 수로는 문서의 무게를 알 수 없었다. 69줄 문서가 17,597토큰, 99줄 문서가 4,025토큰이었다.',
  },
  {
    project: 'dero', slug: 'connection-pool', label: 'DERO ⑤', name: '연결 풀', scroll: 2,
    sentence: '외부 응답을 기다리는 동안 DB 연결을 쥐고 있으면, 연결 10개에 동시 요청 16개만으로 상관없는 조회가 1ms에서 5초대로 느려진다(재현 프로그램으로 잰 값). 그런 호출 3곳에서 기다리는 구간을 연결 밖으로 뺐다.',
  },
  {
    project: 'dero', slug: 'search-min-gram', label: 'DERO ⑥', name: '검색 설정 한 줄', scroll: 2,
    sentence: '없는 제품 이름을 쳐도 결과가 나오던 검색을, 색인 설정의 숫자 하나를 1에서 2로 바꿔 0건이 나오게 고쳤다. 오타 검색은 그대로 된다.',
  },
];
