import Searchbar from './Searchbar';
import { MemoryRouter } from 'react-router-dom';

const meta = {
  component: Searchbar,
};

export default meta;

export const Default = {
  render: () => (
    <MemoryRouter>
      <Searchbar />
    </MemoryRouter>
  ),
};