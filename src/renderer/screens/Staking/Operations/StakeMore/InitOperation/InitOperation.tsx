import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { useEffect, useState } from 'react';

import { DropdownOption, DropdownResult } from '@renderer/components/ui/Dropdowns/common/types';
import { useI18n } from '@renderer/context/I18nContext';
import { Asset } from '@renderer/domain/asset';
import { Balance, Balance as AccountBalance } from '@renderer/domain/balance';
import { ChainId, AccountId, SigningType } from '@renderer/domain/shared-kernel';
import { Transaction, TransactionType } from '@renderer/domain/transaction';
import { useAccount } from '@renderer/services/account/accountService';
import { useBalance } from '@renderer/services/balance/balanceService';
import { formatAmount, stakeableAmount } from '@renderer/shared/utils/balance';
import { nonNullable } from '@renderer/shared/utils/functions';
import { OperationForm } from '../../components';
import { toAddress } from '@renderer/shared/utils/address';
import { Account, isMultisig } from '@renderer/domain/account';
import { MultiSelect, Select, InputHint } from '@renderer/components/ui-redesign';
import {
  getStakeAccountOption,
  validateBalanceForFee,
  validateStake,
  getSignatoryOptions,
  validateBalanceForFeeDeposit,
} from '../../common/utils';

export type StakeMoreResult = {
  accounts: Account[];
  amount: string;
  signer?: Account;
  description?: string;
};

type Props = {
  api: ApiPromise;
  accounts: Account[];
  chainId: ChainId;
  addressPrefix: number;
  asset: Asset;
  onResult: (data: StakeMoreResult) => void;
};

