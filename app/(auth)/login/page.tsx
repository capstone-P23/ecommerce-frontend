import { GoogleLoginButton } from '@/components/auth/google-login-button';
import { AuthShell } from '@/components/layout/auth-shell';

/**
 * [MEM-001, MEM-002] 로그인.
 *
 * 백엔드 명세 (api-docs.json) 기준 현재 지원 방식:
 *   - Google OAuth 만 (이메일/비밀번호 미구현)
 *
 * 이메일 로그인 도입 시 RHF + zod 폼을 GoogleLoginButton 위에 추가하면 됨.
 */
export default function LoginPage() {
  return (
    <AuthShell title="로그인">
      <div className="space-y-4">
        <GoogleLoginButton />
        <p className="text-center text-xs text-muted-foreground">
          이메일/비밀번호 로그인은 추후 지원 예정입니다.
        </p>
      </div>
    </AuthShell>
  );
}
