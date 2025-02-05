import { ApiPromise } from '@polkadot/api';
import { UnsignedTransaction } from '@substrate/txwrapper-polkadot';
import { useEffect, useState, ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';

import { useI18n } from '@renderer/context/I18nContext';
import { MultisigEvent, Transaction, MultisigTransaction, MultisigTxInitStatus } from '@renderer/domain/transaction';
import { HexString } from '@renderer/domain/shared-kernel';
import { useTransaction } from '@renderer/services/transaction/transactionService';
import { useMatrix } from '@renderer/context/MatrixContext';
import { Account, MultisigAccount, isMultisig } from '@renderer/domain/account';
import { ExtrinsicResultParams } from '@renderer/services/transaction/common/types';
import { useMultisigTx } from '@renderer/services/multisigTx/multisigTxService';
import { toAccountId } from '@renderer/shared/utils/address';
import { useToggle } from '@renderer/shared/hooks';
import { Button } from '@renderer/components/ui-redesign';
import { OperationResult } from '@renderer/components/common/OperationResult/OperationResult';
import Paths from '@renderer/routes/paths';

type ResultProps = Pick<ComponentProps<typeof OperationResult>, 'title' | 'description' | 'variant'>;

type Props = {
  api: ApiPromise;
  account?: Account | MultisigAccount;
  tx: Transaction;
  multisigTx?: Transaction;
  unsignedTx: UnsignedTransaction;
  signature: HexString;
  description?: string;
  onClose: () => void;
};

const Submit = ({ api, tx, multisigTx, account, unsignedTx, signature, description, onClose }: Props) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const { matrix } = useMatrix();
  const { addMultisigTx } = useMultisigTx();
  const { submitAndWatchExtrinsic, getSignedExtrinsic } = useTransaction();

  const [inProgress, toggleInProgress] = useToggle(true);
  const [successMessage, toggleSuccessMessage] = useToggle();
  const [errorMessage, setErrorMessage] = useState('');

  const handleClose = () => {
    onClose();

    if (isMultisig(account) && successMessage) {
      navigate(Paths.OPERATIONS);
    }
  };

  const closeSuccessMessage = () => {
    onClose();
    toggleSuccessMessage();

    if (isMultisig(account)) {
      navigate(Paths.OPERATIONS);
    }
  };

  const closeErrorMessage = () => {
    onClose();
    setErrorMessage('');
  };

  useEffect(() => {
    submitExtrinsic(signature).catch(() => console.warn('Error getting signed extrinsics'));
  }, []);

  const submitExtrinsic = async (signature: HexString) => {
    const extrinsic = await getSignedExtrinsic(unsignedTx, signature, api);

    submitAndWatchExtrinsic(extrinsic, unsignedTx, api, (executed, params) => {
      if (executed) {
        const typedParams = params as ExtrinsicResultParams;

        if (multisigTx && isMultisig(account)) {
          const event: MultisigEvent = {
            status: 'SIGNED',
            accountId: toAccountId(multisigTx.address),
            extrinsicHash: typedParams.extrinsicHash,
            eventBlock: typedParams.timepoint.height,
            eventIndex: typedParams.timepoint.index,
            dateCreated: Date.now(),
          };

          const newTx: MultisigTransaction = {
            accountId: account.accountId,
            chainId: multisigTx.chainId,
            signatories: account.signatories,
            callData: multisigTx.args.callData,
            callHash: multisigTx.args.callHash,
            transaction: tx,
            status: MultisigTxInitStatus.SIGNING,
            blockCreated: typedParams.timepoint.height,
            indexCreated: typedParams.timepoint.index,
            events: [event],
            description,
            dateCreated: Date.now(),
          };

          addMultisigTx(newTx);

          if (matrix.userIsLoggedIn) {
            sendMultisigEvent(account.matrixRoomId, newTx, typedParams);
          }
        }

        toggleSuccessMessage();
        setTimeout(closeSuccessMessage, 2000);
      } else {
        setErrorMessage(params as string);
      }

      toggleInProgress();
    });
  };

  const sendMultisigEvent = (matrixRoomId: string, updatedTx: MultisigTransaction, params: ExtrinsicResultParams) => {
    if (!multisigTx) return;

    matrix
      .sendApprove(matrixRoomId, {
        senderAccountId: toAccountId(multisigTx.address),
        chainId: updatedTx.chainId,
        callHash: updatedTx.callHash,
        callData: updatedTx.callData,
        extrinsicTimepoint: params.timepoint,
        extrinsicHash: params.extrinsicHash,
        error: Boolean(params.multisigError),
        description,
        callTimepoint: {
          height: updatedTx.blockCreated || params.timepoint.height,
          index: updatedTx.indexCreated || params.timepoint.index,
        },
      })
      .catch(console.warn);
  };

  const getResultProps = (): ResultProps => {
    if (inProgress) {
      return { title: t('transfer.inProgress'), variant: 'loading' };
    }
    if (successMessage) {
      return { title: t('transfer.successMessage'), variant: 'success' };
    }
    if (errorMessage) {
      return { title: t('operation.feeErrorTitle'), description: errorMessage, variant: 'error' };
    }

    return { title: '' };
  };

  return (
    <OperationResult
      isOpen={Boolean(inProgress || errorMessage || successMessage)}
      {...getResultProps()}
      onClose={handleClose}
    >
      {errorMessage && <Button onClick={closeErrorMessage}>{t('operation.feeErrorButton')}</Button>}
    </OperationResult>
  );
};

export default Submit;
