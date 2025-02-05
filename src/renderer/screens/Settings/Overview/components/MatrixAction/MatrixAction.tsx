import { Icon } from '@renderer/components/ui';
import { useI18n } from '@renderer/context/I18nContext';
import { FootnoteText, Plate, BodyText, StatusLabel } from '@renderer/components/ui-redesign';
import { HelpText } from '@renderer/components/ui-redesign/Typography';
import { useMatrix } from '@renderer/context/MatrixContext';
import { useToggle } from '@renderer/shared/hooks';
import { MatrixModal } from '@renderer/components/modals';
import cnTw from '@renderer/shared/utils/twMerge';

export const MatrixAction = () => {
  const { t } = useI18n();
  const { matrix, isLoggedIn } = useMatrix();
  const [isModalOpen, toggleModalOpen] = useToggle();

  return (
    <>
      <div className="flex flex-col gap-y-2">
        <FootnoteText className="text-text-tertiary">{t('settings.overview.smpLabel')}</FootnoteText>

        <Plate className="p-0">
          <button
            className={cnTw(
              'w-full grid grid-flow-col grid-cols-[auto,1fr,auto] items-center gap-x-2 p-3 rounded-md',
              'transition hover:shadow-card-shadow focus:shadow-card-shadow',
            )}
            onClick={toggleModalOpen}
          >
            <Icon className="text-icon-default row-span-2" name="matrix" size={36} />
            <BodyText>{t('settings.overview.matrixLabel')}</BodyText>
            <HelpText className="text-text-tertiary">{t('settings.overview.matrixDescription')}</HelpText>

            {isLoggedIn ? (
              <StatusLabel
                className="row-span-2"
                variant="success"
                title={matrix.userId || ''}
                subtitle={
                  matrix.sessionIsVerified
                    ? t('settings.overview.matrixStatusVerified')
                    : t('settings.overview.matrixStatusNotVerified')
                }
              />
            ) : (
              <StatusLabel className="row-span-2" title={t('settings.overview.matrixStatusLogin')} variant="waiting" />
            )}
          </button>
        </Plate>
      </div>

      <MatrixModal isOpen={isModalOpen} onClose={toggleModalOpen} />
    </>
  );
};
