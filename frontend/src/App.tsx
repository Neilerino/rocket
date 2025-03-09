import { RouterProvider } from '@tanstack/react-router';
import { router } from './routing/routes';
import './index.css';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './services/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
