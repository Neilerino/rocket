import { RouterProvider } from '@tanstack/react-router';
import { router } from './routing/routes';
import client from './services/client';
import './index.css';
import { QueryClientProvider } from '@tanstack/react-query';

function App() {
  return (
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
