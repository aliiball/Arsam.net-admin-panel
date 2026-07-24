import { beforeAll } from 'vitest';
import { setProjectAnnotations } from '@storybook/react-vite';

import * as previewAnnotations from './preview';

const annotations = setProjectAnnotations([previewAnnotations]);

// Run Storybook's `beforeAll` (loaders, decorators bootstrap) for the vitest project.
beforeAll(annotations.beforeAll);
