// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Yacht.Chat Support',
  tagline: 'Experience a new and private way of spontaneous remote communication that follows your team’s workflow.',
  url: 'https://www.yacht.chat',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'https://app.yacht.chat/yacht.ico',
  organizationName: 'Yacht.Chat', // Usually your GitHub org/user name.
  projectName: 'Yacht.Chat', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        blog: {
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({

      colorMode: {
        defaultMode: 'light',
        disableSwitch: true,
        respectPrefersColorScheme: true,
      },

      navbar: {
        logo: {
          alt: 'Yacht.Chat',
          src: 'https://app.yacht.chat/yacht512.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Support',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://www.yacht.chat',
            label: 'Yacht.Chat',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'FAQs',
                to: '/docs/intro',
              },
              {
                label: 'Getting Started',
                to: '/docs/Getting-Started',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/company/yacht-chat/',
              },
              {
                label: 'Instagram',
                href: 'https://www.instagram.com/yacht.chat/',
              },
              {
                label: 'TU Highway',
                href: 'https://www.highway.tu-darmstadt.de/institutions/single/320039/YachtChat83e8abce',
              },
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/channel/UC905JslrRFgOymf1bTr2s1Q',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'Imprint',
                to: '/docs/Data,%20Security%20and%20Privacy/Contact',
              },
              {
                label: 'Contact',
                href: 'mailto:contact@yacht.chat',
              },

            ],
          },
        ],
        copyright: `Copyright © 2021-${new Date().getFullYear()} Yacht.Chat, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
