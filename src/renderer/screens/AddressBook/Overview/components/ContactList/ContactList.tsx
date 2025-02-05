import { useState, useEffect } from 'react';

import { useI18n } from '@renderer/context/I18nContext';
import { EmptySearch } from '../EmptyState/EmptySearch';
import { includes } from '@renderer/shared/utils/strings';
import { AddressWithName } from '@renderer/components/common';
import { BodyText, FootnoteText, IconButton, Plate } from '@renderer/components/ui-redesign';
import { Contact } from '@renderer/domain/contact';

type Props = {
  query?: string;
  contacts: Contact[];
  onEditContact: (contact?: Contact) => void;
};

export const ContactList = ({ contacts, query, onEditContact }: Props) => {
  const { t } = useI18n();

  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const filtered = contacts
      .filter((c) => includes(c.name, query) || includes(c.address, query) || includes(c.matrixId, query))
      .sort((a, b) => a.name.localeCompare(b.name));

    setFilteredContacts(filtered);
  }, [query, contacts]);

  if (filteredContacts.length === 0) {
    return <EmptySearch />;
  }

  return (
    <div className="flex flex-col gap-y-2">
      <div className="grid grid-cols-[250px,250px,1fr] items-center px-3">
        <FootnoteText className="text-text-secondary">{t('addressBook.contactList.nameColumnTitle')}</FootnoteText>
        <FootnoteText className="text-text-secondary">{t('addressBook.contactList.matrixIdColumnTitle')}</FootnoteText>
      </div>

      <ul className="flex flex-col gap-y-2">
        {filteredContacts.map((contact) => (
          <li key={contact.address}>
            <Plate className="grid grid-cols-[250px,250px,1fr] items-center p-0">
              <AddressWithName
                canCopySubName
                size={20}
                type="short"
                className="w-full truncate p-3"
                name={contact.name}
                address={contact.address}
              />
              <BodyText className="text-text-primary p-3 truncate">{contact.matrixId || '-'}</BodyText>
              <IconButton size={16} name="edit" className="m-3" onClick={() => onEditContact(contact)} />
            </Plate>
          </li>
        ))}
      </ul>
    </div>
  );
};
