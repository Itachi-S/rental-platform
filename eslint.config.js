import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import prettier from 'eslint-config-prettier'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },
  /**
     * 配置全局变量
     */
  {
    languageOptions: {
      globals: {
        ...globals.browser,

        /** 追加一些其他自定义全局规则 */
        wx: true,
      },
    },
  },

  // JavaScript推荐配置
  js.configs.recommended,

  // Vue.js推荐配置
  ...pluginVue.configs['flat/essential'],

  // 跳过格式化配置
  skipFormatting,

  // 关闭与Prettier冲突的规则
  prettier,

  // 自定义规则
  {
    rules: {
      // 强制使用单引号
      'quotes': ['error', 'single'],
      // 禁止使用分号
      'semi': ['error', 'never'],
      // 禁止未使用的变量
      'no-unused-vars': 'warn',
      // 强制缩进为2个空格
      'indent': ['error', 2],
      'no-undef': 'error',
      // Vue组件名必须为多单词
      'vue/multi-word-component-names': ['error', {
        ignores: ['index']
      }]
    }
  }
]