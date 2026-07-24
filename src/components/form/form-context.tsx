import { FormProvider } from 'react-hook-form';

/**
 * Form root — thin alias over RHF's FormProvider so features write
 * `<Form {...form}>` while keeping the RHF API. Pair with `useForm` +
 * `zodResolver` at the call site.
 */
export const Form = FormProvider;
