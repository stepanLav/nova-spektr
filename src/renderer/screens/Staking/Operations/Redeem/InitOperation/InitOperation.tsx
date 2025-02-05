import { ApiPromise } from '@polkadot/api';
import { BN, BN_ZERO } from '@polkadot/util';
import { useEffect, useState } from 'react';

import { DropdownOption, DropdownResult } from '@renderer/components/ui/Dropdowns/common/types';
import { useI18n } from '@renderer/context/I18nContext';
import { Asset } from '@renderer/domain/asset';
import { Balance as AccountBalance } from '@renderer/domain/balance';
import { ChainId, AccountId, SigningType } from '@renderer/domain/shared-kernel';
import { Transaction, TransactionType } from '@renderer/domain/transaction';
import { useAccount } from '@renderer/services/account/accountService';
import { useBalance } from '@renderer/services/balance/balanceService';
import { redeemableAmount, formatBalance } from '@renderer/shared/utils/balance';
import { nonNullable } from '@renderer/shared/utils/functions';
import { toAddress } from '@renderer/shared/utils/address';
import { Account, isMultisig } from '@renderer/domain/account';
import { StakingMap } from '@renderer/services/staking/common/types';
import { MultiSelect, Select, InputHint } from '@renderer/components/ui-redesign';
import { useStakingData } from '@renderer/services/staking/stakingDataService';
import { useEra } from '@renderer/services/staking/eraService';
import { OperationForm } from '../../components';
import {
  validateBalanceForFee,
  getSignatoryOptions,
  validateBalanceForFeeDeposit,
  getRedeemAccountOption,
} from '../../common/utils';

export type RedeemResult = {
  accounts: Account[];
  amounts: string[];
  signer?: Account;
  description?: string;
};

type Props = {
  api: ApiPromise;
  chainId: ChainId;
  accounts: Account[];
  addressPrefix: number;
  asset: Asset;
  onResult: (data: RedeemResult) => void;
};

