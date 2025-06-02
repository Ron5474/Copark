import { render, screen } from "@testing-library/react"
import { it, expect } from "vitest"
import HowToUseCard from "@/app/[locale]/components/UseCard"


it("renders the number and description for secondary variant", () => {
  render(
    <HowToUseCard
      number={1}
      image="/assets/example.jpg"
      description="Step 1: Do something important"
      variant="secondary"
    />
  )

  expect(screen.getByText("1")).toBeDefined()
  expect(screen.getByText("Step 1: Do something important")).toBeDefined()
})

it("renders the number and description for primary variant", () => {
  render(
    <HowToUseCard
      number={2}
      image="/assets/example.jpg"
      description="Step 2: Another task"
      variant="primary"
    />
  )

  expect(screen.getByText("2")).toBeDefined()
  expect(screen.getByText("Step 2: Another task")).toBeDefined()
})

