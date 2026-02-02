import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'VROcean',
  tagline: 'High-performance FFT ocean simulation for Unity VR',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // Update these for your GitHub Pages deployment
  url: 'https://platypusideas.github.io',
  baseUrl: '/vrocean-docs/',

  // GitHub pages deployment config
  organizationName: 'platypusideas',
  projectName: 'vrocean-docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: false, // Disable blog for documentation-only site
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/vrocean-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      logo: {
        alt: 'VROcean Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://assetstore.unity.com/',
          label: 'Asset Store',
          position: 'right',
        },
        {
          href: 'https://github.com/platypusideas/vrocean',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started/installation',
            },
            {
              label: 'Configuration',
              to: '/docs/configuration/biome-profiles',
            },
            {
              label: 'Components',
              to: '/docs/components/scene-system',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Unity Asset Store',
              href: 'https://assetstore.unity.com/packages/tools/behavior-ai/air-path-348028',
            },
            {
              label: 'Platypus Ideas',
              href: 'https://platypus-ideas.com/',
            },
          ],
        },
        {
          title: 'Support',
          items: [
            {
              label: 'Contact',
              href: 'mailto:info@platypusideas.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Platypus Ideas. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['csharp', 'hlsl', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;