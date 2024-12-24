import React, { PropsWithChildren } from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

interface ButtonProps {
  onClick?: () => void;
  fullWidth?: boolean;
}

export const Button = ({ children, onClick, fullWidth }: PropsWithChildren<ButtonProps>) => {
  return (
    <VSCodeButton style={{ width: fullWidth ? "100%" : undefined }} onClick={onClick}>
      {children}
    </VSCodeButton>
  );
};
