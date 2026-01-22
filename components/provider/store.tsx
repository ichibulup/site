"use client";

import React, { ReactNode, ReactElement } from "react";
import ReduxProvider from "@/state/redux";

export const StoreProvider = ({
  children
}: {
  children: ReactNode
}): ReactElement => {
  return <ReduxProvider>{children}</ReduxProvider>;
};

// export default Providers;
