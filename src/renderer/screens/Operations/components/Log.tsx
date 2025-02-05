import { groupBy } from 'lodash';
import { format } from 'date-fns';

import { useI18n } from '@renderer/context/I18nContext';
import { Account, MultisigAccount } from '@renderer/domain/account';
import { ExtendedChain } from '@renderer/services/network/common/types';
import { MultisigEvent, MultisigTransaction, SigningStatus } from '@renderer/domain/transaction';
import TransactionTitle from './TransactionTitle/TransactionTitle';
import OperationStatus from './OperationStatus';
import { getSignatoryName, getTransactionAmount, sortByDateAsc } from '../common/utils';
import { AssetIcon, BaseModal, BodyText, FootnoteText } from '@renderer/components/ui-redesign';
import { getAssetById } from '@renderer/shared/utils/assets';
import { Identicon } from '@renderer/components/ui';
import { toAddress } from '@renderer/shared/utils/address';
import { SS58_DEFAULT_PREFIX } from '@renderer/shared/utils/constants';
import { ExtrinsicExplorers } from '@renderer/components/common';
import { Contact } from '@renderer/domain/contact';

type Props = {
  tx: MultisigTransaction;
  account?: MultisigAccount;
  connection?: ExtendedChain;
  accounts: Account[];
  contacts: Contact[];
  isOpen: boolean;
  onClose: () => void;
};

const EventMessage: Partial<Record<SigningStatus | 'INITIATED', string>> = {
  INITIATED: 'log.initiatedMessage',
  SIGNED: 'log.signedMessage',
  ERROR_SIGNED: 'log.errorSignedMessage',
  CANCELLED: 'log.cancelledMessage',
  ERROR_CANCELLED: 'log.errorCancelledMessage',
} as const;

const LogModal = ({ isOpen, onClose, tx, account, connection, contacts, accounts }: Props) => {
  const { t, dateLocale } = useI18n();

  const { transaction, description, status } = tx;
  const approvals = tx.events.filter((e) => e.status === 'SIGNED');

  const asset = getAssetById(transaction?.args.assetId, connection?.assets);
  const addressPrefix = connection?.addressPrefix || SS58_DEFAULT_PREFIX;
  const showAsset = Boolean(transaction && getTransactionAmount(transaction));

  const groupedEvents = groupBy(tx.events, ({ dateCreated }) =>
    format(new Date(dateCreated || 0), 'PP', { locale: dateLocale }),
  );

  const getEventMessage = (event: MultisigEvent): string => {
    const isCreatedEvent =
      event.accountId === tx.depositor && (event.status === 'SIGNED' || event.status === 'PENDING_SIGNED');

    const signatoryName = getSignatoryName(
      event.accountId,
      tx.signatories,
      contacts,
      accounts,
      connection?.addressPrefix,
    );
    const eventType = isCreatedEvent ? 'INITIATED' : event.status;
    const eventMessage = EventMessage[eventType] || 'log.unknownMessage';

    return `${signatoryName} ${t(eventMessage)}`;
  };

  return (
    <BaseModal
      title={t('log.title')}
      headerClass="border-b border-divider py-4 pl-4 pr-5"
      contentClass="p-0"
      panelClass="w-[400px]"
      closeButton
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex gap-2 items-center px-4 py-3">
        {showAsset && <AssetIcon name={asset?.name} src={asset?.icon} />}
        <TransactionTitle withoutIcon tx={transaction} description={description} />

        <div className="ml-auto">
          <OperationStatus status={status} signed={approvals.length} threshold={account?.threshold || 0} />
        </div>
      </div>

      <div className="bg-main-app-background p-5 flex flex-col gap-y-4 min-h-[464px] max-h-[600px] overflow-y-scroll">
        {Object.entries(groupedEvents)
          .sort(sortByDateAsc<MultisigEvent>)
          .map(([date, events]) => (
            <section className="w-full" key={date}>
              <FootnoteText as="h4" className="text-text-tertiary mb-4">
                {date}
              </FootnoteText>

              <ul className="flex flex-col gap-y-4">
                {events
                  .sort((a, b) => (a.dateCreated || 0) - (b.dateCreated || 0))
                  .map((event) => (
                    <li key={`${event.accountId}_${event.status}`} className="flex flex-col">
                      <div className="flex gap-x-2 w-full items-center">
                        <Identicon
                          size={16}
                          address={toAddress(event.accountId, { prefix: addressPrefix })}
                          background={false}
                        />
                        <BodyText className="text-text-secondary">{getEventMessage(event)}</BodyText>
                        <BodyText className="text-text-tertiary ml-auto">
                          {event.dateCreated && format(new Date(event.dateCreated), 'p', { locale: dateLocale })}
                        </BodyText>
                        {event.extrinsicHash && connection?.explorers && (
                          <ExtrinsicExplorers hash={event.extrinsicHash} explorers={connection.explorers} />
                        )}
                      </div>

                      {(event.status === 'ERROR_CANCELLED' || event.status === 'ERROR_SIGNED') && (
                        <BodyText className="text-text-negative">{t('log.error')}</BodyText>
                      )}
                    </li>
                  ))}
              </ul>
            </section>
          ))}
      </div>
    </BaseModal>
  );
};

export default LogModal;
