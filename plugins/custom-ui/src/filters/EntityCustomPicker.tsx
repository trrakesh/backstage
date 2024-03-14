import { useEntityList } from '@backstage/plugin-catalog-react';
import { Box, Typography, makeStyles } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import useAsync from 'react-use/lib/useAsync';
import React, { useEffect, useState } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  catalogApiRef
} from '@backstage/plugin-catalog-react';

import { useApi } from '@backstage/core-plugin-api';
import { EntityAutocompletePickerOption } from './EntityAutocompletePickerOption';
import { EntityAutocompletePickerInput } from './EntityAutocompletePickerInput';
import { CustomFilters } from '../types';
import { EntityProjectInfoFilter } from './EntityProjectInfoFilter';


const useStyles = makeStyles(
  { input: {} },
  { name: 'CatalogReactEntityDevelopmentStatusPicker' },
);

export interface EntityCustomPickerProps {
  label: string;
  path: string;
}

export const EntityCustomPicker = (props: EntityCustomPickerProps) => {

  const { label, path } = props;
  const { updateFilters } = useEntityList<CustomFilters>();
  const catalogApi = useApi(catalogApiRef);
  const navigate = useNavigate();
  const location = useLocation();
  const classes = useStyles();

  const queryParams = new URLSearchParams(location.search);
  const selectedOptionsParam = queryParams.getAll('selectedOptions');
  const [selectedOptions, setSelectedOptions] = useState<string[]>(selectedOptionsParam);

  const { value: availableValues } = useAsync(async () => {
    const facet = `spec.projectInfo.${path}`;
    const { facets } = await catalogApi.getEntityFacets({
      facets: [facet],
      filter: undefined,
    });
    return Object.fromEntries(
      facets[facet].map(({ value, count }) => [value, count]),
    );
  }, []);

  useEffect(() => {
    const filter = selectedOptions.length ? new EntityProjectInfoFilter(selectedOptions, path) : undefined;
    updateFilters({ projectInfoFilters: filter });

    // Update query params when selected options change
    queryParams.set('selectedOptions', selectedOptions.join(''));
    navigate(`?${queryParams.toString()}`);
  }, [selectedOptions]);

  const handleAutocompleteChange = (_event: object, options: string[]) => {
    setSelectedOptions(options);
  }

  useEffect(() => {
    setSelectedOptions([]);
  }, []);

  return (
    <Box pb={1} pt={1}>
      <Typography variant="button" component="label">
        {label}
        <Autocomplete<string, true>
          multiple
          disableCloseOnSelect
          options={Object.keys(availableValues ?? {})}
          value={selectedOptions}
          onChange={handleAutocompleteChange}

          renderOption={(option, { selected }) => (
            <EntityAutocompletePickerOption
              selected={selected}
              value={option}
              availableOptions={availableValues}
              showCounts={true}
            />
          )}
          size="small"
          popupIcon={
            <ExpandMoreIcon data-testid={`${String(name)}-picker-expand`} />
          }
          renderInput={params => (
            <EntityAutocompletePickerInput {...params} className={classes.input} />
          )}
        />
      </Typography>
    </Box>
  );
};


