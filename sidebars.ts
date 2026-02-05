import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/quick-setup',
        'getting-started/first-floating-object',
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      items: [
        'configuration/biome-profiles',
        'configuration/wave-settings',
        'configuration/visual-tuning',
        'configuration/skybox-setup',
      ],
    },
    {
      type: 'category',
      label: 'Components',
      items: [
        'components/ocean-simulator',
        'components/surface-renderer',
        'components/reflection-probe',
      ],
    },
    {
      type: 'category',
      label: 'Optimization',
      items: [
        'optimization/vr-performance',
        'optimization/quality-presets',
      ],
    },
    'troubleshooting',
  ],
};

export default sidebars;