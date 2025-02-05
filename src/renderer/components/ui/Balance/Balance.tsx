import { useI18n } from '@renderer/context/I18nContext';
import { formatBalance } from '@renderer/shared/utils/balance';

interface Props {
  value: string;
  precision: number;
  symbol?: string;
  className?: string;
}

const Balance = ({ value, precision, symbol, className }: Props) => {
  const { t } = useI18n();
  const { value: formattedValue, decimalPlaces, suffix } = formatBalance(value, precision);

  const balanceValue = t('assetBalance.number', {
    value: formattedValue,
    maximumFractionDigits: decimalPlaces,
  });

  return (
    <span className={className}>
      {balanceValue}
      {suffix}
      {symbol && <span className="ml-1">{symbol}</span>}
    </span>
  );
};

export default Balance;
