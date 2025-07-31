src/
├── main/                  # Electron Main Process (main.ts, preload.ts)
│   └── main.ts
│   └── preload.ts
├── renderer/              # 브라우저 렌더링 영역 (Three.js, UI 포함)
│   ├── App.ts             # entry (index.html과 연결됨)
│   ├── core/              # 엔진 관련 핵심 로직
│   │   ├── Engine.ts      # scene, camera, renderer 초기화
│   │   ├── Loop.ts        # game loop
│   │   └── Resize.ts      # resize handler
│   ├── player/            # 플레이어 관련 (입력, 이동, 점프, 중력 등)
│   │   ├── Player.ts
│   │   ├── Controls.ts
│   │   └── Physics.ts
│   ├── world/             # 맵, 충돌, 환경
│   │   ├── MapLoader.ts   # GLTF 로드 및 proxy 처리
│   │   ├── Collision.ts   # cannon-es로 충돌 박스 생성
│   │   └── Environment.ts # 광원, 바닥 등
│   ├── physics/           # cannon-es 설정 및 디버거
│   │   ├── World.ts
│   │   └── Debug.ts
│   ├── utils/             # 유틸 함수들
│   │   ├── Math.ts
│   │   └── Helpers.ts
│   └── assets/            # 모델, 텍스처, 사운드 등 정적 리소스
│       └── models/
│           └── level.glb
├── types/                 # 커스텀 타입 정의
│   └── global.d.ts
└── index.html             # 렌더링 엔트리
