import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ExampleInteractive from "./ExampleInteractive";

describe("ExampleInteractive", () => {
  it("counts clicks", () => {
    render(<ExampleInteractive />);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Clicked 0 times");
    fireEvent.click(button);
    expect(button).toHaveTextContent("Clicked 1 time");
  });
});
