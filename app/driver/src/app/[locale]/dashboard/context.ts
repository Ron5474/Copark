import { createContext, Dispatch, SetStateAction } from "react";

export const DashboardContext = createContext<{
  currentPage: string;
  setCurrentPage: Dispatch<SetStateAction<string>>;
}>({
  currentPage: '',
  setCurrentPage: () => {},
});