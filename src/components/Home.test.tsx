import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {Home} from "@/components";

describe('Home', () => {
  it('renders a heading', () => {
    render(<Home />);

    expect(screen.getByRole("heading", {
      name: "Rail Rally",
    })).toBeInTheDocument();
  });
});
