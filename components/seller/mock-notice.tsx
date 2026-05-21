/**
 * mock-only 페이지에 일관되게 노출하는 안내 띠.
 * 백엔드 endpoint 가 추가되면 이 표시를 제거.
 */
export function MockNotice() {
  return (
    <p className="text-xs text-muted-foreground">
      ⚠️ 백엔드 endpoint 미정 — mock 데이터로 동작합니다.
    </p>
  );
}
