import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from './routes.ts'
import { RouterProvider } from 'react-router'
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserProvider } from './context/userContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={AppRouter} />
    </UserProvider>
  </StrictMode>,
)
