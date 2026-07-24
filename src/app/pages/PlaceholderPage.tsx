import { Construction } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface PlaceholderPageProps {
  title: string;
  description?: string;
}

/** Temporary page for modules not yet implemented (nav + routing wiring). */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="size-5 text-warning" aria-hidden="true" />
            {title}
          </CardTitle>
          <CardDescription>
            {description ?? 'Bu modül yakında eklenecek. Gezinme ve yerleşim burada test edilebilir.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Kenar çubuğu ↔ üst menü modunu değiştirin, komut paletini (⌘K) ve mobil görünümü deneyin.
        </CardContent>
      </Card>
    </div>
  );
}
