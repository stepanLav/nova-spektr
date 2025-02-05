import { useLiveQuery } from 'dexie-react-hooks';

import storage, { AccountDS, ID } from '@renderer/services/storage';
import { IAccountService } from './common/types';
import { MultisigAccount, Account } from '@renderer/domain/account';

export const useAccount = (): IAccountService => {
  const accountStorage = storage.connectTo('accounts');

  if (!accountStorage) {
    throw new Error('=== 🔴 Account storage in not defined 🔴 ===');
  }
  const { getAccount, getAccounts, addAccount, updateAccount, updateAccounts, deleteAccount } = accountStorage;

  const getLiveAccounts = <T extends Account>(where?: Partial<T>): AccountDS[] => {
    const query = () => {
      try {
        return getAccounts(where);
      } catch (error) {
        console.warn('Error trying to get accounts');

        return Promise.resolve([]);
      }
    };

    return useLiveQuery(query, [], []);
  };

  // Only one wallet can be active at a time
  // Watch-Only or Polkadot Vault wallet will return array with one account
  // Mutishard wallet will return all root accounts + all derived
  const getActiveAccounts = <T extends Account>(where?: Partial<T>): AccountDS[] => {
    const query = async () => {
      try {
        const accounts = await getAccounts(where);

        return accounts.filter((account) => account.isActive);
      } catch (error) {
        console.warn('Error trying to get active accounts');

        return Promise.resolve([]);
      }
    };

    return useLiveQuery(query, [], []);
  };

  // There can be only one active mustisig account at one moment
  const getActiveMultisigAccount = (): AccountDS | null => {
    const query = async () => {
      try {
        const accounts = await getAccounts();

        return (
          accounts.find((account) => account.isActive && (account as MultisigAccount).creatorAccountId !== undefined) ||
          null
        );
      } catch (error) {
        console.warn('Error trying to get active multisig accounts');

        return Promise.resolve(null);
      }
    };

    return useLiveQuery(query, [], null);
  };

  const setActiveAccounts = async (accountsId: ID[]): Promise<void> => {
    try {
      const allAccounts = await getAccounts();
      const accountsToDeactivate = allAccounts.filter((a) => a.isActive).map((a) => ({ ...a, isActive: false }));

      const newActiveAccounts = allAccounts
        .filter((a) => a.id && accountsId.includes(a.id))
        .map((a) => ({ ...a, isActive: true }));
      if (newActiveAccounts.length) {
        await updateAccounts([...newActiveAccounts, ...accountsToDeactivate]);
      }
    } catch (error) {
      console.warn('Could not set new active accounts');
    }
  };

  const setActiveAccount = async (id: ID): Promise<void> => {
    try {
      const allAccounts = await getAccounts();
      const accountsToDeactivate = allAccounts.filter((a) => a.isActive).map((a) => ({ ...a, isActive: false }));

      const newActiveAccount = allAccounts.find((a) => a.id === id);
      if (newActiveAccount) {
        await updateAccounts([{ ...newActiveAccount, isActive: true }, ...accountsToDeactivate]);
      }
    } catch (error) {
      console.warn('Could not set new active accounts');
    }
  };

  const deactivateAccounts = async (accounts: AccountDS[]): Promise<void> => {
    try {
      const accountsToDeactivate = accounts.filter((a) => a.isActive).map((a) => ({ ...a, isActive: false }));

      if (accountsToDeactivate.length) {
        await updateAccounts(accountsToDeactivate);
      }
    } catch (error) {
      console.warn('Could not deactivate accounts');
    }
  };

  return {
    getAccount,
    getAccounts,
    getLiveAccounts,
    getActiveAccounts,
    getActiveMultisigAccount,
    addAccount,
    updateAccount,
    deleteAccount,
    setActiveAccount,
    setActiveAccounts,
    deactivateAccounts,
  };
};