const InitOperation = ({ api, chainId, accounts, addressPrefix, asset, onResult }: Props) => {
  const { t } = useI18n();
  const { getLiveAccounts } = useAccount();
  const { getLiveAssetBalances } = useBalance();
  const { subscribeStaking } = useStakingData();
  const { subscribeActiveEra } = useEra();

  const dbAccounts = getLiveAccounts();

  const [fee, setFee] = useState('');
  const [feeLoading, setFeeLoading] = useState(true);
  const [deposit, setDeposit] = useState('');
  const [redeemAmounts, setRedeemAmounts] = useState<string[]>([]);
  const [era, setEra] = useState<number>();
  const [staking, setStaking] = useState<StakingMap>({});

  const [redeemAccounts, setRedeemAccounts] = useState<DropdownOption<Account>[]>([]);
  const [activeRedeemAccounts, setActiveRedeemAccounts] = useState<DropdownResult<Account>[]>([]);

  const [activeSignatory, setActiveSignatory] = useState<DropdownResult<Account>>();
  const [signatoryOptions, setSignatoryOptions] = useState<DropdownOption<Account>[]>([]);

  const [activeBalances, setActiveBalances] = useState<AccountBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const totalRedeem = redeemAmounts.reduce((acc, amount) => acc.add(new BN(amount)), BN_ZERO).toString();

  const firstAccount = activeRedeemAccounts[0]?.value;
  const accountIsMultisig = isMultisig(firstAccount);
  const redeemBalance = formatBalance(totalRedeem, asset.precision);
  const formFields = accountIsMultisig
    ? [{ name: 'amount', value: redeemBalance.value, disabled: true }, { name: 'description' }]
    : [{ name: 'amount', value: redeemBalance.value, disabled: true }];

  const accountIds = accounts.map((account) => account.accountId);
  const balances = getLiveAssetBalances(accountIds, chainId, asset.assetId.toString());

  const signatoryIds = accountIsMultisig ? firstAccount.signatories.map((s) => s.accountId) : [];
  const signatoriesBalances = getLiveAssetBalances(signatoryIds, chainId, asset.assetId.toString());
  const signerBalance = signatoriesBalances.find((b) => b.accountId === activeSignatory?.value.accountId);

  useEffect(() => {
    const addresses = activeRedeemAccounts.map((stake) => toAddress(stake.id, { prefix: addressPrefix }));

    let unsubEra: () => void | undefined;
    let unsubStaking: () => void | undefined;
    (async () => {
      unsubEra = await subscribeActiveEra(api, setEra);
      unsubStaking = await subscribeStaking(chainId, api, addresses, setStaking);
    })();

    return () => {
      unsubEra?.();
      unsubStaking?.();
    };
  }, [api, activeRedeemAccounts.length]);

  useEffect(() => {
    const balancesMap = new Map(balances.map((balance) => [balance.accountId, balance]));
    const newActiveBalances = activeRedeemAccounts
      .map((a) => balancesMap.get(a.id as AccountId))
      .filter(nonNullable) as AccountBalance[];

    setActiveBalances(newActiveBalances);
  }, [activeRedeemAccounts.length, balances]);

  useEffect(() => {
    const formattedAccounts = accounts.map((account) => {
      const address = toAddress(account.accountId, { prefix: addressPrefix });
      const stake = staking[address];

      return getRedeemAccountOption(account, { asset, addressPrefix, stake, era });
    });

    setRedeemAccounts(formattedAccounts);
  }, [staking, era, accounts.length]);

  useEffect(() => {
    if (!era) return;

    const amounts = activeRedeemAccounts.map(({ value }) => {
      const address = toAddress(value.accountId, { prefix: addressPrefix });

      return redeemableAmount(staking[address]?.unlocking, era);
    });

    setRedeemAmounts(amounts);
  }, [activeRedeemAccounts.length, staking, era]);

  useEffect(() => {
    if (!accountIsMultisig) return;

    const signerOptions = dbAccounts.reduce<DropdownOption<Account>[]>((acc, signer) => {
      const isWatchOnly = signer.signingType === SigningType.WATCH_ONLY;
      const signerExist = signatoryIds.includes(signer.accountId);
      if (!isWatchOnly && signerExist) {
        const balance = signatoriesBalances.find((b) => b.accountId === signer.accountId);

        acc.push(getSignatoryOptions(signer, { addressPrefix, asset, balance }));
      }

      return acc;
    }, []);

    if (signerOptions.length === 0) return;

    setSignatoryOptions(signerOptions);
    setActiveSignatory({ id: signerOptions[0].id, value: signerOptions[0].value });
  }, [accountIsMultisig, dbAccounts.length, signatoriesBalances.length]);

  useEffect(() => {
    if (redeemAccounts.length === 0) return;

    const activeAccounts = redeemAccounts.map(({ id, value }) => ({ id, value }));
    setActiveRedeemAccounts(activeAccounts);
  }, [redeemAccounts.length]);

  useEffect(() => {
    const newTransactions = activeRedeemAccounts.map(({ value }) => {
      return {
        chainId,
        address: toAddress(value.accountId, { prefix: addressPrefix }),
        type: TransactionType.REDEEM,
        args: { numSlashingSpans: 1 },
      };
    });

    setTransactions(newTransactions);
  }, [activeRedeemAccounts.length]);

  const submitRedeem = (data: { description?: string }) => {
    const {
      value: formattedValue,
      decimalPlaces,
      suffix,
    } = formatBalance(
      redeemAmounts.reduce((acc, amount) => acc.add(new BN(amount)), BN_ZERO).toString(),
      asset.precision,
    );

    const redeemAmountFormatted = t('assetBalance.numberWithSuffix', {
      value: formattedValue,
      maximumFractionDigits: decimalPlaces,
      suffix,
    });

    onResult({
      amounts: redeemAmounts,
      accounts: activeRedeemAccounts.map((activeOption) => activeOption.value),
      ...(accountIsMultisig && {
        description:
          data.description || t('transactionMessage.redeem', { amount: redeemAmountFormatted, asset: asset.symbol }),
        signer: activeSignatory?.value,
      }),
    });
  };

  const validateFee = (): boolean => {
    if (!accountIsMultisig) {
      return activeBalances.every((b) => validateBalanceForFee(b, fee));
    }

    if (!signerBalance) return false;

    return validateBalanceForFee(signerBalance, fee);
  };

  const validateDeposit = (): boolean => {
    if (!accountIsMultisig) return true;
    if (!signerBalance) return false;

    return validateBalanceForFeeDeposit(signerBalance, deposit, fee);
  };

  const getActiveAccounts = (): AccountId[] => {
    if (!accountIsMultisig) return activeRedeemAccounts.map((acc) => acc.id as AccountId);

    return activeSignatory ? [activeSignatory.id as AccountId] : [];
  };

  const canSubmit = !feeLoading && (activeRedeemAccounts.length > 0 || Boolean(activeSignatory));

  return (
    <div className="flex flex-col gap-y-4 w-[440px] px-5 py-4">
      <OperationForm
        chainId={chainId}
        accounts={getActiveAccounts()}
        canSubmit={canSubmit}
        addressPrefix={addressPrefix}
        fields={formFields}
        asset={asset}
        balanceRange={totalRedeem}
        validateFee={validateFee}
        validateDeposit={validateDeposit}
        footer={
          <OperationForm.Footer
            api={api}
            asset={asset}
            account={firstAccount}
            totalAccounts={activeRedeemAccounts.length}
            transaction={transactions[0]}
            onFeeChange={setFee}
            onFeeLoading={setFeeLoading}
            onDepositChange={setDeposit}
          />
        }
        onSubmit={submitRedeem}
      >
        {({ invalidBalance, invalidFee, invalidDeposit }) =>
          accountIsMultisig ? (
            <div className="flex flex-col gap-y-2 mb-4">
              <Select
                label={t('staking.bond.signatoryLabel')}
                placeholder={t('staking.bond.signatoryPlaceholder')}
                disabled={!signatoryOptions.length}
                invalid={invalidDeposit || invalidFee}
                selectedId={activeSignatory?.id}
                options={signatoryOptions}
                onChange={setActiveSignatory}
              />
              <InputHint active={!signatoryOptions.length}>{t('multisigOperations.noSignatory')}</InputHint>
            </div>
          ) : (
            <MultiSelect
              className="mb-4"
              label={t('staking.bond.accountLabel')}
              placeholder={t('staking.bond.accountPlaceholder')}
              multiPlaceholder={t('staking.bond.manyAccountsPlaceholder')}
              invalid={invalidBalance || invalidFee}
              selectedIds={activeRedeemAccounts.map((acc) => acc.id)}
              options={redeemAccounts}
              onChange={setActiveRedeemAccounts}
            />
          )
        }
      </OperationForm>
    </div>
  );
};

export default InitOperation;
