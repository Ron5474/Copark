"use client";
/**
 * @file DashboardView.tsx
 * @description This file contains the DashboardView component.
 * @author Swayam Shah
 */

import CardButton from "./components/cardButton";
import { useContext } from "react";
import { DashboardContext } from "./context";

function DashboardView() {
  const context = useContext(DashboardContext)
  return (
    <>
      <CardButton icon="/garage.svg" text="Garage" click={() => {context.setCurrentPage('garage')}}/>
      <CardButton icon="/Add_car.svg" text="Add Vehicle" click={() => {context.setCurrentPage('add-vehicle')}}/>
      <CardButton icon="/permit.svg" text="Buy Permit" click={() => {context.setCurrentPage('buy-permit')}}/>
    </>
  );
}

export default DashboardView;
