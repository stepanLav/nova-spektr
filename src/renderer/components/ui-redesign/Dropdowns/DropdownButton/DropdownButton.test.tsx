import { act, render, screen, within } from '@testing-library/react';
import noop from 'lodash/noop';

import DropdownButton, { ButtonDropdownOption } from './DropdownButton';

describe('ui-redesign/Dropdowns/DropdownButton', () => {
  const options: ButtonDropdownOption[] = [
    { id: '0', title: 'label_0', iconName: 'globe', onClick: noop },
    { id: '1', title: 'label_1', iconName: 'globe', onClick: noop },
  ];

  test('should render component', () => {
    render(<DropdownButton options={options} title="button" />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('should call onSelected', async () => {
    const spySelected = jest.fn();
    const optionsExtended: ButtonDropdownOption[] = [
      ...options,
      { id: '2', title: 'label_2', iconName: 'globe', onClick: spySelected },
    ];

    render(<DropdownButton options={optionsExtended} title="button" />);

    const button = screen.getByRole('button');
    await act(() => button.click());

    const option = screen.getAllByRole('menuitem')[2];
    const optionButton = within(option).getByRole('button');

    await act(() => optionButton.click());

    expect(spySelected).toBeCalled();
  });
});
