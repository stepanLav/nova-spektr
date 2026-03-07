import { hexToU8a } from '@polkadot/util';
import { CID } from 'multiformats/cid';
import { create as createDigest } from 'multiformats/hashes/digest';

import { type Chain, type HexString, type Transaction, TransactionType } from '@/shared/core';
import { nonNullable } from '@/shared/lib/utils';
import { type BlockHeight, pjsSchema } from '@/shared/polkadotjs-schemas';
import { type AnyAccount } from '@/domains/network';
import { type CollectivePalletsType } from '../_lib/types';
import { type FeedRecord } from '../feed/types';
import { memberService } from '../member/service';
import { type CoreMember, type Member } from '../member/types';

import { type EvidencePeriods, type EvidenceTransaction } from './types';

function getCidByEvidence(evidence: HexString) {
  const SHA_256_CODE = 0x12;
  return CID.createV0(createDigest(SHA_256_CODE, hexToU8a(evidence)))
    .toV1()
    .toString();
}

function getEvidenceFromCid(cid: string): HexString {
  const digest = CID.parse(cid).toV0().multihash.digest;
  return `0x${Buffer.from(digest).toString('hex')}`;
}

/**
 * Ordered list of IPFS gateways to try when fetching evidence content.
 * The first gateway is the primary one (subsquare's infura gateway);
 * the rest are public fallbacks used when the primary times out or errors.
 */
const IPFS_GATEWAYS = [
  'https://subsquare.infura-ipfs.io',
  'https://cloudflare-ipfs.com',
  'https://ipfs.io',
  'https://dweb.link',
  'https://gateway.pinata.cloud',
] as const;

/** Timeout per individual gateway request (ms). */
const IPFS_GATEWAY_TIMEOUT_MS = 8_000;

function getEvidenceIpfsUrl(evidence: HexString, gateway = IPFS_GATEWAYS[0]) {
  return new URL(`/ipfs/${getCidByEvidence(evidence)}`, gateway);
}

/**
 * Fetches IPFS content for the given evidence hash, trying each gateway in
 * {@link IPFS_GATEWAYS} order. Returns the first successful response text.
 *
 * @throws {Error} when all gateways fail or are exhausted.
 */
async function fetchFromIpfsWithFallback(evidence: HexString): Promise<string> {
  const cid = getCidByEvidence(evidence);
  const errors: string[] = [];

  for (const gateway of IPFS_GATEWAYS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), IPFS_GATEWAY_TIMEOUT_MS);

    try {
      const url = new URL(`/ipfs/${cid}`, gateway);
      const response = await fetch(url.toString(), { signal: controller.signal });

      if (response.ok) {
        return await response.text();
      }

      errors.push(`${gateway}: HTTP ${response.status} ${response.statusText}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${gateway}: ${message}`);
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error(`Failed to fetch IPFS content from all gateways:\n${errors.join('\n')}`);
}

function getEvidenceUploadIpfsUrl() {
  return new URL(`/nova/ipfs/files`, 'https://collectives-api.subsquare.io');
}

function getPromotionPeriod(member: CoreMember, periods: EvidencePeriods) {
  const promotionPeriod = periods.minPromotionPeriod.at(member.rank) ?? 1;
  return pjsSchema.helpers.toBlockHeight(Math.max(promotionPeriod, 1));
}

function getPromotionStartBlock(member: Member, feeds?: FeedRecord[]) {
  if (!memberService.isCoreMember(member)) {
    return null;
  }

  if (member.lastPromotion !== 0) {
    return member.lastPromotion;
  }

  const importedRecord = feeds?.find(f => f.accountId === member.accountId && f.type === 'imported');

  return importedRecord?.block ?? null;
}

function getMemberWithPromotionStart(member: Member, feeds?: FeedRecord[]) {
  if (!memberService.isCoreMember(member)) {
    return null;
  }

  const promotionStartBlock = getPromotionStartBlock(member, feeds);

  if (!promotionStartBlock || promotionStartBlock === member.lastPromotion) {
    return member;
  }

  return {
    ...member,
    lastPromotion: promotionStartBlock,
  };
}

function getPromotionWindow(member: CoreMember, periods: EvidencePeriods) {
  const promotionPeriod = getPromotionPeriod(member, periods);
  const start = member.lastPromotion;
  const end = start + promotionPeriod;

  return {
    from: start,
    to: end,
  };
}

function getEndPromotionBlock(member: Member, periods: EvidencePeriods) {
  if (memberService.isCoreMember(member)) {
    const promotionPeriod = getPromotionPeriod(member, periods);
    return (promotionPeriod + member.lastPromotion) as BlockHeight;
  }

  return null;
}

function getBlockUntilNextPromotion(member: CoreMember, periods: EvidencePeriods, currentBlock: BlockHeight) {
  const window = getPromotionWindow(member, periods);
  return Math.max(0, window.to - currentBlock) as BlockHeight;
}

function getDemotionPeriod(member: CoreMember, periods: EvidencePeriods) {
  const period =
    member.rank === 0
      ? periods.offboardTimeout
      : (periods.demotionPeriod.at(member.rank - 1) ?? pjsSchema.helpers.toBlockHeight(1));
  return period;
}

function getEndDemotionBlock(member: Member, periods: EvidencePeriods) {
  if (memberService.isCoreMember(member)) {
    const demotionPeriod = getDemotionPeriod(member, periods);
    if (nonNullable(demotionPeriod)) {
      return (demotionPeriod + member.lastProof) as BlockHeight;
    }
  }

  return null;
}

function getBlocksUntilDemotion(member: Member, periods: EvidencePeriods, currentBlock: BlockHeight) {
  if (memberService.isCoreMember(member)) {
    const endDemotionBlock = getEndDemotionBlock(member, periods);
    if (nonNullable(endDemotionBlock)) {
      return Math.max(0, endDemotionBlock - currentBlock) as BlockHeight;
    }
  }

  return null;
}

type EvidenceTransactionParams = {
  pallet: CollectivePalletsType;
  account: AnyAccount;
  chain: Chain;
  wish: 'Promotion' | 'Retention';
  evidence: HexString;
};

function createEvidenceTransaction({
  pallet,
  account,
  chain,
  wish,
  evidence,
}: EvidenceTransactionParams): EvidenceTransaction {
  return {
    accountId: account.accountId,
    chainId: chain.chainId,
    type: TransactionType.COLLECTIVE_SUBMIT_EVIDENCE,
    args: { pallet, wish, evidence },
  };
}

function isEvidenceTransaction(transaction: Transaction): transaction is EvidenceTransaction {
  return transaction.type === TransactionType.COLLECTIVE_SUBMIT_EVIDENCE;
}

export const evidenceService = {
  IPFS_GATEWAYS,
  getEvidenceIpfsUrl,
  getEvidenceUploadIpfsUrl,
  fetchFromIpfsWithFallback,
  getCidByEvidence,
  getEvidenceFromCid,
  getPromotionStartBlock,
  getMemberWithPromotionStart,
  getPromotionPeriod,
  getPromotionWindow,
  getEndPromotionBlock,
  getBlockUntilNextPromotion,
  getDemotionPeriod,
  getBlocksUntilDemotion,
  getEndDemotionBlock,

  createEvidenceTransaction,
  isEvidenceTransaction,
};