const InitOperation = ({ api, chainId, accounts, addressPrefix, asset, onResult }: Props) => {
  const { t } = useI18n();
  const { getLiveAssetBalances } = useBalance();
  const { getLiveAccounts } = useAccount();

  const dbAccounts = getLiveAccounts();

  const [fee, setFee] = useState('');
  const [feeLoading, setFeeLoading] = useState(true);
  const [deposit, setDeposit] = useState('');
  const [amount, setAmount] = useState('');

  const [minBalance, setMinBalance] = useState('0');
  const [activeBalances, setActiveBalances] = useState<Balance[]>([]);

  const [stakeMoreAccounts, setStakeMoreAccounts] = useState<DropdownOption<Account>[]>([]);
  const [activeStakeMoreAccounts, setActiveStakeMoreAccounts] = useState<DropdownResult<Account>[]>([]);

  const [activeSignatory, setActiveSignatory] = useState<DropdownResult<Account>>();
  const [signatoryOptions, setSignatoryOptions] = useState<DropdownOption<Account>[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const firstAccount = activeStakeMoreAccounts[0]?.value;
  const accountIsMultisig = isMultisig(firstAccount);
  const formFields = accountIsMultisig ? [{ name: 'amount' }, { name: 'description' }] : [{ name: 'amount' }];

  const accountIds = accounts.map((account) => account.accountId);
  const balances = getLiveAssetBalances(accountIds, chainId, asset.assetId.toString());

  const signatoryIds = accountIsMultisig ? firstAccount.signatories.map((s) => s.accountId) : [];
  const signatoriesBalances = getLiveAssetBalances(signatoryIds, chainId, asset.assetId.toString());
  const signerBalance = signatoriesBalances.find((b) => b.accountId === activeSignatory?.value.accountId);

  useEffect(() => {
    const balancesMap = new Map(balances.map((balance) => [balance.accountId, balance]));
    const newActiveBalances = activeStakeMoreAccounts
      .map((a) => balancesMap.get(a.id as AccountId))
      .filter(nonNullable) as AccountBalance[];

    setActiveBalances(newActiveBalances);
  }, [activeStakeMoreAccounts.length, balances]);

  useEffect(() => {
    if (accountIsMultisig || activeBalances.length === 1) {
      setMinBalance(stakeableAmount(activeBalances[0]));

      return;
    }

    if (!activeBalances.length) {
      setMinBalance('0');
    } else {
      const stakeableBalance = activeBalances.map(stakeableAmount).filter((balance) => balance && balance !== '0');
      const minBalance = stakeableBalance.reduce<string>(
        (acc, balance) => (new BN(balance).lt(new BN(acc)) ? balance : acc),
        stakeableBalance[0],
      );

      setMinBalance(minBalance);
    }
  }, [activeBalances.length]);

  useEffect(() => {
    const formattedAccounts = accounts.map((account) => {
      const balance = balances.find((b) => b.accountId === account.accountId);

      return getStakeAccountOption(account, { balance, asset, fee, addressPrefix, amount });
    });

    setStakeMoreAccounts(formattedAccounts);
  }, [amount, fee, balances, accounts.length]);

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
    if (stakeMoreAccounts.length === 0) return;

    const activeAccounts = stakeMoreAccounts.map(({ id, value }) => ({ id, value }));
    setActiveStakeMoreAccounts(activeAccounts);
  }, [stakeMoreAccounts.length]);

  useEffect(() => {
    if (!minBalance) return;

    const newTransactions = activeStakeMoreAccounts.map(({ id }) => {
      return {
        chainId,
        type: TransactionType.STAKE_MORE,
        address: toAddress(id, { prefix: addressPrefix }),
        args: { maxAdditional: formatAmount(amount, asset.precision) },
      };
    });

    setTransactions(newTransactions);
  }, [minBalance, amount]);

  const submitStakeMore = (data: { amount: string; description?: string }) => {
    const selectedAccountIds = activeStakeMoreAccounts.map((stake) => stake.id);
    const selectedAccounts = accounts.filter((account) => selectedAccountIds.includes(account.accountId));

    onResult({
      accounts: selectedAccounts,
      amount: formatAmount(data.amount, asset.precision),
      ...(accountIsMultisig && {
        description:
          data.description || t('transactionMessage.stakeMore', { amount: data.amount, asset: asset.symbol }),
        signer: activeSignatory?.value,
      }),
    });
  };

  const validateBalance = (amount: string): boolean => {
    return activeBalances.every((b) => validateStake(b, amount, asset.precision));
  };

  const validateFee = (amount: string): boolean => {
    if (!accountIsMultisig) {
      return activeBalances.every((b) => validateStake(b, amount, asset.precision, fee));
    }

    if (!signerBalance) return false;

    return validateBalanceForFee(signerBalance, fee);
  };

  const validateDeposit = (): boolean => {
    if (!accountIsMultisig) return true;
    if (!signerBalance) return false;

    return validateBalanceForFeeDeposit(signerBalance, deposit, fee);
  };

  const getBalanceRange = (): string | string[] => {
    if (activeSignatory) return minBalance;

    return activeBalances.length > 1 ? ['0', minBalance] : minBalance;
  };

  const getActiveAccounts = (): AccountId[] => {
    if (!accountIsMultisig) return activeStakeMoreAccounts.map((acc) => acc.id as AccountId);

    return activeSignatory ? [activeSignatory.id as AccountId] : [];
  };

  const canSubmit = !feeLoading && (activeStakeMoreAccounts.length > 0 || Boolean(activeSignatory));

  return (
    <div className="flex flex-col gap-y-4 w-[440px] px-5 py-4">
      <OperationForm
        chainId={chainId}
        accounts={getActiveAccounts()}
        canSubmit={canSubmit}
        addressPrefix={addressPrefix}
        fields={formFields}
        asset={asset}
        balanceRange={getBalanceRange()}
        validateBalance={validateBalance}
        validateFee={validateFee}
        validateDeposit={validateDeposit}
        footer={
          <OperationForm.Footer
            api={api}
            asset={asset}
            account={firstAccount}
            totalAccounts={activeStakeMoreAccounts.length}
            transaction={transactions[0]}
            onFeeChange={setFee}
            onFeeLoading={setFeeLoading}
            onDepositChange={setDeposit}
          />
        }
        onSubmit={submitStakeMore}
        onAmountChange={setAmount}
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
              selectedIds={activeStakeMoreAccounts.map((acc) => acc.id)}
              options={stakeMoreAccounts}
              onChange={setActiveStakeMoreAccounts}
            />
          )
        }
      </OperationForm>
    </div>
  );
};

export default InitOperation;
