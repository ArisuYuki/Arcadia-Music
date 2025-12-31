import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electronMessagePort: MessagePort
    electron: ElectronAPI
    api: {
      platform: string
      netEaseCloud: {
        login_qr_key(): Promise<any>
        login_qr_create(unikey: string): Promise<any>
        login_qr_check(unikey: string): Promise<any>
        playlist_detail(options: object): Promise<any>
        playlist_track(op: string, pid: number | string, tracks: number[] | string[]): Promise<any>
        playlist_create(name: string, isPrivate: boolean): Promise<any>
        playlist_delete(id: number): Promise<any>
        song_url(options: object): Promise<any>
        song_lyric(options: object): Promise<any>
        song_like_check(ids: number[] | string[]): Promise<any>
        song_like(id: number | string, like: boolean): Promise<any>
        song_detail(options: object): Promise<any>
        song_order_update(pid: number, ids: number[]): Promise<any>
        song_comments(options: object): Promise<any>
        artist_songs(options: object): Promise<any>
        artist_albums(options: object): Promise<any>
        artist_detail(options: object): Promise<any>
        artist_subList(): Promise<any>
        artist_sub(id: number, type: 'sub' | 'unsub'): Promise<any>
        album_detail(options: object): Promise<any>
        album_subList(): Promise<any>
        album_sub(id: number, type: 'sub' | 'unsub'): Promise<any>
        recommend_songs(): Promise<any>
        recommend_playlist(): Promise<any>
        user_account(): Promise<any>
        user_playlist(options: object): Promise<any>
        user_record(url: number, type: number): Promise<any>
        logout(): Promise<any>
        search(options: object): Promise<any>
        search_suggest(keywords: string): Promise<any>
        fm(): Promise<any>
        comments(options: object): Promise<any>
      }
    }
    utils: {
      clearCache(): void
    }
  }
}
