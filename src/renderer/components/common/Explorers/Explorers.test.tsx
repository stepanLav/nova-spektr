import { act, render, screen } from '@testing-library/react';

import Explorers from './Explorers';
import { TEST_ADDRESS } from '@renderer/shared/utils/constants';

jest.mock('@renderer/context/I18nContext', () => ({
  useI18n: jest.fn().mockReturnValue({
    t: (key: string) => key,
  }),
}));

describe('components/common/Explorers', () => {
  // TODO: fails in github CI, works on local machine
  test.skip('should render component', async () => {
    const explorers = [
      {
        name: 'Subscan',
        extrinsic: 'https://polkadot.subscan.io/extrinsic/{hash}',
        account: 'https://polkadot.subscan.io/account/{address}',
      },
      {
        name: 'Polkascan',
        extrinsic: 'https://polkadot.subscan.io/extrinsic/{hash}',
        account: 'https://polkadot.subscan.io/account/{address}',
      },
    ];

    render(<Explorers address={TEST_ADDRESS} addressPrefix={0} explorers={explorers} />);

    const button = screen.getByRole('button');
    await act(async () => button.click());

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(explorers.length);
  });
});
