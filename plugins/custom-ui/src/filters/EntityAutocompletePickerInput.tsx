import { makeStyles, TextField, TextFieldProps } from '@material-ui/core';
import React from 'react';
import classnames from 'classnames';

const useStyles = makeStyles(
  {
    input: {},
  },
  {
    name: 'CatalogReactEntityAutocompletePickerInput',
  },
);

export function EntityAutocompletePickerInput(params: TextFieldProps) {
  const classes = useStyles();

  return (
    <TextField
      variant="outlined"
      {...params}
      className={classnames(classes.input, params.className)}
    />
  );
}
