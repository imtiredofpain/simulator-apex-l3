import { ErrorCard } from '@mrdn/app-common';
import ErrorPageContainer from './Container';
import { useCallback } from 'react';
import { Badge } from '@shared/components/ui/badge';
import { useLocation } from 'react-router-dom';

function RequiredInn() {
  const location = useLocation();
  const onReload = useCallback((): void => {
    window.location.reload();
  }, []);

  return (
    <ErrorPageContainer>
      <ErrorCard
        kind="forbidden"
        code={403}
        onRetry={onReload}
        currentPath={location.pathname}
        title="Необходимо указать ИНН"
        description="Для продолжения работы необходимо указать ИНН в правом верхнем углу."
        showFootnote={false}
        BadgeComponent={({ children, className }) => (
          <Badge variant="outline" className={className}>
            {children}
          </Badge>
        )}
      />
    </ErrorPageContainer>
  );
}

export default RequiredInn;
