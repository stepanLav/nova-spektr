import { BN } from '@polkadot/util';
import { useEffect, useState } from 'react';
import { Controller, useForm, SubmitHandler } from 'react-hook-form';
import { ApiPromise } from '@polkadot/api';
import { Trans } from 'react-i18next';

import { toAccountId, validateAddress, toAddress } from '@renderer/shared/utils/address';
import { Icon, Identicon } from '@renderer/components/ui';
import { Fee, Deposit, DetailRow } from '@renderer/components/common';
import { useI18n } from '@renderer/context/I18nContext';
import { Asset, AssetType } from '@renderer/domain/asset';
import { Transaction, MultisigTxInitStatus, TransactionType } from '@renderer/domain/transaction';
import { useBalance } from '@renderer/services/balance/balanceService';
import { formatAmount, transferableAmount } from '@renderer/shared/utils/balance';
import { Address, ChainId, AccountId } from '@renderer/domain/shared-kernel';
import { useTransaction } from '@renderer/services/transaction/transactionService';
import { useMultisigTx } from '@renderer/services/multisigTx/multisigTxService';
import { getAssetId } from '@renderer/shared/utils/assets';
import { MultisigAccount, Account, isMultisig } from '@renderer/domain/account';
import { Button, AmountInput, Input, InputHint, FootnoteText, Tooltip } from '@renderer/components/ui-redesign';

const DESCRIPTION_MAX_LENGTH = 120;

type TransferFormData = {
  amount: string;
  signatory: Address;
  destination: Address;
  description: string;
};

type Props = {
  api: ApiPromise;
  chainId: ChainId;
  network: string;
  account?: Account | MultisigAccount;
  signer?: Account;
  asset: Asset;
  nativeToken: Asset;
  addressPrefix: number;
  onSubmit: (transferTx: Transaction, multisig?: { multisigTx: Transaction; description: string }) => void;
  onChangeAmount: (amount: string) => void;
  onChangeFee: (fee: string) => void;
  onChangeDeposit: (deposit: string) => void;
};

