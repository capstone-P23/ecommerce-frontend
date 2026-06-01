// [AI-001] AI 대화형 추천
// 실제 Spring 백엔드 endpoint 가 존재하므로 MSW 핸들러 불필요.
// Next.js rewrite 프록시를 통해 localhost:8080 으로 직접 전달.
// onUnhandledRequest: 'bypass' 설정으로 MSW 가 개입하지 않음.
export const aiHandlers = [];
