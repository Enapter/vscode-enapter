import React from "react";
import { Button } from "../components/button";
import { useCommands } from "./commands-provider";
import { CommandIDs } from "../../web/constants/commands";

export const SelectDevice = () => {
  const send = useCommands();

  const handleSelectDevice = () => {
    send(CommandIDs.Devices.SelectActive);
  };

  return (
    <div>
      <p>No active device chosen.</p>
      <p>To upload a blueprint and view device logs you should select a device.</p>
      <Button onClick={handleSelectDevice}>Select</Button>
    </div>
  );
};
