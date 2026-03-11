import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button, BodyText, FootnoteText, DetailRow, Icon } from '@/shared/ui';
import { Modal, Select, Surface, Box } from '@/shared/ui-kit';
import { Identicon, AssetBalance } from '@/shared/ui-entities';

const DelegationConfirmModal = () => {
  const [isOpen, onToggle] = useState(true);
  const [network, setNetwork] = useState('polkadot');
  const [lockPeriod, setLockPeriod] = useState('28');

  const delegateAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  const delegateAmount = '15000000000000'; // 1500 DOT (10 decimals)

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <>
      <Button onClick={() => onToggle(true)}>Open Delegation Modal</Button>
      <Modal isOpen={isOpen} size="md" onToggle={onToggle}>
        <Modal.Title close>Confirm Delegation</Modal.Title>
        <Modal.Content>
          <Box direction="column" gap={4}>
            <Surface elevation={1} className="p-4">
              <Box direction="column" gap={3}>
                <FootnoteText className="text-text-tertiary">Delegate to</FootnoteText>
                <div className="flex items-center gap-3">
                  <Identicon address={delegateAddress} size={40} theme="polkadot" />
                  <div className="flex flex-col">
                    <BodyText className="text-text-primary font-medium">Validator Node 1</BodyText>
                    <FootnoteText className="text-text-tertiary">
                      {truncateAddress(delegateAddress)}
                    </FootnoteText>
                  </div>
                </div>
              </Box>
            </Surface>

            <Surface elevation={1} className="p-4">
              <Box direction="column" gap={3}>
                <FootnoteText className="text-text-tertiary">Amount to delegate</FootnoteText>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-text-primary">
                    <AssetBalance value={delegateAmount} asset={{ symbol: 'DOT', precision: 10 }} />
                  </span>
                </div>
                <FootnoteText className="text-text-tertiary">≈ $12,450.00 USD</FootnoteText>
              </Box>
            </Surface>

            <Box direction="column" gap={2}>
              <FootnoteText className="text-text-tertiary">Network</FootnoteText>
              <Select placeholder="Select network" value={network} onChange={setNetwork}>
                <Select.Item value="polkadot">Polkadot</Select.Item>
                <Select.Item value="kusama">Kusama</Select.Item>
                <Select.Item value="westend">Westend</Select.Item>
              </Select>
            </Box>

            <Box direction="column" gap={2}>
              <FootnoteText className="text-text-tertiary">Lock period</FootnoteText>
              <Select placeholder="Select lock period" value={lockPeriod} onChange={setLockPeriod}>
                <Select.Item value="7">7 days (1x voting power)</Select.Item>
                <Select.Item value="14">14 days (2x voting power)</Select.Item>
                <Select.Item value="28">28 days (3x voting power)</Select.Item>
                <Select.Item value="56">56 days (4x voting power)</Select.Item>
                <Select.Item value="112">112 days (5x voting power)</Select.Item>
                <Select.Item value="224">224 days (6x voting power)</Select.Item>
              </Select>
            </Box>

            <Surface elevation={0} className="p-3 bg-badge-background rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="info" size={16} className="text-icon-accent mt-0.5" />
                <FootnoteText className="text-text-secondary">
                  Your tokens will be locked for {lockPeriod} days. You can undelegate at any time, but tokens will only become available after the lock period ends.
                </FootnoteText>
              </div>
            </Surface>

            <div className="flex flex-col gap-2 pt-2">
              <DetailRow label="Network fee">
                <BodyText className="text-text-primary">0.0156 DOT</BodyText>
              </DetailRow>
              <DetailRow label="Estimated APY">
                <BodyText className="text-text-positive">14.2%</BodyText>
              </DetailRow>
            </div>
          </Box>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="text" onClick={() => onToggle(false)}>
            Cancel
          </Button>
          <Button onClick={() => onToggle(false)}>
            Confirm Delegation
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const meta: Meta<typeof DelegationConfirmModal> = {
  component: DelegationConfirmModal,
  title: 'Prototypes/DelegationConfirmModal',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof DelegationConfirmModal>;

export const Default: Story = {};