module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended', // ✨ Prettier 통합 핵심!
    ],
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    rules: {
        // Prettier가 모든 포맷팅을 처리하므로 충돌 방지
        'prettier/prettier': 'warn',

        // Three.js에 자주 필요한 규칙 조정
        'no-new': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    },
};
