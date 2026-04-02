"use client";

import { createContext, useContext } from "react";
import { Id } from "@convex/_generated/dataModel";

type DashboardContextType = {
  userId: Id<"users"> | null;
};

export const DashboardContext = createContext<DashboardContextType>({
  userId: null,
});

export const useDashboard = () => useContext(DashboardContext);
