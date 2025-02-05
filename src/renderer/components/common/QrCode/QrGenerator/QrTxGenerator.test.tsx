import { render } from '@testing-library/react';

import QrTxGenerator from './QrTxGenerator';

describe('components/common/QrTxGenerator', () => {
  test('should render transaction qr', () => {
    const { container } = render(
      <QrTxGenerator
        cmd={3}
        address="5GmedEVixRJoE8TjMePLqz7DnnQG1d5517sXdiAvAF2t7EYW"
        genesisHash="0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e"
        payload="my_payload"
        size={200}
      />,
    );

    const svgQr = container.querySelector('svg');
    expect(svgQr).toBeInTheDocument();
  });
});
