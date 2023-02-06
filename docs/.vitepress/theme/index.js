import { createPinia } from 'pinia'
import DefaultTheme from 'vitepress/theme'
import './tailwind.postcss'
import Layout from './Layout.vue'
import IpfsImg from './ipfs/img.vue'
import IpfsComments from './ipfs/comments.vue'
import FileUploaderBanner from './FileUploader/banner.vue'
const components = import.meta.glob('./components/*.vue', {eager: true})

export default {
  ...DefaultTheme,
  Layout,
  enhanceApp(ctx) {
    const pinia = createPinia()
    ctx.app.use(pinia)
    DefaultTheme.enhanceApp(ctx)
    ctx.app.component('IpfsImg', IpfsImg)
    ctx.app.component('IpfsComments', IpfsComments)
    ctx.app.component('FileUploaderBanner', FileUploaderBanner)

    Object.keys(components).forEach(key => {
      const name = key.replace('./components/', '').replace('.vue', '')
      ctx.app.component(name, components[key].default)
    })
  }
}