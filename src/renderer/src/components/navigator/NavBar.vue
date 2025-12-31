<template>
  <div class="app-bar" :style="stateStore.background">
    <div :style="{ marginLeft: isMac ? '72px' : '0px' }" class="title">Arcadia</div>
    <div class="drag"></div>
    <div class="app-options">
      <v-btn icon variant="text" size="32" class="nav-btn" @click="$router.go(-1)">
        <v-icon icon="mdi-arrow-left"></v-icon>
      </v-btn>
      <v-btn icon variant="text" size="32" class="nav-btn" @click="$router.go(1)">
        <v-icon icon="mdi-arrow-right"></v-icon>
      </v-btn>
      <div class="search">
        <v-text-field
          prepend-inner-icon="mdi-magnify"
          density="compact"
          variant="outlined"
          color="on-secondary"
          hide-details
          :min-width="minWidth"
          :max-width="maxWidth"
          v-model="searchText"
          @click="minWidth = '200px'"
          @keyup.enter="$router.push({ name: 'search', params: { keywords: searchText } })"
          @contextmenu.prevent="FPaste"
          v-click-outside="{
            handler: () => {
              minWidth = '100px'
            },
            include: FSearchCloseInclude
          }"
          class="search-bar"
          ref="search-bar"
          :style="{ minWidth: isMac ? '250px' : '100px' }"
        >
          <template #append-inner>
            <v-icon icon="mdi-delete" @click="searchText = ''"></v-icon>
          </template>
        </v-text-field>
        <div ref="search-suggest">
          <v-expand-transition>
            <SearchSuggest v-if="searchText && minWidth === '200px'" :keyword="FKeyword" />
          </v-expand-transition>
        </div>
      </div>
      <div class="user-panel">
        <div class="placeholder">
          <div class="login-account" :class="{ 'login-account-active': isShow }">
            <v-btn
              icon
              size="32"
              class="login-icon"
              :class="{ 'login-icon-active': isShow }"
              variant="text"
              @click="isShow = !isShow"
              v-click-outside="{
                handler: () => {
                  isShow = false
                },
                include: FAccountCloseInclude
              }"
            >
              <v-icon size="x-large" icon="mdi-account" class="login-icon"></v-icon>
            </v-btn>
            <div class="account-panel" ref="account-panel">
              <v-expand-transition>
                <UserDialogs v-if="isShow" />
              </v-expand-transition>
            </div>
          </div>
        </div>
      </div>
      <v-btn
        icon
        size="32"
        variant="text"
        :class="{ 'cog-rotate': cogRotate }"
        @mouseenter="cogRotate = true"
        @animationend="cogRotate = false"
        @click="$router.push({ name: 'setting' })"
        :style="{ marginRight: isMac ? '12px' : '0px' }"
      >
        <v-icon icon="mdi-cog" :class="{ cog: cogRotate }" size="x-large"></v-icon>
      </v-btn>
    </div>

    <Menu class="menu" :style="{ width: isMac ? 'auto' : '22%' }" />
  </div>
</template>

<script lang="ts" setup name="NavBar">
  import { ref, useTemplateRef, nextTick } from 'vue'
  import Menu from './components/Menu.vue'
  import { useStateStore } from '@renderer/store/stateStore'
  import SearchSuggest from './components/SearchSuggest.vue'
  // import { useRouter } from 'vue-router'
  // // const router = useRouter()
  const accountPanel = useTemplateRef('account-panel')
  const searchSuggest = useTemplateRef('search-suggest')
  const searchBar = useTemplateRef('search-bar')
  const stateStore = useStateStore()
  const isMac = window.api.platform === 'darwin'
  const minWidth = ref('100px')
  const maxWidth = ref('200px')
  const cogRotate = ref(false)
  const isShow = ref(false)
  const searchText = ref('')
  function FKeyword() {
    return searchText
  }
  function FSearchCloseInclude() {
    return [searchSuggest.value]
  }
  function FAccountCloseInclude() {
    return [accountPanel.value]
  }
  function FPaste() {
    navigator.clipboard.readText().then((text) => {
      searchText.value = text
    })
    minWidth.value = '200px'
    nextTick(() => {
      searchBar.value?.focus()
    })
  }
  // function FBackOrForward(to: number) {
  //   router.go(to)
  // }
</script>

<style lang="scss" scoped>
  .app-bar {
    width: 100%;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-self: center;
    backdrop-filter: blur(50px);
    color: rgb(var(--v-theme-on-surface));
    z-index: 10000;
  }
  :deep(.v-btn__overlay) {
    display: none;
  }
  .title {
    font-size: 1.2rem;
    margin-left: 1rem;
    color: white;
  }
  .app-options {
    display: flex;
    align-items: center;
    gap: 10px;
    -webkit-app-region: no-drag;
  }
  .search {
    position: relative;
  }
  :deep(.v-input--density-compact) {
    --v-input-control-height: 32px;
  }
  .search-bar {
    transition: all 0.3s;
    height: 32px !important;
  }
  :deep(.v-field) {
    --v-field-input-padding-top: 0px;
  }
  :deep(.v-field--no-label) {
    --v-field-padding-bottom: 0px;
  }
  :deep(.v-field__input) {
    padding-bottom: 0;
    padding-top: 0;
  }
  .drag {
    flex: 1;
    height: 100%;
    -webkit-app-region: drag;
  }
  .icon-container {
    display: flex;
    gap: 10px;
  }
  .menu {
    width: 22%;
  }
  .user-panel {
    position: relative;
  }
  .placeholder {
    width: 32px;
    height: 32px;
  }
  .login-account {
    position: absolute;
    transition: all 0.3s;
  }
  .account-panel {
    position: absolute;
    // top: 50%;
    left: 50%;
    transform: translate(-50%, 0%);
  }
  .login-icon {
    cursor: pointer;
    transition: all 0.3s;
  }
  .cog-rotate {
    @keyframes rotate-scale-up {
      0% {
        transform: scale(1) rotateZ(0);
        animation-timing-function: ease-in;
      }
      50% {
        transform: scale(1.1) rotateZ(60deg);
        animation-timing-function: linear;
      }
      100% {
        transform: scale(1) rotateZ(120deg);
        animation-timing-function: ease-out;
      }
    }
    animation: rotate-scale-up 0.5s;
  }
  .login-account-active {
    transform: translate(-48px, 48px);
  }
  .login-icon-active {
    transform: scale(1.5);
  }
</style>
