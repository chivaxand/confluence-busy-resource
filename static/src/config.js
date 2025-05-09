import React from 'react';
import { Label, Textfield } from '@forge/react';

const Config = () => {
  return (
    <>
      <Label>List of item names separated by ';'</Label>
      <Textfield
        name="itemNames"
        defaultValue=""
        description="This list will be displayed in table of available items"
      />
    </>
  );
};

export default Config;