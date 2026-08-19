import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Counter from "./Counter";

describe("Counter", () => {
  it("counts clicks", () => {
    render(<Counter />);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Clicked 0 times");
    fireEvent.click(button);
    expect(button).toHaveTextContent("Clicked 1 time");
  });
});
