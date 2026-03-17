import { ErrorCard } from '@mrdn/app-common';
import { useLocation, useNavigate } from 'react-router-dom';
import ErrorPageContainer from '@features/Errors/ui/Container';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

function NoImplement() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <ErrorPageContainer>
      <ErrorCard
        kind="maintenance"
        currentPath={location.pathname}
        title="Страница в разработке"
        description={`Страница ${location.pathname} находится в разработке`}
        showFootnote={false}
        extraActions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Вернуться назад
          </Button>
        }
        BadgeComponent={({ children, className }) => (
          <Badge variant="outline" className={className}>
            {children}
          </Badge>
        )}
      />
    </ErrorPageContainer>
  );
}

export default NoImplement;
