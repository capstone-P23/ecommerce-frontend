import Link from 'next/link';

import { AuthShell } from '@/components/layout/auth-shell';

/**
 * [MEM-001] 회원가입.
 *
 * 백엔드 명세 (api-docs.json) 에 별도 signup endpoint 가 없음.
 * Google OAuth 로 첫 로그인 시 백엔드가 회원을 자동 생성함.
 * 이메일 회원가입 도입 시 폼 추가.
 */
export default function SignupPage() {
  return (
    <AuthShell title="회원가입">
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          현재 이메일 회원가입은 지원하지 않습니다.
          <br />
          Google 계정으로 처음 로그인하시면 회원이 자동 생성됩니다.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-foreground underline"
        >
          로그인으로 이동 →
        </Link>
      </div>
    </AuthShell>
  );
}
