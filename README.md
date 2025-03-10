# chat-ai

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

Assets- хранит стили и библиотеку иконок, в ней в папке styles есть файл variables.scss, в него добавляй все цвета которых нет и используй переменные из этого файла для добавления цвета компоненту

Components - компоненты, которые разбиты по папкам из названий которых можно понять к чем относятся
Внутри есть папка ui которая переиспользуется для кнопок инпутов и тд (нужно время, чтобы добавить актуальные стили в компоненты для проекта)

Constants- переменные для WebSocket, в дальнейшем добавим папку с апи

Enums- данные для select компонента 

Layout - компоненты макета 

Pages - страницы

Router - папка маршрутизатора, в ней папка routes, в которой routeName и router.ts для добавления нового маршрута, другие файлы не трогаем

Store - это хранилище, в нем начальное состояние(мок данные), а также actions и getters, где можем проводить манипуляции с хранилищем 