import { combine, createEffect, createEvent, createStore, sample } from 'effector';

import { type Wallet } from '@/shared/core';
import { toAccountId } from '@/shared/lib/utils';
import { walletModel, walletUtils } from '@/entities/wallet';
import { balanceSubModel } from '@/features/balances';
import { type SignatoryInfo } from '../lib/types';

const signatoriesChanged = createEvent<SignatoryInfo>();
const signatoryDeleted = createEvent<number>();
const getSignatoriesBalance = createEvent<Wallet[]>();

const $signatories = createStore<Map<number, Omit<SignatoryInfo, 'index'>>>(new Map([[0, { name: '', address: '' }]]));
const $hasDuplicateSignatories = combine($signatories, (signatories) => {
  const signatoriesArray = Array.from(signatories.values()).map(({ address }) => toAccountId(address));

  return new Set(signatoriesArray).size !== signatoriesArray.length;
});

const $ownedSignatoriesWallets = combine(
  { wallets: walletModel.$wallets, signatories: $signatories },
  ({ wallets, signatories }) =>
    walletUtils.getWalletsFilteredAccounts(wallets, {
      walletFn: (w) => !walletUtils.isWatchOnly(w) && !walletUtils.isMultisig(w),
      accountFn: (a) => Array.from(signatories.values()).some((s) => toAccountId(s.address) === a.accountId),
    }) || [],
);

const populateBalanceFx = createEffect((wallets: Wallet[]) => {
  for (const wallet of wallets) {
    balanceSubModel.events.walletToSubSet(wallet);
  }
});

sample({
  clock: getSignatoriesBalance,
  target: populateBalanceFx,
});

sample({
  clock: signatoriesChanged,
  source: $signatories,
  fn: (signatories, { index, name, address }) => {
    // we need to return new Map to trigger re-render
    const newMap = new Map(signatories);
    newMap.set(index, { name, address });

    return newMap;
  },
  target: $signatories,
});

sample({
  clock: signatoryDeleted,
  source: $signatories,
  filter: (signatories, index) => signatories.has(index),
  fn: (signatories, index) => {
    // we need to return new Map to trigger re-render
    const newMap = new Map(signatories);
    newMap.delete(index);

    return newMap;
  },
  target: $signatories,
});

export const signatoryModel = {
  $signatories,
  $ownedSignatoriesWallets,
  $hasDuplicateSignatories,
  events: {
    signatoriesChanged,
    signatoryDeleted,
    getSignatoriesBalance,
  },
};
