import { Alert } from 'react-native'
import { LatLng } from 'react-native-maps'
import {
  AsyncMessage,
  Container,
  Content,
  Description,
  Footer,
  Label,
  LicensePlate,
} from './styles'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '@components/Header'
import { Button } from '@components/Button'
import { ButtonIcon } from '@components/ButtonIcon'
import { X } from 'phosphor-react-native'
import { useObject, useRealm } from '@libs/realm'
import { Historic } from '@libs/realm/schemas/Historic'
import { BSON } from 'realm'
import { useEffect, useState } from 'react'
import { getLastAsyncTimestamp } from '@libs/asyncStorage/asyncStorage'
import { stopLocationTask } from '../../tasks/backgroundLocationTask'
import { getStorageLocations } from '@libs/asyncStorage/locationStorage'
import { Map } from '@components/Map'
import { Locations } from '@components/Locations'
import { getAddressLocation } from '@utils/getAddressLocation'
import { LocationInfoProps } from '@components/LocationInfo'
import dayjs from 'dayjs'
import { Loading } from '@components/Loading'

type RouteParamsProps = {
  id: string
}

export function Arrival() {
  const route = useRoute()
  const { id } = route.params as RouteParamsProps

  const [dataNotSynced, setDataNotSynced] = useState(false)
  const [coordinates, setCoordinates] = useState<LatLng[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const [departure, setDeparture] = useState<LocationInfoProps>(
    {} as LocationInfoProps,
  )
  const [arrival, setArrival] = useState<LocationInfoProps | null>(null)

  const { goBack } = useNavigation()

  const historic = useObject(Historic, new BSON.UUID(id))
  const realm = useRealm()

  const title = historic?.status === 'departure' ? 'Chegada' : 'Detalhes'

  function handleRemoveVehicleUsage() {
    Alert.alert('Cancelar', 'Cancelar o uso do veículo?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', onPress: () => removeVehicleUsage() },
    ])
  }

  async function removeVehicleUsage() {
    try {
      realm.write(() => {
        realm.delete(historic)
      })
      await stopLocationTask()
      goBack()
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cancelar o uso do veículo.')
    }
  }

  async function handleArrivalRegister() {
    try {
      if (!historic) {
        Alert.alert(
          'Erro',
          'Não foi possível obter os dados para registrar a chegada do veículo..',
        )
      }

      const locations = await getStorageLocations()

      realm.write(() => {
        historic!.status = 'arrival'
        historic!.updated_at = new Date()
        historic!.coords.push(...locations)
      })

      await stopLocationTask()

      Alert.alert('Chegada', 'Chegada registrada com sucesso')

      goBack()
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar a chegada do veículo.')
    }
  }

  async function getLocationsInfo() {
    if (!historic) {
      return
    }

    const lastSync = await getLastAsyncTimestamp()
    const updatedAt = historic!.updated_at.getTime()

    setDataNotSynced(updatedAt > lastSync)

    if (historic?.status === 'departure') {
      const locationsStorage = await getStorageLocations()
      setCoordinates(locationsStorage)
    } else {
      setCoordinates(historic?.coords ?? [])
    }

    if (historic?.coords[0]) {
      const departureStreetName = await getAddressLocation(historic?.coords[0])
      setDeparture({
        label: `Saindo de ${departureStreetName ?? ''}`,
        description: dayjs(new Date(historic?.coords[0].timestamp)).format(
          'DD/MM/YYYY [às] HH:mm',
        ),
      })
    }

    if (historic?.status === 'arrival') {
      const lastLocation = historic?.coords[historic?.coords.length - 1]
      const arrivalStreetName = await getAddressLocation(lastLocation)
      setArrival({
        label: `Chegando em ${arrivalStreetName ?? ''}`,
        description: dayjs(new Date(lastLocation.timestamp)).format(
          'DD/MM/YYYY [às] HH:mm',
        ),
      })
    }

    setIsLoading(false)
  }

  useEffect(() => {
    getLocationsInfo()
  }, [historic])

  if (isLoading) {
    return <Loading />
  }

  return (
    <Container>
      <Header title={title} />

      {coordinates.length > 0 && <Map coordinates={coordinates} />}

      <Content>
        <Locations departure={departure} arrival={arrival} />

        <Label>Placa do veículo</Label>

        <LicensePlate>{historic?.license_plate}</LicensePlate>

        <Label>Finalidade</Label>

        <Description>{historic?.description}</Description>
      </Content>
      {historic?.status === 'departure' && (
        <Footer>
          <ButtonIcon icon={X} onPress={handleRemoveVehicleUsage} />

          <Button title="Registrar chegada" onPress={handleArrivalRegister} />
        </Footer>
      )}

      {dataNotSynced && (
        <AsyncMessage>
          Sincronização da
          {historic?.status === 'departure' ? ' partida' : ' chegada'} pendente.
        </AsyncMessage>
      )}
    </Container>
  )
}
