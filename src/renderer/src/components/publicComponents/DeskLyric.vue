<template>
  <div></div>
</template>

<script setup lang="ts">
  import { inject, shallowRef, watch, ref, onBeforeUnmount } from 'vue'
  import type Player from '@renderer/utils/player'
  import { useStateStore } from '@renderer/store/stateStore'
  import { type Setting } from '@renderer/utils/setting'
  const stateStore = useStateStore()
  const player = inject('player') as Player
  const currentTrack = player.currentTrack
  const lyric = shallowRef([]) as any
  const time = shallowRef([]) as any
  let index = -1
  let previousIndex = -1
  const globalSetting = inject('setting') as Setting
  const activeIndex = ref([]) as any
  // let offsetLyric = [] as any
  function FUpdateLyric() {
    const color = globalSetting.settings.theme.deskLyricAutoColor
      ? stateStore.trackMainColor.color
      : globalSetting.settings.theme.deskLyricFontColor
    const fontSize = globalSetting.settings.theme.deskLyricSize + 'rem'
    window.electron.ipcRenderer.send('update-lyric', {
      style: {
        color,
        fontSize
      },
      ...lyric.value[index]
    })
  }
  function FCallBack(currentTime: number) {
    //必须有歌词才能更新
    if (!lyric.value.length) return
    //保存当前的位置
    previousIndex = index
    //开始查找下一次的位置
    index = -1
    for (let i = 0; i < time.value.length; i++) {
      if (currentTime >= time.value[i]) index++
    }
    //如果是开始的位置或者位置没有变化，就不用更新
    if (index === -1) {
      //如果是上次结束之后重新播放，回归滚动位置
      if (previousIndex !== -1) {
        activeIndex.value[activeIndex.value.length - 1] = 0
      }
      return
    } else if (previousIndex === index) return
    else {
      //否则更新
      FUpdateLyric()
      if (previousIndex !== -1) activeIndex.value[previousIndex] = 0
      activeIndex.value[index] = 1
    }
  }
  //每次时间变化都执行一次歌词更新
  const f = player.onTimeUpdate(FCallBack)
  onBeforeUnmount(() => {
    player.removeTimeUpdate(f)
  })
  async function FFetchLyric() {
    let lyricData = {} as any
    const time: Array<number> = []
    const lyric: Array<string> = []
    const transLyric: Array<string> = []
    const totalLyric: Array<any> = []
    //标记是否成功解析到了任何有效的原始歌词
    let hasLyric = false

    if (currentTrack.value.local) {
      time.push(0)
      lyric.push(`本地音乐`)
      if (currentTrack.value.lyric === undefined) {
        return { time: [0], totalLyric: [{ lyric: lyric[0], transLyric: '' }] }
      } else {
        lyricData = {
          lrc: { lyric: currentTrack.value.lyric.lrc },
          tlyric: { lyric: currentTrack.value.lyric.tlyric }
        }
      }
    } else {
      lyricData = await window.api.netEaseCloud.song_lyric({ id: currentTrack.value.id })
    }

    time.push(0)
    lyric.push(`${currentTrack.value.ar[0].name} - ${currentTrack.value.name}`)

    // 处理原始歌词
    if (lyricData?.lrc?.lyric) {
      hasLyric = true
      for (const item of FReadLyric(lyricData.lrc.lyric)) {
        if (item[1].trim()) {
          time.push(parseFloat(FGetLyricTime(item[0])))
          lyric.push(item[1].trim())
        }
      }
    }

    // 处理翻译歌词
    if (lyricData?.tlyric?.lyric) {
      for (const item of FReadLyric(lyricData.tlyric.lyric)) {
        const transTime = parseFloat(FGetLyricTime(item[0]))
        const index = time.findIndex((t) => transTime === t)
        if (index !== -1) transLyric[index] = item[1].trim()
      }
      transLyric.length = lyric.length
    }
    for (let i = 0; i < lyric.length; i++) {
      totalLyric.push({ lyric: lyric[i], transLyric: transLyric[i] })
    }

    // 如果既没有原始歌词也没有翻译歌词（除了歌曲名），则显示“暂无歌词哦”
    if (!hasLyric && totalLyric.length <= 1) {
      return { time: [0], totalLyric: [{ lyric: '暂无歌词哦', transLyric: '' }] }
    }

    return { time, totalLyric }
  }
  function FLoadLyric(timeAndLyric: any) {
    time.value = timeAndLyric.time
    lyric.value = timeAndLyric.totalLyric
    //恢复初始状态
    index = -1
    previousIndex = -1
    activeIndex.value = new Array(lyric.value.length).fill(0)
    //更新歌词后获得新的高度，并计算所有的索引位置的偏移量,并回到位置0处
  }

  async function FGetLyric() {
    const timeAndLyric = await FFetchLyric()

    FLoadLyric(timeAndLyric)
  }
  function FReadLyric(lyric: string): Array<Array<string>> {
    let lyricSplit = lyric.split('\n').filter((item: string) => item !== '')
    lyricSplit = lyricSplit.filter(
      (item: string) => item[0] === '[' && item[3] === ':' && (item[6] === ':' || item[6] === '.')
    )
    return lyricSplit.map((item: string) => {
      const [time, content] = item.split(']')
      return [time + ']', content]
    })
  }
  function FGetLyricTime(timeStr: string): string {
    // 拆分时间字符串为分钟、秒和毫秒部分
    let minutes, minutesPart, secondsPart, millisecond
    if (timeStr[6] === '.') {
      ;[minutes, millisecond] = timeStr.slice(1, -1).split('.') // 去除方括号并拆分
      ;[minutesPart, secondsPart] = minutes.split(':')
    } else {
      ;[minutesPart, secondsPart, millisecond] = timeStr.slice(1, -1).split(':') // 去除方括号并拆分
    }
    const millisPart = parseFloat('0.' + millisecond) // 将毫秒部分转换为小数
    // 将分钟转换为秒并加上秒和毫秒部分
    const seconds = parseInt(minutesPart, 10) * 60 + parseFloat(secondsPart) + millisPart

    // 返回总秒数（如果需要，可以四舍五入到小数点后几位）
    return seconds.toFixed(3) // 这里保留三位小数，因为毫秒有三位
  }
  watch(currentTrack, FGetLyric, { immediate: true })
</script>

<style lang="scss" scoped></style>
