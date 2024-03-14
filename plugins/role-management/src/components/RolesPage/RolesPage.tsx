import React from 'react';
import {
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { RoleCreateOrEditComponent } from './RoleCreateOrEditComponent';

export const RolesPage = () => {
  const [isCreateMode, setIscreateMode] = React.useState(false);

  return (
    <Page themeId="tool">
      <Header title="Welcome to Role Management!" subtitle="Optional subtitle">
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title="">
          <FormControlLabel
            control={
              <Switch
                checked={isCreateMode}
                onChange={() => {
                  setIscreateMode(!isCreateMode);
                }}
                name="Create"
                inputProps={{ 'aria-label': 'secondary checkbox' }}
              />
            }
            label="Create?"
          />
          <SupportButton>A description of your plugin goes here.</SupportButton>
        </ContentHeader>
        <InfoCard title="Roles">
          <Box sx={{ minWidth: 120, marginBottom: 2 }}>
            <RoleCreateOrEditComponent mode={isCreateMode} />
          </Box>
        </InfoCard>
      </Content>
    </Page>
  );
};
