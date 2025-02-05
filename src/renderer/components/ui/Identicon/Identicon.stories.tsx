import { ComponentMeta, ComponentStory } from '@storybook/react';

import { SigningType } from '@renderer/domain/shared-kernel';
import { TEST_ADDRESS } from '@renderer/shared/utils/constants';
import Identicon from './Identicon';

export default {
  title: 'Identicon',
  component: Identicon,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as ComponentMeta<typeof Identicon>;

const Template: ComponentStory<typeof Identicon> = (args) => <Identicon {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  size: 50,
  address: TEST_ADDRESS,
};

export const WithSignBadge = Template.bind({});
WithSignBadge.args = {
  size: 50,
  address: TEST_ADDRESS,
  signType: SigningType.WATCH_ONLY,
};
