import { useUnit } from 'effector-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { type Evidence, type Referendum, evidenceContentResource, useEvidencesContent } from '@/domains/collectives';
import { useFellowshipChain } from '@/aggregates/fellowship-network';

import { useEvidenceHash } from './useEvidenceHash';

type Params = {
  referendum?: Referendum | null;
  evidence?: Evidence | null;
};

export const useEvidenceContent = ({ referendum, evidence }: Params) => {
  const chain = useFellowshipChain();

  const { data: evidenceHash, pending: pendingEvidenceHash } = useEvidenceHash({ referendum, evidence });

  const evidenceHashResolved = evidence?.hash || evidenceHash;

  const { data: content, pending: pendingContent } = useEvidencesContent({
    palletType: 'fellowship',
    chainId: chain?.chainId,
    evidenceHash: evidenceHashResolved,
  });

  // Track per-key load errors and expose retry capability.
  const fetchContent = useUnit(evidenceContentResource.fetch);
  const [ipfsError, setIpfsError] = useState(false);
  const [ipfsPending, setIpfsPending] = useState(false);
  // Keep track of the key we last fetched so we reset error on param change.
  const lastKeyRef = useRef<string | null>(null);

  const buildKey = useCallback(
    () => (chain?.chainId && evidenceHashResolved ? `${chain.chainId}|${evidenceHashResolved}` : null),
    [chain?.chainId, evidenceHashResolved],
  );

  const doFetch = useCallback(async () => {
    if (!chain?.chainId || !evidenceHashResolved) return;

    setIpfsError(false);
    setIpfsPending(true);

    try {
      await fetchContent({
        palletType: 'fellowship',
        chainId: chain.chainId,
        evidenceHash: evidenceHashResolved,
      });
    } catch {
      setIpfsError(true);
    } finally {
      setIpfsPending(false);
    }
  }, [chain?.chainId, evidenceHashResolved, fetchContent]);

  useEffect(() => {
    const key = buildKey();
    if (!key) return;

    // Reset error state when the target evidence changes.
    if (key !== lastKeyRef.current) {
      lastKeyRef.current = key;
      setIpfsError(false);
      // Trigger initial fetch so we can capture failure.
      // useResource (inside useEvidencesContent) also calls start, but using
      // fetch here lets us await the promise and detect errors.
      doFetch();
    }
  }, [buildKey, doFetch]);

  const retry = useCallback(() => {
    doFetch();
  }, [doFetch]);

  // While useResource is still loading (pendingContent=true) AND we have not
  // yet received an error from our direct fetch call, treat the overall state
  // as pending.  Once our fetch call resolves (either success or error) we
  // trust ipfsPending + ipfsError over useResource's perpetual-pending state.
  const pending = pendingEvidenceHash || (ipfsPending ? true : pendingContent && !ipfsError);

  return { data: content, pending, error: ipfsError, retry };
};
