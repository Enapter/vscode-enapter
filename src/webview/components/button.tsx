import React, { PropsWithChildren } from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

interface ButtonProps {
  onClick?: () => void;
  fullWidth?: boolean;
  disabled?: boolean;
}

export const Button = ({ children, onClick, fullWidth, disabled }: PropsWithChildren<ButtonProps>) => {
  return (
    <VSCodeButton disabled={disabled} style={{ width: fullWidth ? "100%" : undefined }} onClick={onClick}>
      {children}
    </VSCodeButton>
  );
};
