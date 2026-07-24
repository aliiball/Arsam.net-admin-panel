import { render } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { Form } from './form-context';
import { FormField } from './FormField';
import { Input } from '@/components/ui/input';

function Wrapper({ children }: { children: React.ReactNode }) {
  const form = useForm({ defaultValues: { x: '' } });
  return <Form {...form}>{children}</Form>;
}

describe('FormField help enforcement', () => {
  it('throws in dev when no help/helper/warning is provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <Wrapper>
          <FormField name="x" label="X">
            <Input />
          </FormField>
        </Wrapper>,
      ),
    ).toThrow(/help affordance/);
    spy.mockRestore();
  });

  it('renders when a helper is provided', () => {
    const { getByText } = render(
      <Wrapper>
        <FormField name="x" label="X" helper="Yardımcı metin">
          <Input />
        </FormField>
      </Wrapper>,
    );
    expect(getByText('Yardımcı metin')).toBeInTheDocument();
  });
});
