<template>
  <div class="menu">
    <div class="drag" @dblclick="FMaximizeWindows"></div>
    <div v-if="!isMac" class="icon-container">
      <v-btn
        icon
        :ripple="false"
        variant="text"
        size="32"
        @click="FMinimizeWindows"
        class="menu-option"
      >
        <v-icon icon="mdi-window-minimize" size="small"></v-icon>
      </v-btn>
      <v-btn
        icon
        :ripple="false"
        variant="text"
        size="32"
        @click="FMaximizeWindows"
        class="menu-option"
      >
        <v-icon icon="mdi-window-maximize" size="small"></v-icon>
      </v-btn>
      <v-btn
        icon
        :ripple="false"
        variant="text"
        size="32"
        @click="FCloseWindows"
        class="menu-option"
      >
        <v-icon icon="mdi-window-close" size="small"></v-icon>
      </v-btn>
    </div>
    <v-dialog
      v-if="dialog"
      v-model="dialogControl"
      width="30%"
      max-height="50%"
      persistent
      @after-leave="dialog = false"
    >
      <v-sheet rounded="lg" class="dialog">
        <div class="options">
          <v-spacer></v-spacer>
          <v-btn icon @click="(dialogControl = false), FCloseWindows()">
            <v-icon icon="mdi-check" size="x-large"></v-icon>
          </v-btn>
          <v-btn icon @click="dialogControl = false">
            <v-icon icon="mdi-close" size="x-large"></v-icon>
          </v-btn>
        </div>
        <v-radio-group v-model="behavior">
          <v-radio label="关闭应用" value="close"></v-radio>
          <v-radio label="最小化" value="minimize"></v-radio>
        </v-radio-group>
        <v-checkbox label="记住我的选择" v-model="remember" class="remember"></v-checkbox>
      </v-sheet>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
  import { inject, ref } from 'vue'
  import type { Setting } from '@renderer/utils/setting'
  const globalSetting = inject('setting') as Setting
  const isMac = window.api.platform === 'darwin'
  const dialog = ref(false)
  const dialogControl = ref(true)
  const behavior = ref('close')
  const remember = ref(false)
  function FCloseWindows() {
    dialogControl.value = true
    let key = behavior.value
    //如果点了记住，那就更改设置
    if (remember.value) globalSetting.settings.behaviorWhenClose = behavior.value
    //如果设置不是默认的询问，那就选择设置优先
    if (globalSetting.settings.behaviorWhenClose !== 'query')
      key = globalSetting.settings.behaviorWhenClose
    //如果设置是询问，并且没有打开对话框，那就打开。
    if (globalSetting.settings.behaviorWhenClose === 'query' && !dialog.value) {
      dialog.value = true
      return
    } else {
      dialog.value = false
    }
    if (key === 'close') {
      window.electron.ipcRenderer.send('close-window')
    } else if (key === 'minimize') {
      window.electron.ipcRenderer.send('hide-window')
    }
  }
  function FMinimizeWindows() {
    window.electron.ipcRenderer.send('minimize-window')
  }
  function FMaximizeWindows() {
    window.electron.ipcRenderer.send('maximize-window')
  }
</script>

<style lang="scss" scoped>
  .drag {
    flex: 1;
    height: 100%;
    -webkit-app-region: drag;
  }
  .menu {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .menu-option {
    transition: all 0.3s;
    &:hover {
      transform: scale(1.2);
    }
  }
  :deep(.v-btn__overlay) {
    display: none;
  }
  .dialog {
    padding: 5% 5% 0% 5%;
    display: flex;
    flex-direction: column;
  }
  .close-btn,
  .remember {
    align-self: end;
  }
  .divider {
    margin: 5px 0px;
  }
  .options {
    display: flex;
    gap: 5px;
  }
  .actions {
    display: flex;
    justify-content: center;
  }
</style>
