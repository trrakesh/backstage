import { Checkbox, FormControlLabel } from '@material-ui/core';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import React, { memo } from 'react';

interface Props {
  selected: boolean;
  value: string;
  availableOptions?: Record<string, number>;
  showCounts: boolean;
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function OptionCheckbox({ selected }: { selected: boolean }) {
  return <Checkbox icon={icon} checkedIcon={checkedIcon} checked={selected} />;
}

export const EntityAutocompletePickerOption = memo((props: Props) => {
  const { selected, value, availableOptions, showCounts } = props;
  const label = showCounts ? `${value} (${availableOptions?.[value]})` : value;

  return (
    <FormControlLabel
      control={<OptionCheckbox selected={selected} />}
      label={label}
      onClick={event => event.preventDefault()}
    />
  );
});
