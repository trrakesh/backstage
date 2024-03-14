import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { Grid } from '@material-ui/core';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import MaterialButton from '@material-ui/core/Button';
import { useApi } from '@backstage/core-plugin-api';
import Alert from '@mui/material/Alert';

import data from './data.json';
import { roleMappingApiRef } from '../../apis';
import { RoleManagementData } from '@internal/backstage-plugin-role-management-common';

export interface RoleCreateOrEditComponentProps {
  mode: boolean;
}



export const RoleCreateOrEditComponent = (
  props: RoleCreateOrEditComponentProps,
) => {
  const { mode } = props;
  const permissionData = data.data;
  const roleApi = useApi(roleMappingApiRef);

  const getBlankData = (): RoleManagementData  => {
    
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
  const blankData = getBlankData();

  const [roles, setRoles] = React.useState<RoleManagementData[]>([]);
  const [roleDetails, setRoleDetails] = React.useState<RoleManagementData>(blankData);
  const [selectedRole, setSelectedRole] = React.useState('');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const resetForm = () => {
    setSelectedRole('');
    const newRoleData = getBlankData();
    setRoleDetails(newRoleData);
  };

  const fetchData = React.useCallback(
    async () => {
      if (!mode) {
        const result = await roleApi.getRoles();
        setRoles(result);
      }
      const newRoleData = getBlankData();
      setRoleDetails(newRoleData);
    },
    [roleApi, mode, permissionData],
  );

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => { 
    const find = roles.find(x => x.info.roleName === selectedRole );
    const newRoleData = getBlankData();
    setRoleDetails(find? find : newRoleData);
  }, [selectedRole, roles])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const roleExists = roles.some(r => r.info.roleName === value);
    if (roleExists) {
      setInfoMessage(
        'Entered Role name already exist. Please enter a another role name',
      );
      return;
    }

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
      if (!mode) {
        await roleApi.updateRole(roleDetails);
      } else {
        await roleApi.createRole(roleDetails);
      }
    }
    resetForm();
  };

  return (
    <Box sx={{ minWidth: 120, marginBottom: 2 }}>
      {infoMessage && (
        <Alert
          variant="outlined"
          severity="info"
          onClose={() => {
            setInfoMessage(null);
          }}
        >
          {infoMessage}
        </Alert>
      )}
      <form>
        <Grid container spacing={3} alignItems="stretch">
          <Grid item md={6} xs={12}>
            <FormControl fullWidth>
              {!mode ? (
                <>
                  <InputLabel id="demo-simple-select-label">
                    Select Role
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedRole}
                    label="Select Role"
                    onChange={(event: SelectChangeEvent) => {
                      setSelectedRole(event.target.value);
                    }}
                    style={{ minWidth: 120 }}
                  //   MenuProps={{
                  //     anchorOrigin:{
                  //       vertical:'bottom',
                  //       horizontal:'left'
                  //     },
                  //     transformOrigin:{
                  //       vertical:'top',
                  //       horizontal:'left'
                  //     }
                  // }}
                  >
                    {roles !== undefined &&
                      roles.map(itm => (
                        <MenuItem
                          key={itm.info.roleName}
                          value={itm.info.roleName}
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            width: '100%',
                          }}
                        >
                          {itm.info.roleName}
                        </MenuItem>
                      ))}
                  </Select>
                </>
              ) : (
                <TextField
                  id="standard-basic"
                  label="Role Name"
                  value={roleDetails.info.roleName}
                  onChange={handleInputChange}
                />
              )}
            </FormControl>
          </Grid>
          <Grid item md={6} xs={12}>
            <MaterialButton
              onClick={handleCreateButtonClick}
              variant="contained"
              color="primary"
              style={{ marginTop: 8 }}
            >
              {!mode ? 'Update' : 'Create'}
            </MaterialButton>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="stretch">
          {roleDetails &&
            roleDetails.info.data &&
            roleDetails.info.data.map(item => (
              <Grid item xs={12}>
                <>
                  <Typography variant="h6">{item.category.name}</Typography>
                  <Grid container spacing={2} alignItems="stretch">
                    {item.permissions.map(option => (
                      <Grid item md={4} xs={12}>
                        <FormControlLabel
                          sx={{ marginTop: 1, marginLeft: 2 }}
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
                </>
              </Grid>
            ))}
        </Grid>
      </form>
    </Box>
  );
};
