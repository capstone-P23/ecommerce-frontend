// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 새로운 기능
        'fix', // 버그 수정
        'docs', // 문서 수정
        'style', // 코드 스타일 변경 (기능 변화 없음)
        'refactor', // 코드 리팩토링
        'perf', // 성능 개선
        'test', // 테스트 추가
        'chore', // 빌드, 패키지 관리 등
        'ci', // CI/CD 설정 변경
        'revert', // 이전 커밋 되돌리기
        'build', // 빌드 관련 변경
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-case': [2, 'always', 'lower-case'],
    'scope-case': [2, 'always', 'lower-case'],
  },
};
