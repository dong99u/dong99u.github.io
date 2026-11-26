# 박동규 포트폴리오

웹 포트폴리오와 PDF 포트폴리오를 한곳에 둔다.

- 웹: https://dong99u.github.io/ . 주소는 `<프로젝트>/<주제>/`다.
- PDF: [`pdf/박동규_포트폴리오.pdf`](pdf/박동규_포트폴리오.pdf) (A4 10쪽). PDF의 링크는 웹의 해당 글로 간다.

## 웹 글을 고치거나 더하기

`registry.mjs`에 글 하나를 더하고 `partials/<프로젝트>/<주제>.html`을 쓴다. 그 글만의 css와 js는 `css/<프로젝트>/<주제>.css`, `js/<프로젝트>/<주제>.js`에 둔다.

```
node build.mjs
```

`index.html`, `<프로젝트>/index.html`, `<프로젝트>/<주제>/index.html`은 이 명령이 만든다. 직접 고치지 않는다.

## PDF를 다시 만들기

`pdf/pages/`의 장표 10개와 `pdf/pages/order.json`의 순서로 한 파일을 만든다.

```
npx -y -p playwright sh -c 'NODE_PATH=$(dirname $(dirname $(which playwright))) node pdf/build.mjs'
```

`pdf/portfolio.html`(인쇄용)과 `pdf/박동규_포트폴리오.pdf`가 나온다.
