/** mock-only 페이지의 공통 안내 띠. seller/mock-notice 와 동일 패턴. */
export function AdminMockNotice() {
  return (
    <p className="text-xs text-muted-foreground">
      ⚠️ 백엔드 endpoint 미정 — mock 데이터로 동작합니다.
    </p>
  );
}
