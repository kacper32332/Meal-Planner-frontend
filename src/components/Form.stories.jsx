import { MemoryRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Form from './Form';

const meta = {
  title: 'Components/Form', // Optional, but good practice for organizing your sidebar
  component: Form,
  // 👇 Add this decorator to wrap your component in a Router context
  decorators: [
    (Story) => (
      <MemoryRouter>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <Story />
        </GoogleOAuthProvider>
      </MemoryRouter>
    ),
  ],
};

export default meta;

export const Default = {
  // You might also want to pass default props here so the form renders correctly
  args: {
    method: 'login', 
  }
};

export const Register = {
  args: {
    method: 'register',
  }
};