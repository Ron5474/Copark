import { createContext, Dispatch, SetStateAction } from "react";

export const OnboardingContext = createContext<{
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
}>({
  currentPage: -1,
  setCurrentPage: () => {},
});