import compact from 'lodash/compact';
import sortBy from 'lodash/sortBy';

import { Chain } from '@renderer/domain/chain';
import chainsProd from './common/chains/chains.json';
import chainsDev from './common/chains/chains_dev.json';
import { ChainLike, IChainService } from './common/types';
import { isKusama, isPolkadot, isTestnet } from './common/utils';
import { ChainId } from '@renderer/domain/shared-kernel';
import { getRelaychainAsset } from '@renderer/shared/utils/assets';

const CHAINS: Record<string, any> = {
  chains: chainsProd,
  'chains-dev': chainsDev,
};

export function useChains(): IChainService {
  const getChainsData = (): Promise<Chain[]> => {
    return Promise.resolve(CHAINS[process.env.CHAINS_FILE || 'chains']);
  };

  const getChainById = (chainId: ChainId): Promise<Chain | undefined> => {
    const chainsData: Chain[] = CHAINS[process.env.CHAINS_FILE || 'chains'];
    const chainMatch = chainsData.find((chain) => chain.chainId === chainId);

    return Promise.resolve(chainMatch);
  };

  const getStakingChainsData = (): Promise<Chain[]> => {
    const chainsData: Chain[] = CHAINS[process.env.CHAINS_FILE || 'chains'];

    const stakingChains = chainsData.reduce<Chain[]>((acc, chain) => {
      if (getRelaychainAsset(chain.assets)) {
        acc.push(chain);
      }

      return acc;
    }, []);

    return Promise.resolve(stakingChains);
  };

  const sortChains = <T extends ChainLike>(chains: T[]): T[] => {
    let polkadot;
    let kusama;
    const testnets = [] as T[];
    const parachains = [] as T[];

    chains.forEach((chain) => {
      if (isPolkadot(chain.name)) polkadot = chain;
      else if (isKusama(chain.name)) kusama = chain;
      else if (isTestnet(chain.options)) testnets.push(chain);
      else parachains.push(chain);
    });

    return compact([polkadot, kusama, ...sortBy(parachains, 'name'), ...sortBy(testnets, 'name')]) as T[];
  };

  return {
    getChainsData,
    getChainById,
    getStakingChainsData,
    sortChains,
  };
}
