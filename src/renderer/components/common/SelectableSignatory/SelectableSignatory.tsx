import cnTw from '@renderer/shared/utils/twMerge';
import AccountAddress, {
  getAddress,
  Props as AccountAddressProps,
} from '@renderer/components/common/AccountAddress/AccountAddress';
import { InfoPopover } from '@renderer/components/ui-redesign';
import { Icon } from '@renderer/components/ui';
import { Explorer } from '@renderer/domain/chain';
import useAddressInfo from '@renderer/components/common/AccountAddress/useAddressInfo';
import { toAccountId } from '@renderer/shared/utils/address';
import { useBalance } from '@renderer/services/balance/balanceService';
import { ChainId } from '@renderer/domain/shared-kernel';
import { Asset } from '@renderer/domain/asset';
import BalanceNew from '../BalanceNew/BalanceNew';
import { transferableAmount } from '@renderer/shared/utils/balance';

type Props<T extends any> = {
  explorers?: Explorer[];
  value: T;
  onSelected: (value: T) => void;
  chainId: ChainId;
  asset: Asset;
} & AccountAddressProps;

const SelectableSignatory = <T extends any>({
  explorers,
  size = 20,
  value,
  onSelected,
  chainId,
  asset,
  name,
  ...addressProps
}: Props<T>) => {
  const address = getAddress(addressProps);

  const { getLiveBalance } = useBalance();
  const popoverItems = useAddressInfo(address, explorers, true);

  const balance = getLiveBalance(toAccountId(address), chainId, asset.assetId.toString());

  return (
    <button
      className="group flex items-center cursor-pointer hover:bg-action-background-hover px-2 py-1.5 rounded w-full text-text-secondary active:text-text-primary"
      onClick={() => onSelected(value)}
    >
      <AccountAddress addressFont="text-body text-inherit" size={size} name={name} {...addressProps} />
      <InfoPopover data={popoverItems}>
        <Icon name="info" size={14} className="text-icon-default ml-2 mr-auto" />
      </InfoPopover>
      {balance && asset && (
        <BalanceNew value={transferableAmount(balance)} asset={asset} className="text-body text-inherit ml-auto mr-6" />
      )}
      <Icon name="right" className={cnTw('text-icon-default', !balance && 'ml-auto')} size={20} />
    </button>
  );
};

export default SelectableSignatory;
