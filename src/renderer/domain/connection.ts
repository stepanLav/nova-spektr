import { RpcNode } from './chain';
import { ChainId } from './shared-kernel';

export type Connection = {
  chainId: ChainId;
  canUseLightClient?: boolean;
  connectionType: ConnectionType;
  connectionStatus: ConnectionStatus;
  customNodes?: RpcNode[];
  activeNode?: RpcNode;
  disconnect?: () => void;
};

export const enum ConnectionType {
  LIGHT_CLIENT = 'LIGHT_CLIENT',
  AUTO_BALANCE = 'AUTO_BALANCE',
  RPC_NODE = 'RPC_NODE',
  DISABLED = 'DISABLED',
}

export const enum ConnectionStatus {
  NONE = 'NONE',
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  ERROR = 'ERROR',
}
