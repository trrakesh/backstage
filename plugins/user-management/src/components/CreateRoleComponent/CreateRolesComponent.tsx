import React, { useState } from 'react';
import { Checkbox, FormControlLabel, Grid, Typography } from '@material-ui/core';
import {
  Header,
  Page,
  Content,
  ContentHeader
} from '@backstage/core-components';

import TextField from '@material-ui/core/TextField';
import MaterialButton from '@material-ui/core/Button';

import data from './data.json';
import { RoleManagementData } from '@internal/backstage-plugin-role-management-common';

import { useApi } from '@backstage/core-plugin-api';
import { roleMappingApiRef } from '../../apis';


export const CreateRolesComponent = () => {

  const permissionData = data.data;

  const getBlankData = (): RoleManagementData => {

    const newData = {
      info: {
        roleName: '',
        data: permissionData.map(item => ({
          category: item.category,
          permissions: item.permissions.map(p => ({ info: p, checked: false })),
        }))
      }
    };

    return newData;
  }

  const roleApi = useApi(roleMappingApiRef);
  const blankData = getBlankData();
  const [roleDetails, setRoleDetails] = useState<RoleManagementData>(blankData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const temp = {...roleDetails};
    if (temp) {
      if (temp.info) {
        temp.info.roleName = value;
      }
    }
    setRoleDetails(temp);
  };

  const handleCheckboxClick = (item: string, option: string) => {
    
    const newroleDetails = { ...roleDetails };

    if (newroleDetails) {
      const roleData = newroleDetails.info.data;
      const category = roleData.find(d => d.category.key === item);
      const permisson = category?.permissions.find(d => d.info.key === option);
      if (permisson) {
        permisson.checked = !permisson.checked;
        setRoleDetails(newroleDetails);
      }
    }
  };

  const handleCreateButtonClick = async () => {
    if (roleDetails) {
      await roleApi.createRole(roleDetails);
      // if (!mode) {
      //   await roleApi.updateRole(roleDetails);
      // } else {
      //   await roleApi.createRole(roleDetails);
      // }
    }
  };

  return (
    <Page themeId="tool">
      <Header title="Create Role" />
      <Content>
        <ContentHeader title="">
          <Grid container >
            <Grid item xs={8}>
              <TextField
                  id="standard-basic"
                  label="Role Name"
                  value={roleDetails.info.roleName}
                  onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={4}>
              <MaterialButton
                  onClick={handleCreateButtonClick}
                  variant="contained"
                  color="primary"
                  style={{ marginTop: 8 }}
                >
                  Create
                </MaterialButton>
            </Grid>
          </Grid>
        </ContentHeader>
        <Grid container spacing={2} alignItems="stretch">
          {roleDetails &&
            roleDetails.info.data &&
            roleDetails.info.data.map(item => (
              <Grid item xs={12}>
                <>
                  <Typography variant="h6">{item.category.name}</Typography>
                  <div style={{marginLeft: "10px"}}>
                    <Grid container alignItems="stretch">
                      {item.permissions.map(option => (
                        <Grid item md={4} xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                onClick={() => {
                                  handleCheckboxClick(item.category.key, option.info.key);
                                }}
                                checked={option.checked}
                              />
                            }
                            label={option.info.name}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </div>
                </>
              </Grid>
            ))}
        </Grid>
      </Content>
    </Page>
  )
}
