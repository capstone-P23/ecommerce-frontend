import { render, screen } from '@testing-library/react';

import { ComingSoonSection } from './coming-soon-section';

describe('<ComingSoonSection />', () => {
  it('title 과 plannedPhase 가 화면에 노출된다', () => {
    render(
      <ComingSoonSection title="상품 리뷰" plannedPhase="백엔드 구현 후" />,
    );
    expect(screen.getByText('상품 리뷰')).toBeInTheDocument();
    // 안내 문구 안에 plannedPhase 가 포함되는지 확인
    expect(screen.getByText(/백엔드 구현 후/)).toBeInTheDocument();
  });
});
