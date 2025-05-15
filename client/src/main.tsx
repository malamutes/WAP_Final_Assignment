import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from './routes.ts'
import { RouterProvider } from 'react-router'
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserProvider } from './context/userContext.tsx'
import { SocketProvider } from './context/socketContext.tsx'
import { NotificationProvider } from './context/notificationContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SocketProvider>
      <NotificationProvider>
        <UserProvider>
          <RouterProvider router={AppRouter} />
        </UserProvider>
      </NotificationProvider>
    </SocketProvider>
  </StrictMode>,
)
