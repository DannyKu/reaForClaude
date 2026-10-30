# reaForClaude: Claude Code 연결 가이드

이 리포지토리를 Claude Code로 열면 REA(Reverse Engineer Anything) MCP 서버와
`reverse-engineer-anything` 스킬이 바로 연결되도록 설정되어 있습니다.

## 추가된 파일

| 파일                                         | 역할                                                                                     |
| -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `.mcp.json`                                  | Claude Code 프로젝트 범위 MCP 등록. `rea` 서버를 `.claude/rea-mcp.mjs`로 실행합니다.     |
| `.claude/rea-mcp.mjs`                        | 공식 npm 패키지 `rea-agents@6.8.0`의 `mcp` 서버를 OS 임시 폴더에서 `npx`로 실행합니다.   |
| `.claude/settings.json`                      | `.mcp.json`의 `rea` 서버를 프로젝트 기본 활성 서버로 지정합니다.                         |
| `.claude/skills/reverse-engineer-anything/`  | `rea-agents@6.8.0` 패키지에 포함된 워크플로 스킬(프로젝트 스킬로 복사).                   |

### 런처 스크립트가 필요한 이유

이 리포의 `package.json` 이름이 `rea-agents`이기 때문에, 리포 루트에서
`npx rea-agents mcp`를 실행하면 npm이 배포 패키지가 아니라 빌드되지 않은
소스 체크아웃을 실행하려다 `rea: not found`로 실패합니다. 런처는 작업
디렉터리를 OS 임시 폴더로 바꿔 항상 npm에 배포된 공식 패키지를 실행합니다.
(REA 문서도 "패키지 다운로드는 대상 프로젝트 밖의 신뢰할 수 있는 디렉터리에서"
하도록 권장합니다.)

## 사용 방법

1. Node.js와 npm을 설치합니다. REA 권장 버전은 Node.js 22.23.4+ / 24.22.1+
   (리포의 `.nvmrc`는 `24.22.1`)입니다. Node 22.22에서도 경고(EBADENGINE)만
   출력되고 MCP 서버는 동작하는 것을 확인했습니다.
2. 리포 루트에서 `claude`를 실행합니다.
3. 처음 실행하면 `.mcp.json`의 `rea` 서버 사용 승인을 묻습니다. 승인합니다.
4. `/mcp`에서 `rea`가 connected 인지 확인합니다.
5. 예: "inspect_analysis_settings 도구로 REA 설정을 보여줘" 또는
   "이 Electron 앱의 검색 기능이 어떻게 동작하는지 REA로 분석해줘".

다른 버전을 쓰려면 환경 변수 `REA_AGENTS_VERSION`을 지정합니다
(예: `REA_AGENTS_VERSION=6.9.0 claude`). 스킬도 같은 버전으로 맞추려면
`.claude/skills/reverse-engineer-anything`을 해당 버전 패키지의 `skills/`에서
다시 복사합니다.

## 확인 방법

```bash
# 등록 확인
claude mcp get rea

# 비대화형 연결 테스트 (도구 1회 호출)
claude -p --mcp-config .mcp.json --strict-mcp-config \
  --allowedTools "mcp__rea__inspect_analysis_settings" \
  "Call the rea MCP tool inspect_analysis_settings once and say whether it succeeded."
```

2026-10-30 확인 결과: 서버 `rea 6.8.0`, 도구 229개 노출,
`inspect_analysis_settings` 호출 성공.

## 다른 연결 방법 (참고)

- **사용자 전체 등록**: `npx rea-agents setup` → `~/.claude.json`과
  `~/.claude/skills`에 등록되어 모든 프로젝트에서 사용됩니다.
  이 리포의 `.mcp.json`과 함께 쓰면 `rea` 서버가 중복될 수 있으니 하나만 사용하세요.
- **플러그인**: `/plugin marketplace add morluto/rea` → `/plugin install rea@rea`.
  2026-10-30 기준 npm `rea-agents@6.8.0`에는 `.claude-plugin/plugin.json`이 포함되어
  있지 않아, 설치는 되지만 MCP 서버가 등록되지 않습니다(버전 `unknown`으로 표시).
  플러그인 매니페스트가 포함된 릴리스가 나오기 전까지는 위의 `.mcp.json` 방식을 권장합니다.
- 네이티브 바이너리 분석(Hopper, Ghidra, IDA, Kuna) 엔진 설정은
  [installation.md](installation.md)를 참고하세요. 정적 JavaScript/Electron 분석은
  별도 엔진 없이 동작합니다.
