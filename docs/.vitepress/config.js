import path from 'path'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vitepress'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { HeadlessUiResolver } from 'unplugin-vue-components/resolvers'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import VueMacros from 'unplugin-vue-macros/vite'
import Vue from '@vitejs/plugin-vue'
export default defineConfig({
  title: 'SellX3',
  description: 'Buidlers now can Sell anything in Web3 Verse with easy and freedom',
  locales: {
    '/': {
      lang: 'en-US',
      title: 'SellX3',
      description: 'Buidlers now can Sell anything in Web3 Verse with easy and freedom'
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'SellX3',
      description: '创造者可以很简单自由的在 Web3 宇宙中售卖任何创意'
    }
  },
  vue: {
    reactivityTransform: path.resolve(__dirname, 'theme'),
  },
  vite: {
    define: {
      'process.env': {},
      global: {},
    },
    plugins: [
      VueMacros(),
      nodePolyfills({
        include: ['node_modules/**/*.js', new RegExp('node_modules/.vite/.*js')],
      }),
      AutoImport({
        imports: [
          'vue',
          'vue/macros',
          'vue-router',
          'vue-i18n',
          '@vueuse/head',
          '@vueuse/core',
          {
            'lodash': [
              'isEqual',
              'uniq',
              'random',
              'remove',
              'merge',
              'forEach',
              'get',
              'reverse',
              'filter',
              'upperFirst',
              'take',
              'shuffle',
            ],
            'pinia': [
              'acceptHMRUpdate',
              'defineStore',
              'storeToRefs',
            ],
            'villus': [
              'useQuery',
            ],
            'graphql-tag': [
              'gql',
            ],
            '@headlessui/vue': [
              'TransitionRoot',
              'TransitionChild',
              'Dialog',
              'DialogPanel',
              'DialogOverlay',
              'DialogTitle',
              'DialogDescription',
              'Menu',
              'MenuButton',
              'MenuItem',
              'MenuItems',
              'TabGroup',
              'TabList',
              'Tab',
              'TabPanels',
              'TabPanel',
              'Combobox',
              'ComboboxInput',
              'ComboboxButton',
              'ComboboxOptions',
              'ComboboxOption',
            ],
          },
        ],
        dirs: [
        ],
        dts: '../auto-imports.d.ts',
        vueTemplate: true,
      }),
      Components({
        resolvers: [
          IconsResolver({
            prefix: false,
            // enabledCollections: ['carbon']
          }),
          HeadlessUiResolver({ prefix: '' }),
        ],
        dts: '../components.d.ts',
      }),
      Icons(),
    ],
    build: {
      transpile: ['@heroicons/vue']
    }
  },
  themeConfig: {
    logo: '/logo.png',
    siteTitle: false,
    localeLinks: {
      text: 'English',
      items: [
        { text: '中文', link: '/zh/', activeMatch: '/zh/'},
      ]
    },
    nav: [
      // { text: 'Discover', link: '/discover',  activeMatch: '/discover' },
      { text: '三体2', link: '/santi2/index',  activeMatch: '/santi2/' },
      { text: 'Guide', link: '/guide/getting-started',  activeMatch: '/guide' },
      { text: 'Pricing', link: '/pricing',  activeMatch: '/pricing' },
      { text: 'About', link: '/about',  activeMatch: '/about' },
    ],
    footer: {
      message: '©2023 SellX3.com All rights reserved.',
      // copyright: 'Made with ❤️ by <a href="https://github.com/Web3HackerDAO" target="_blank">Web3HackerDAO</a>'
    },
    sidebar: {
      '/guide/': [{
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
        ]
      }],
      '/santi2/': [{
        text: '三体2: 黑暗森林',
        items: [
          { text: '01. 危机纪年第3年', link: '/santi2/01' },
          { text: '02. 危饥纪年第8年', link: '/santi2/02' },
          { text: '03. 危机纪年第12年', link: '/santi2/03' },
        ]
      }],
      '/santi2-gating/': [{
        text: '三体2: 黑暗森林',
        items: [
          { text: '01. 危机纪年第3年', link: '/santi2-gating/01' },
          { text: '02. 危饥纪年第8年', link: '/santi2-gating/02' },
          { text: '03. 危机纪年第12年', link: '/santi2-gating/03' },
        ]
      }],
    },
    sidebar2: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Web3HackerDAO/de-wordpress-fevm-lighthouse' },
      { icon: 'twitter', link: 'https://twitter.com/Web3HackerDAO' },
      { icon: 'discord', link: 'https://discord.gg/wpc9ZP3bBG' },
    ],
    locales: {
      '/zh/': {
        localeLinks: {
          text: '中文',
          items: [
            { text: 'English', link: '/', activeMatch: '/' },
          ]
        },
        nav: [
          // { text: '发现', link: '/zh/discover',  activeMatch: '/zh/discover' },
          { text: '博客', link: 'https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0NDM5NzkwNg==&action=getalbum&album_id=2741406345877012482&scene=173&from_msgid=2247483826&from_itemidx=1&count=3&nolastread=1#wechat_redirect'},
          { text: '指南', link: '/zh/guide/getting-started',  activeMatch: '/zh/guide' },
          { text: '价格', link: '/zh/pricing',  activeMatch: '/zh/pricing' },
          { text: '关于', link: '/zh/about',  activeMatch: '/zh/about' },
        ],
        sidebar: [
          {
            text: '指南',
            items: [
              { text: '开始', link: '/zh/guide/getting-started' },
            ]
          }
        ],
        footer: {
          message: '©2023 SellX3.com 版权所有。',
          copyright: '由 <a href="https://github.com/Web3HackerDAO" target="_blank">Web3HackerDAO</a> 带着 ❤️  制作'
        },
      }
    }
  }
})