export const TransferForm = ({
  api,
  chainId,
  account,
  signer,
  asset,
  nativeToken,
  addressPrefix,
  onSubmit,
  onChangeAmount,
  onChangeFee,
  onChangeDeposit,
}: Props) => {
  const { t } = useI18n();
  const { getBalance } = useBalance();
  const { getMultisigTxs } = useMultisigTx();
  const { getTransactionHash } = useTransaction();

  const [fee, setFee] = useState('');
  const [feeLoading, setFeeLoading] = useState(false);
  const [deposit, setDeposit] = useState('');

  const [accountBalance, setAccountBalance] = useState('');
  const [signerBalance, setSignerBalance] = useState('');
  const [accountNativeTokenBalance, setAccountNativeTokenBalance] = useState<string>();
  const [signerNativeTokenBalance, setSignerNativeTokenBalance] = useState<string>();

  const [transferTx, setTransferTx] = useState<Transaction>();
  const [multisigTx, setMultisigTx] = useState<Transaction>();
  const [multisigTxExist, setMultisigTxExist] = useState(false);

  const {
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { isValid, isDirty },
  } = useForm<TransferFormData>({
    mode: 'onChange',
    defaultValues: { amount: '', destination: '', signatory: '', description: '' },
  });

  const amount = watch('amount');
  const destination = watch('destination');

  useEffect(() => {
    isDirty && trigger('amount');
  }, [accountBalance, signerBalance]);

  useEffect(() => {
    onChangeAmount(formatAmount(amount, asset.precision));
  }, [amount]);

  useEffect(() => {
    onChangeFee(fee);
  }, [fee]);

  useEffect(() => {
    onChangeDeposit(deposit);
  }, [deposit]);

  const setupBalances = (
    address: Address,
    callbackNativeToken: (balance: string) => void,
    callbackBalance: (balance: string) => void,
  ) => {
    const accountId = toAccountId(address);

    getBalance(accountId, chainId, asset.assetId.toString()).then((balance) => {
      callbackBalance(balance ? transferableAmount(balance) : '0');
    });

    if (asset.assetId !== 0) {
      getBalance(accountId, chainId, '0').then((balance) => {
        callbackNativeToken(balance ? transferableAmount(balance) : '0');
      });
    }
  };

  useEffect(() => {
    if (!account) return;

    setupBalances(account.accountId, setAccountNativeTokenBalance, setAccountBalance);
  }, [account]);

  useEffect(() => {
    if (!signer) return;

    setupBalances(signer.accountId, setSignerNativeTokenBalance, setSignerBalance);
  }, [signer]);

  useEffect(() => {
    if (!isMultisig(account)) {
      setMultisigTx(undefined);
      setDeposit('0');
    }
  }, [account]);

  useEffect(() => {
    if (!account || !amount || !validateAddress(destination)) return;

    const transferPayload = getTransferTx(account.accountId);

    if (isMultisig(account) && signer) {
      setMultisigTx(getMultisigTx(account, signer.accountId, transferPayload));
    }

    setTransferTx(transferPayload);
  }, [account, signer, destination, amount]);

  const getTransferTx = (accountId: AccountId): Transaction => {
    const TransferType: Record<AssetType, TransactionType> = {
      [AssetType.ORML]: TransactionType.ORML_TRANSFER,
      [AssetType.STATEMINE]: TransactionType.ASSET_TRANSFER,
    };

    return {
      chainId,
      address: toAddress(accountId, { prefix: addressPrefix }),
      type: asset.type ? TransferType[asset.type] : TransactionType.TRANSFER,
      args: {
        dest: toAddress(destination, { prefix: addressPrefix }),
        value: formatAmount(amount, asset.precision),
        assetId: getAssetId(asset),
      },
    };
  };

  const getMultisigTx = (
    account: MultisigAccount,
    signerAccountId: AccountId,
    transaction: Transaction,
  ): Transaction => {
    const { callData, callHash } = getTransactionHash(transaction, api);

    const otherSignatories = account.signatories.reduce<Address[]>((acc, s) => {
      if (s.accountId !== signerAccountId) {
        acc.push(toAddress(s.accountId, { prefix: addressPrefix }));
      }

      return acc;
    }, []);

    return {
      chainId,
      address: toAddress(signerAccountId, { prefix: addressPrefix }),
      type: TransactionType.MULTISIG_AS_MULTI,
      args: {
        threshold: account.threshold,
        otherSignatories: otherSignatories.sort(),
        maybeTimepoint: null,
        callData,
        callHash,
      },
    };
  };

  const validateBalance = (amount: string): boolean => {
    if (!accountBalance) return false;

    return new BN(formatAmount(amount, asset.precision)).lte(new BN(accountBalance));
  };

  const validateBalanceForFee = (amount: string): boolean => {
    const balance = isMultisig(account) ? signerBalance : accountBalance;
    const nativeTokenBalance = isMultisig(account) ? signerNativeTokenBalance : accountNativeTokenBalance;

    if (!balance) return false;

    if (nativeTokenBalance) {
      return new BN(fee).lte(new BN(nativeTokenBalance));
    }

    if (isMultisig(account)) {
      return new BN(fee).lte(new BN(balance));
    }

    return new BN(fee).add(new BN(formatAmount(amount, asset.precision))).lte(new BN(balance));
  };

  const validateBalanceForFeeAndDeposit = (): boolean => {
    if (!isMultisig(account)) return true;
    if (!signerBalance) return false;

    if (signerNativeTokenBalance) {
      return new BN(deposit).add(new BN(fee)).lte(new BN(signerNativeTokenBalance));
    }

    return new BN(deposit).add(new BN(fee)).lte(new BN(signerBalance));
  };

  const updateFee = async (fee: string) => {
    setFee(fee);

    if (fee !== '0') {
      await trigger('amount');
    }
  };

  const submitTransaction: SubmitHandler<TransferFormData> = async ({ description }) => {
    if (!transferTx) return;

    if (!multisigTx) {
      onSubmit(transferTx);

      return;
    }

    const { callHash } = getTransactionHash(transferTx, api);
    const multisigTxs = await getMultisigTxs({ chainId, callHash, status: MultisigTxInitStatus.SIGNING });

    if (multisigTxs.length !== 0) {
      setMultisigTxExist(true);
    } else {
      description =
        description ||
        t('transactionMessage.transfer', {
          amount,
          asset: asset.symbol,
          address: transferTx.args.dest,
        });

      onSubmit(transferTx, { multisigTx, description });
    }
  };

  return (
    <form className="w-full" onSubmit={handleSubmit(submitTransaction)}>
      <div className="flex flex-col gap-y-4">
        <Controller
          name="destination"
          control={control}
          rules={{ required: true, validate: validateAddress }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <div className="flex flex-col gap-y-2">
              <Input
                prefixElement={
                  value && !error ? (
                    <Identicon className="mr-2" size={20} address={value} background={false} />
                  ) : (
                    <Icon className="mr-2" size={20} name="emptyIdenticon" />
                  )
                }
                className="w-full"
                invalid={Boolean(error)}
                value={value}
                label={t('transfer.recipientLabel')}
                placeholder={t('transfer.recipientPlaceholder')}
                onChange={onChange}
              />
              <InputHint active={error?.type === 'validate'} variant="error">
                {t('transfer.incorrectRecipientError')}
              </InputHint>
              <InputHint active={error?.type === 'required'} variant="error">
                {t('transfer.requiredRecipientError')}
              </InputHint>
            </div>
          )}
        />

        <Controller
          name="amount"
          control={control}
          rules={{
            required: true,
            validate: {
              notZero: (v) => Number(v) > 0,
              insufficientBalance: validateBalance,
              insufficientBalanceForFee: validateBalanceForFee,
              insufficientBalanceForDeposit: validateBalanceForFeeAndDeposit,
            },
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <div className="flex flex-col gap-y-2">
              <AmountInput
                invalid={Boolean(error)}
                value={value}
                balance={accountBalance}
                balancePlaceholder={t('general.input.availableLabel')}
                placeholder={t('general.input.amountLabel')}
                asset={asset}
                onChange={onChange}
              />
              <InputHint active={error?.type === 'insufficientBalance'} variant="error">
                {t('transfer.notEnoughBalanceError')}
              </InputHint>
              <InputHint active={error?.type === 'insufficientBalanceForFee'} variant="error">
                {t('transfer.notEnoughBalanceForFeeError')}
              </InputHint>
              <InputHint active={error?.type === 'insufficientBalanceForDeposit'} variant="error">
                {t('transfer.notEnoughBalanceForDepositError')}
              </InputHint>
              <InputHint active={error?.type === 'required'} variant="error">
                {t('transfer.requiredAmountError')}
              </InputHint>
              <InputHint active={error?.type === 'notZero'} variant="error">
                {t('transfer.requiredAmountError')}
              </InputHint>
            </div>
          )}
        />

        {isMultisig(account) && (
          <Controller
            name="description"
            control={control}
            rules={{ maxLength: DESCRIPTION_MAX_LENGTH }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <div className="flex flex-col gap-y-2">
                <Input
                  spellCheck
                  className="w-full"
                  label={t('general.input.descriptionLabel')}
                  placeholder={t('general.input.descriptionPlaceholder')}
                  invalid={Boolean(error)}
                  value={value}
                  onChange={onChange}
                />
                <InputHint active={error?.type === 'maxLength'} variant="error">
                  <Trans
                    t={t}
                    i18nKey="transfer.descriptionLengthError"
                    values={{ maxLength: DESCRIPTION_MAX_LENGTH }}
                  />
                </InputHint>
              </div>
            )}
          />
        )}

        <div className="flex flex-col items-center mt-2 gap-y-4">
          {isMultisig(account) && (
            <DetailRow
              label={
                <div className="flex items-center gap-x-1">
                  <Icon className="text-text-tertiary" name="lock" size={12} />
                  <FootnoteText className="text-text-tertiary">{t('transfer.networkDeposit')}</FootnoteText>
                  <Tooltip offsetPx={-92} content={<Trans t={t} i18nKey="transfer.networkDepositHint" />}>
                    <Icon name="info" className="text-icon-default hover:text-icon-hover cursor-pointer" size={16} />
                  </Tooltip>
                </div>
              }
              className="text-text-primary"
            >
              <Deposit
                className="text-footnote text-text-primary"
                api={api}
                asset={nativeToken}
                threshold={account.threshold}
                onDepositChange={setDeposit}
              />
            </DetailRow>
          )}
          <DetailRow label={t('operation.networkFee')} className="text-text-primary">
            {api && (
              <Fee
                className="text-footnote text-text-primary"
                api={api}
                asset={nativeToken}
                transaction={transferTx}
                onFeeLoading={setFeeLoading}
                onFeeChange={updateFee}
              />
            )}
          </DetailRow>
        </div>
      </div>

      <InputHint className="mt-2" active={multisigTxExist} variant="error">
        {t('transfer.multisigTransactionExist')}
      </InputHint>

      <Button className="w-fit flex-0 mt-7 ml-auto" type="submit" disabled={feeLoading || !isValid}>
        {t('transfer.continueButton')}
      </Button>
    </form>
  );
};
