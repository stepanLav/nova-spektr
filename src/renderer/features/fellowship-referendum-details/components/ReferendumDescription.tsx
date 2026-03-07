import { memo } from 'react';

import { useI18n } from '@/shared/i18n';
import { nonNullable, nullable } from '@/shared/lib/utils';
import { Alert, Button, FootnoteText, Icon, SmallTitleText } from '@/shared/ui';
import { Box, Markdown, Skeleton } from '@/shared/ui-kit';
import { type Evidence, type Referendum, trackService } from '@/domains/collectives';
import { useEvidenceContent } from '../hooks/useEvidenceContent';
import { useMetadata } from '../hooks/useMetadata';

import { AdditionalContext } from './AdditionalContext';
import { Card } from './Card';
import { ConnectedGovernanceReferendum } from './ConnectedGovernanceReferendum';

type Props = {
  referendum: Referendum | null;
  evidence: Evidence | null;
};

export const ReferendumDescription = memo(({ referendum, evidence }: Props) => {
  const { t } = useI18n();
  const { data: referendumMeta } = useMetadata(referendum);
  const { data: evidenceContent, pending: pendingEvidenceContent, error: evidenceError, retry } = useEvidenceContent({ referendum, evidence });

  const canHaveEvidence =
    nonNullable(referendum) &&
    nonNullable(referendumMeta) &&
    (trackService.isPromotionTrack(referendumMeta.track) || trackService.isRetentionTrack(referendumMeta.track));

  const shouldRenderEvidence = nonNullable(evidenceContent) && !pendingEvidenceContent && !evidenceError;
  const shouldRenderEvidencePending = canHaveEvidence && nullable(evidenceContent) && pendingEvidenceContent && !evidenceError;
  const shouldRenderEvidenceError = canHaveEvidence && evidenceError;
  const shouldRenderEvidenceAlert = canHaveEvidence && nullable(evidenceContent) && !pendingEvidenceContent && !evidenceError;

  return (
    <div className="flex h-full flex-col gap-4">
      {shouldRenderEvidencePending ? (
        <Card>
          <Box padding={6}>
            <Skeleton height="16lh" width="100%" />
          </Box>
        </Card>
      ) : null}
      {shouldRenderEvidence ? (
        <Card>
          <Box padding={6}>
            <Markdown>{evidenceContent.content ?? ''}</Markdown>
          </Box>
        </Card>
      ) : null}

      {shouldRenderEvidenceError ? (
        <Card>
          <Box padding={6} gap={4} verticalAlign="center" horizontalAlign="center">
            <Alert
              active
              variant="error"
              title={t('fellowship.tasks.task.promotionVoting.ipfsLoadFailed')}
            >
              <Alert.Item withDot={false}>
                {t('fellowship.tasks.task.promotionVoting.ipfsLoadFailedDescription')}
              </Alert.Item>
            </Alert>
            <Button variant="fill" pallet="primary" size="md" onClick={retry}>
              {t('fellowship.tasks.task.promotionVoting.ipfsRetry')}
            </Button>
          </Box>
        </Card>
      ) : null}

      {shouldRenderEvidenceAlert ? <NoEvidence /> : null}

      {nonNullable(referendum) && <ConnectedGovernanceReferendum referendum={referendum} />}
      <div className="flex-1">
        <AdditionalContext referendum={referendum} />
      </div>
    </div>
  );
});

export const NoEvidence = () => {
  const { t } = useI18n();
  return (
    <Card>
      <Box padding={[43, 10]} gap={2} horizontalAlign="center" verticalAlign="center">
        <Icon size={64} name="empty" className="mb-4" />
        <SmallTitleText>{t('fellowship.tasks.task.promotionVoting.noEvidence')}</SmallTitleText>
        <FootnoteText className="text-center text-text-tertiary">
          {t('fellowship.tasks.task.promotionVoting.noEvidenceDescription')}
        </FootnoteText>
      </Box>
    </Card>
  );
};
