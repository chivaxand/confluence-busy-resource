import ForgeUI, { render, MacroConfig, useConfig } from '@forge/ui';
import { Select, Option, TextField } from '@forge/ui';
  
const ConfigView = () => {
    const config = useConfig() || {};
    //console.log("Config:", config);
    return (
        <MacroConfig>
        <TextField
            name="itemNames"
            label="List of item names separated by ';'"
            description="This list will be displayed in table of available items"
            defaultValue=""
            />
        </MacroConfig>
    );
};

export const run = render(<ConfigView />)