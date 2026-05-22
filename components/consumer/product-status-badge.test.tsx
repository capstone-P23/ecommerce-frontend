import { render, screen } from '@testing-library/react';

import { ProductStatusBadge } from './product-status-badge';

describe('<ProductStatusBadge />', () => {
  it('ACTIVE 상태는 시각 노이즈 줄이기 위해 아무것도 렌더하지 않는다', () => {
    const { container } = render(<ProductStatusBadge status="ACTIVE" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('SOLD_OUT 상태는 "품절" badge 를 표시한다', () => {
    render(<ProductStatusBadge status="SOLD_OUT" />);
    expect(screen.getByText('품절')).toBeInTheDocument();
  });

  it('DISCONTINUED 상태는 "판매 중지" badge 를 표시한다', () => {
    render(<ProductStatusBadge status="DISCONTINUED" />);
    expect(screen.getByText('판매 중지')).toBeInTheDocument();
  });
});
