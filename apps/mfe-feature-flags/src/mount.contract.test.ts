import { MFEMountFnSchema } from '@dxp/federation-contracts';
import { describe, expect, it } from 'vitest';

import mount from './mount.js';
import { MOCK_PROPS } from './test-utils/mockProps.js';

describe('MFE Contract', () => {
  it('default export satisfies MFEMountFn schema', () => {
    expect(MFEMountFnSchema.safeParse(mount).success).toBe(true);
  });

  it('mount() returns an object with an unmount function', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const instance = mount(container, MOCK_PROPS);
    expect(typeof instance.unmount).toBe('function');
    instance.unmount();
    document.body.removeChild(container);
  });

  it('mount() applies dark class when theme mode is dark', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const instance = mount(container, { ...MOCK_PROPS, theme: { mode: 'dark' } });
    expect(container.classList.contains('dark')).toBe(true);
    instance.unmount();
    document.body.removeChild(container);
  });

  it('unmount() removes the dark class', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const instance = mount(container, { ...MOCK_PROPS, theme: { mode: 'dark' } });
    instance.unmount();
    expect(container.classList.contains('dark')).toBe(false);
    document.body.removeChild(container);
  });

  it('unmount() clears the React root', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const instance = mount(container, MOCK_PROPS);
    instance.unmount();
    expect(container.innerHTML).toBe('');
    document.body.removeChild(container);
  });
});
