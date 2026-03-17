import '../shared/styles/App.css';
import { ThemeProvider, useTheme } from '@features/Settings/providers/theme';
import { QueryProvider } from './providers/query';
import { Toaster } from 'sonner';
import { router } from './router';
import { RouterProvider } from 'react-router-dom';
import { AppCommon } from './providers/appCommon';
function App() {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppCommon>
          <AppData />
        </AppCommon>
      </ThemeProvider>
    </QueryProvider>
  );
}

const AppData = () => {
  const { theme } = useTheme();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-8 [-webkit-app-region:drag]" />
      {/* <ConfirmationModalCloseApp /> */}
      <RouterProvider router={router} />
      <Toaster theme={theme} closeButton position="bottom-right" />
    </>
  );
};

export default App;
