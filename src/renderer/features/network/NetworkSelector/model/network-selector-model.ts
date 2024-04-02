import { createEvent, sample, createEffect, attach } from 'effector';
import { delay, spread } from 'patronum';

import { ProviderWithMetadata } from '@/src/renderer/shared/api/network';
import { networkModel, networkUtils } from '@entities/network';
import { ChainId, Connection, ConnectionType, RpcNode } from '@shared/core';
import { storageService } from '@shared/api/storage';

const lightClientSelected = createEvent<ChainId>();
const autoBalanceSelected = createEvent<ChainId>();
const rpcNodeSelected = createEvent<{ chainId: ChainId; node: RpcNode }>();
const chainDisabled = createEvent<ChainId>();

const updateConnectionFx = createEffect((connection: Connection): Promise<Connection | undefined> => {
  return storageService.connections.put(connection);
});

type DisconnectParams = {
  chainId: ChainId;
  providers: Record<ChainId, ProviderWithMetadata>;
};
const disconnectProviderFx = createEffect(async ({ chainId, providers }: DisconnectParams): Promise<ChainId> => {
  await providers[chainId].disconnect();

  providers[chainId].on('connected', () => undefined);
  providers[chainId].on('disconnected', () => undefined);
  providers[chainId].on('error', () => undefined);

  return chainId;
});

const reconnectProviderFx = attach({ effect: disconnectProviderFx });

sample({
  clock: autoBalanceSelected,
  source: networkModel.$connections,
  fn: (connections, chainId) => ({
    ...connections[chainId],
    connectionType: ConnectionType.AUTO_BALANCE,
    activeNode: undefined,
  }),
  target: updateConnectionFx,
});

sample({
  clock: lightClientSelected,
  source: networkModel.$connections,
  fn: (connections, chainId) => ({
    ...connections[chainId],
    connectionType: ConnectionType.LIGHT_CLIENT,
    activeNode: undefined,
  }),
  target: updateConnectionFx,
});

sample({
  clock: rpcNodeSelected,
  source: networkModel.$connections,
  fn: (connections, { chainId, node }) => ({
    ...connections[chainId],
    connectionType: ConnectionType.RPC_NODE,
    activeNode: node,
  }),
  target: updateConnectionFx,
});

sample({
  clock: chainDisabled,
  source: networkModel.$connections,
  fn: (connections, chainId) => ({
    ...connections[chainId],
    connectionType: ConnectionType.DISABLED,
  }),
  target: updateConnectionFx,
});

sample({
  clock: chainDisabled,
  source: networkModel.$providers,
  fn: (providers, chainId) => ({ chainId, providers }),
  target: disconnectProviderFx,
});

sample({
  clock: updateConnectionFx.doneData,
  source: networkModel.$connections,
  filter: (connection) => Boolean(connection),
  fn: (connections, connection) => ({
    ...connections,
    [connection!.chainId]: connection,
  }),
  target: networkModel.$connections,
});

sample({
  clock: updateConnectionFx.doneData,
  source: networkModel.$providers,
  filter: (_, connection) => {
    return Boolean(connection) && networkUtils.isEnabledConnection(connection!);
  },
  fn: (providers, connection) => {
    const chainId = connection!.chainId;

    return providers[chainId] ? { reconnect: { chainId, providers } } : { start: chainId };
  },
  target: spread({
    start: networkModel.events.chainConnected,
    reconnect: reconnectProviderFx,
  }),
});

sample({
  clock: [disconnectProviderFx.doneData, reconnectProviderFx.doneData],
  source: networkModel.$providers,
  fn: (providers, chainId) => {
    const { [chainId]: _, ...rest } = providers;

    return rest;
  },
  target: networkModel.$providers,
});

delay({
  source: reconnectProviderFx.doneData,
  timeout: 500,
  target: networkModel.events.chainConnected,
});

export const networkSelectorModel = {
  events: {
    lightClientSelected,
    autoBalanceSelected,
    rpcNodeSelected,
    chainDisabled,
  },
};
