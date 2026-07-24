import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface SettingsSectionProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}

/** Titled card wrapping a group of settings fields. */
export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
