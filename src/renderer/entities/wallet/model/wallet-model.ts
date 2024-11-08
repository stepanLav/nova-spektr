import { combine, createEffect, createEvent, createStore, sample } from 'effector';
import groupBy from 'lodash/groupBy';
import { combineEvents } from 'patronum';

import { storageService } from '@/shared/api/storage';
import {
  type Account,
  type BaseAccount,
  type ChainAccount,
  type ID,
  type MultisigAccount,
  type NoID,
  type Wallet,
  type WcAccount,
} from '@/shared/core';
import { dictionary } from '@/shared/lib/utils';
import { modelUtils } from '../lib/model-utils';

type DbWallet = Omit<Wallet, 'accounts'>;

type CreateParams<T extends Account = Account> = {
  wallet: Omit<NoID<Wallet>, 'isActive' | 'accounts'>;
  accounts: Omit<NoID<T>, 'walletId'>[];
};

const walletStarted = createEvent();
const watchOnlyCreated = createEvent<CreateParams<BaseAccount>>();
const multishardCreated = createEvent<CreateParams<BaseAccount | ChainAccount>>();
const singleshardCreated = createEvent<CreateParams<BaseAccount>>();
const multisigCreated = createEvent<CreateParams<MultisigAccount>>();
const walletConnectCreated = createEvent<CreateParams<WcAccount>>();

const walletRestored = createEvent<Wallet>();
const walletHidden = createEvent<Wallet>();
const walletRemoved = createEvent<ID>();
const walletsRemoved = createEvent<ID[]>();

const $allWallets = createStore<Wallet[]>([]);
const $wallets = $allWallets.map((wallets) => wallets.filter((x) => !x.isHidden));
const $hiddenWallets = $allWallets.map((wallets) => wallets.filter((x) => x.isHidden));

// TODO: ideally it should be a feature
const $activeWallet = combine(
  $wallets,
  (wallets) => {
    return wallets.find((wallet) => wallet.isActive);
  },
  { skipVoid: false },
);

const fetchAllAccountsFx = createEffect((): Promise<Account[]> => {
  return storageService.accounts.readAll();
});

const fetchAllWalletsFx = createEffect(async (): Promise<DbWallet[]> => {
  const wallets = await storageService.wallets.readAll();

  // Deactivate wallets except first one if more than one selected
  const activeWallets = wallets.filter((wallet) => wallet.isActive);

  if (activeWallets.length > 1) {
    const inactiveWallets = activeWallets.slice(1).map((wallet) => ({ ...wallet, isActive: false }));
    await storageService.wallets.updateAll(inactiveWallets);

    const walletsMap = dictionary(wallets, 'id');

    for (const wallet of inactiveWallets) {
      walletsMap[wallet.id] = wallet;
    }

    return Object.values(walletsMap);
  }

  return wallets;
});

type CreateResult = {
  wallet: DbWallet;
  accounts: Account[];
};
const walletCreatedFx = createEffect(async ({ wallet, accounts }: CreateParams): Promise<CreateResult | undefined> => {
  const dbWallet = await storageService.wallets.create({ ...wallet, isActive: false });

  if (!dbWallet) return undefined;

  const accountsPayload = accounts.map((account) => ({ ...account, walletId: dbWallet.id }));
  const dbAccounts = await storageService.accounts.createAll(accountsPayload);

  if (!dbAccounts) return undefined;

  return { wallet: dbWallet, accounts: dbAccounts };
});

const multishardCreatedFx = createEffect(
  async ({ wallet, accounts }: CreateParams<BaseAccount | ChainAccount>): Promise<CreateResult | undefined> => {
    const dbWallet = await storageService.wallets.create({ ...wallet, isActive: false });

    if (!dbWallet) return undefined;

    const { base, chains } = modelUtils.groupAccounts(accounts);

    const multishardAccounts = [];

    for (const [index, baseAccount] of base.entries()) {
      const dbBaseAccount = await storageService.accounts.create({ ...baseAccount, walletId: dbWallet.id });
      if (!dbBaseAccount) return undefined;

      multishardAccounts.push(dbBaseAccount);
      if (!chains[index]) continue;

      const accountsPayload = chains[index].map((account) => ({
        ...account,
        walletId: dbWallet.id,
        baseId: dbBaseAccount.id,
      }));
      const dbChainAccounts = await storageService.accounts.createAll(accountsPayload);
      if (!dbChainAccounts) return undefined;

      multishardAccounts.push(...dbChainAccounts);
    }

    return { wallet: dbWallet, accounts: multishardAccounts };
  },
);

const removeWalletFx = createEffect(async (wallet: Wallet): Promise<ID> => {
  const accountIds = wallet.accounts.map((account) => account.id);

  await Promise.all([storageService.accounts.deleteAll(accountIds), storageService.wallets.delete(wallet.id)]);

  return wallet.id;
});

