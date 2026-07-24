import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';

/** 403 shown when the current role lacks a route's required permission. */
export function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-lg py-10">
      <EmptyState
        icon={ShieldAlert}
        title="Erişim yetkiniz yok (403)"
        description="Bu sayfayı görüntülemek için gerekli izne sahip değilsiniz. Yöneticinizle iletişime geçin."
        action={
          <Button asChild variant="outline">
            <Link to="/" data-action="navigate" data-entity="dashboard">
              Genel Bakış'a dön
            </Link>
          </Button>
        }
      />
    </div>
  );
}
