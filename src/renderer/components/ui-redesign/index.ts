import Input from './Inputs/Input/Input';
import Plate from './Plate/Plate';
import AmountInput from './Inputs/AmountInput/AmountInput';
import PasswordInput from './Inputs/PasswordInput/PasswordInput';
import InputHint from './InputHint/InputHint';
import Button from './Buttons/Button/Button';
import ButtonLink from './Buttons/ButtonLink/ButtonLink';
import ButtonBack from './Buttons/ButtonBack/ButtonBack';
import BaseModal from './Modals/BaseModal/BaseModal';
import ConfirmModal from './Modals/ConfirmModal/ConfirmModal';
import InfoPopover from './Popovers/InfoPopover/InfoPopover';
import { Popover } from './Popovers/Popover/Popover';
import InfoLink from './InfoLink/InfoLink';
import Select from './Dropdowns/Select/Select';
import Combobox from './Dropdowns/Combobox/Combobox';
import RadioGroup from './RadioGroup/RadioGroup';
import PopoverLink from './PopoverLink/PopoverLink';
import Checkbox from './Checkbox/Checkbox';
import MultiSelect from './Dropdowns/MultiSelect/MultiSelect';
import MenuPopover from './Popovers/MenuPopover/MenuPopover';
import IconButton from './Buttons/IconButton/IconButton';
import DropdownButton from './Dropdowns/DropdownButton/DropdownButton';
import SearchInput from './Inputs/SearchInput/SearchInput';
import Accordion from './Accordion/Accordion';
import Alert from './Alert/Alert';
import Counter from './Counter/Counter';
import StatusLabel from './StatusLabel/StatusLabel';
import InputFile from './Inputs/InputFile/InputFile';
import { Tooltip } from './Popovers/Tooltip/Tooltip';
import { LabelHelpBox } from './LabelHelpbox/LabelHelpBox';
import { Chain } from './Chain/Chain';
import { ChainIcon } from './ChainIcon/ChainIcon';
import { AssetIcon } from './AssetIcon/AssetIcon';
import { Tabs } from './Tabs/Tabs';
import {
  LargeTitleText,
  TitleText,
  SmallTitleText,
  CaptionText,
  HeadlineText,
  BodyText,
  FootnoteText,
  LabelText,
  HeaderTitleText,
} from './Typography';

// FIXME: Animation component exported separately.
// Adding them to this file causes to crash all tests which use anything from that file
// similar issue on stackoverflow:
// https://stackoverflow.com/questions/49156356/why-does-jest-try-to-resolve-every-component-in-my-index-ts

export {
  Input,
  Plate,
  AmountInput,
  PasswordInput,
  SearchInput,
  InputHint,
  Button,
  ButtonLink,
  ButtonBack,
  IconButton,
  BaseModal,
  ConfirmModal,
  InfoPopover,
  MenuPopover,
  Popover,
  InfoLink,
  LargeTitleText,
  TitleText,
  SmallTitleText,
  CaptionText,
  HeadlineText,
  BodyText,
  FootnoteText,
  LabelText,
  Select,
  Combobox,
  PopoverLink,
  Checkbox,
  RadioGroup,
  MultiSelect,
  DropdownButton,
  Alert,
  Accordion,
  Counter,
  StatusLabel,
  HeaderTitleText,
  InputFile,
  Tooltip,
  LabelHelpBox,
  Chain,
  ChainIcon,
  AssetIcon,
  Tabs,
};