const removeWalletsFx = createEffect(async (wallets: Wallet[]): Promise<ID[]> => {
  const { walletIds, accountIds } = wallets.reduce<Record<'walletIds' | 'accountIds', ID[]>>(
    (acc, wallet) => {
      acc.walletIds.push(wallet.id);
      acc.accountIds.push(...wallet.accounts.map((account) => account.id));

      return acc;
    },
    { walletIds: [], accountIds: [] },
  );

  await Promise.all([storageService.accounts.deleteAll(accountIds), storageService.wallets.deleteAll(walletIds)]);

  return walletIds;
});

const hideWalletFx = createEffect(async (wallet: Wallet): Promise<Wallet> => {
  await storageService.wallets.update(wallet.id, { isHidden: true });

  return wallet;
});

const restoreWalletFx = createEffect(async (wallet: Wallet): Promise<Wallet> => {
  await storageService.wallets.update(wallet.id, { isHidden: false });

  return wallet;
});

sample({
  clock: walletStarted,
  target: [fetchAllAccountsFx, fetchAllWalletsFx],
});

sample({
  clock: combineEvents([fetchAllAccountsFx.doneData, fetchAllWalletsFx.doneData]),
  fn: ([accounts, allWallets]) => {
    const accountsMap = groupBy(accounts, 'walletId');

    return allWallets.map((wallet) => ({ ...wallet, accounts: accountsMap[wallet.id] }));
  },
  target: $allWallets,
});

sample({
  clock: [walletConnectCreated, watchOnlyCreated, multisigCreated, singleshardCreated],
  target: walletCreatedFx,
});

sample({
  clock: multishardCreated,
  target: multishardCreatedFx,
});

sample({
  clock: [walletCreatedFx.doneData, multishardCreatedFx.doneData],
  source: $allWallets,
  filter: (_, data) => Boolean(data),
  fn: (wallets, data) => {
    return wallets.concat({ ...data!.wallet, accounts: data!.accounts });
  },
  target: $allWallets,
});

sample({
  clock: walletRemoved,
  source: $allWallets,
  filter: (wallets, walletId) => {
    return wallets.some((wallet) => wallet.id === walletId);
  },
  fn: (wallets, walletId) => {
    return wallets.find((wallet) => wallet.id === walletId)!;
  },
  target: removeWalletFx,
});

sample({
  clock: walletsRemoved,
  source: $allWallets,
  filter: (wallets, walletIds) => {
    return wallets.some((wallet) => walletIds.includes(wallet.id));
  },
  fn: (wallets, walletIds) => {
    return wallets.filter((wallet) => walletIds.includes(wallet.id));
  },
  target: removeWalletsFx,
});

sample({
  clock: removeWalletFx.doneData,
  source: $allWallets,
  fn: (wallets, walletId) => {
    return wallets.filter((wallet) => wallet.id !== walletId);
  },
  target: $allWallets,
});

sample({
  clock: removeWalletsFx.doneData,
  source: $allWallets,
  fn: (wallets, walletIds) => {
    return wallets.filter((wallet) => !walletIds.includes(wallet.id));
  },
  target: $allWallets,
});

sample({
  clock: walletHidden,
  target: hideWalletFx,
});

sample({
  clock: hideWalletFx.doneData,
  source: $allWallets,
  fn: (wallets, walletToHide) => {
    return wallets.map((wallet) => {
      return wallet.id === walletToHide.id ? { ...wallet, isHidden: true } : wallet;
    });
  },
  target: $allWallets,
});

sample({
  clock: walletRestored,
  source: $hiddenWallets,
  filter: (hiddenWallets, walletToRestore) => {
    return hiddenWallets.some((wallet) => wallet.id === walletToRestore.id);
  },
  fn: (_, walletToRestore) => walletToRestore,
  target: restoreWalletFx,
});

sample({
  clock: restoreWalletFx.doneData,
  source: $allWallets,
  fn: (wallets, walletToRestore) => {
    return wallets.map((wallet) => {
      return wallet.id === walletToRestore.id ? { ...wallet, isHidden: false } : wallet;
    });
  },
  target: $allWallets,
});

export const walletModel = {
  $wallets,
  $allWallets,
  $hiddenWallets,
  $activeWallet,
  $isLoadingWallets: fetchAllWalletsFx.pending,

  events: {
    walletStarted,
    watchOnlyCreated,
    multishardCreated,
    singleshardCreated,
    multisigCreated,
    walletConnectCreated,
    walletCreatedDone: walletCreatedFx.done,
    walletRemoved,
    walletHidden,
    walletHiddenSuccess: hideWalletFx.done,
    walletRemovedSuccess: removeWalletFx.done,
    walletsRemoved,
    walletRestored,
    walletRestoredSuccess: restoreWalletFx.done,
  },
};
