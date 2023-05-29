import { useEffect, useState } from 'react'
import { Container, Content, Label, Title } from './styles'
import { HomeHeader } from '@components/HomeHeader'
import { CarStatus } from '@components/CarStatus'
import { useNavigation } from '@react-navigation/native'
import { useQuery, useRealm } from '@libs/realm'
import { Historic } from '@libs/realm/schemas/Historic'
import { Alert, FlatList } from 'react-native'
import { HistoricCard, HistoricCardProps } from '@components/HistoricCard'
import dayjs from 'dayjs'
import { Realm, useUser } from '@realm/react'
import {
  getLastSyncTimestamp,
  saveLastSyncTimestamp,
} from '@libs/asyncStorage/asyncStorage'
import Toast from 'react-native-toast-message'
import { TopMessage } from '@components/TopMessage'
import { CloudArrowUp } from 'phosphor-react-native'

export function Home() {
  const { navigate } = useNavigation()
  const user = useUser()
  const [vehicleInUse, setVehicleInUse] = useState<Historic | null>(null)
  const [vehicleHistoric, setVehicleHistoric] = useState<HistoricCardProps[]>(
    [],
  )
  const [percentageToSync, setPercentageToSync] = useState<string | null>(null)

  function handleRegisterMovement() {
    if (vehicleInUse?._id) {
      return navigate('arrival', { id: vehicleInUse._id.toString() })
    } else {
      navigate('departure')
    }
  }

  const historic = useQuery(Historic)
  const realm = useRealm()

  function fetchVehicleInUse() {
    try {
      const vehicle = historic.filtered('status = "departure"')[0]
      setVehicleInUse(vehicle)
    } catch (error) {
      Alert.alert(
        'Veículo não encontrado',
        'Não foi possível encontrar o veículo em uso.',
      )
    }
  }

  useEffect(() => {
    fetchVehicleInUse()
  }, [])

  useEffect(() => {
    realm.addListener('change', () => fetchVehicleInUse())

    return () => {
      if (realm && !realm.isClosed) {
        realm.removeListener('change', fetchVehicleInUse)
      }
    }
  }, [])

  async function fetchHistoric() {
    try {
      const vehicles = historic.filtered(
        'status = "arrival" SORT(created_at DESC)',
      )

      const lastSync = await getLastSyncTimestamp()

      const formattedHistoric = vehicles.map((item) => {
        return {
          id: item._id!.toString(),
          licensePlate: item.license_plate,
          isSync: lastSync > item.updated_at!.getTime(),
          created: dayjs(item.created_at).format('[Saída em] DD/MM [às] HH:mm'),
        }
      })
      setVehicleHistoric(formattedHistoric)
    } catch (error) {
      Alert.alert('Histórico', 'Não foi possível carregar o Histórico.')
    }
  }

  async function progressNotification(
    transferred: number,
    transferable: number,
  ) {
    const percentage = (transferred / transferable) * 100

    if (percentage === 100) {
      await saveLastSyncTimestamp()
      await fetchHistoric()
      setPercentageToSync(null)

      Toast.show({
        type: 'info',
        text1: 'Todos os dados foram sincronizados com sucesso!',
      })
    }

    if (percentage < 100) {
      setPercentageToSync(`${percentage.toFixed(0)}%`)
    }
  }

  function handleHistoricDetails(id: string) {
    navigate('arrival', { id })
  }

  useEffect(() => {
    fetchHistoric()
  }, [historic])

  useEffect(() => {
    realm.subscriptions.update((mutableSubs, realm) => {
      const historicByUserQuery = realm
        .objects('Historic')
        .filtered(`user_id = '${user!.id}'`)

      mutableSubs.add(historicByUserQuery, { name: 'historic_by_user' })
    })
  }, [realm, user])

  useEffect(() => {
    const syncSession = realm.syncSession
    if (!syncSession) return

    syncSession.addProgressNotification(
      Realm.ProgressDirection.Upload,
      Realm.ProgressMode.ReportIndefinitely,
      progressNotification,
    )

    return () => syncSession.removeProgressNotification(progressNotification)
  }, [])

  return (
    <Container>
      {percentageToSync && (
        <TopMessage
          title={`${percentageToSync} Sincronizado`}
          icon={CloudArrowUp}
        />
      )}
      <HomeHeader />

      <Content>
        <CarStatus
          licensePlate={vehicleInUse?.license_plate}
          onPress={handleRegisterMovement}
        />

        <Title>Histórico</Title>

        <FlatList
          data={vehicleHistoric}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoricCard
              onPress={() => handleHistoricDetails(item.id)}
              data={item}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={<Label>Não há veículos no histórico.</Label>}
        />
      </Content>
    </Container>
  )
}
