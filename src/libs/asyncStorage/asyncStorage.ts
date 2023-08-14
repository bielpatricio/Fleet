import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_ASYNC_KEY = '@ignite-fleet:last_sync'

export async function getLastAsyncTimestamp() {
  const storage = await AsyncStorage.getItem(STORAGE_ASYNC_KEY)

  return Number(storage)
}

export async function saveLastAsyncTimestamp() {
  const timestamp = new Date().getTime()

  await AsyncStorage.setItem(STORAGE_ASYNC_KEY, timestamp.toString())
}
