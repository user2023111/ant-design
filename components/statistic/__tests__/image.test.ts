import { describe } from 'vitest';
import { imageDemoTest } from '../../../tests/shared/imageTest';

describe('Statistic image', () => {
  imageDemoTest('statistic', { skip: ['countdown.tsx'] });
});
