import { Address } from '@renderer/domain/shared-kernel';

export type Identity = {
  subName: string;
  email: string;
  website: string;
  twitter: string;
  riot: string;
  parent: ParentIdentity;
};

type ParentIdentity = {
  address: Address;
  name: string;
  // judgements: Judgement[];
};

// type Judgement = {
//   votes: number;
//   verdict: string;
// };

export type SubIdentity = {
  sub: Address;
  parent: Address;
  subName: string;
};
