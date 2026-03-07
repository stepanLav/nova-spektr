import { memo } from 'react';

import { useI18n } from '@/shared/i18n';
import { nullable } from '@/shared/lib/utils';
import { Alert, Button } from '@/shared/ui';
import { Box, Markdown, Skeleton } from '@/shared/ui-kit';
import { type Evidence } from '@/domains/collectives';
import { useEvidenceContent } from '../../hooks/useEvidenceContent';
import { Card } from '../Card';
import { NoEvidence } from '../ReferendumDescription';

type Props = {
  evidence: Evidence;
};

export const Content = memo(({ evidence }: Props) => {
  const { t } = useI18n();
  const { data: content, pending, error, retry } = useEvidenceContent({ evidence });

  if (pending && !content) {
    return (
      <Card>
        <Box padding={6}>
          <Skeleton height="446px" />
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (nullable(content?.content)) {
    return <NoEvidence />;
  }

  return (
    <Card>
      <Box padding={6}>
        <Markdown>{content?.content ?? ''}</Markdown>
        <Alert
          active={nullable(content?.content)}
          variant="warn"
          title={t('fellowship.tasks.task.promotionVoting.noEvidence')}
        />
      </Box>
    </Card>
  );
});
