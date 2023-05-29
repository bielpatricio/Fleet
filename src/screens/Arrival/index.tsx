import { Alert } from 'react-native'
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
import { getLastSyncTimestamp } from '@libs/asyncStorage/asyncStorage'

type RouteParamsProps = {
  id: string
}

export function Arrival() {
  const route = useRoute()
  const { id } = route.params as RouteParamsProps

  const [dataNotSynced, setDataNotSynced] = useState(false)

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

  function removeVehicleUsage() {
    try {
      realm.write(() => {
        realm.delete(historic)
      })
      goBack()
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cancelar o uso do veículo.')
    }
  }

  function handleArrivalRegister() {
    try {
      if (!historic) {
        Alert.alert(
          'Erro',
          'Não foi possível obter os dados para registrar a chegada do veículo..',
        )
      }

      realm.write(() => {
        historic!.status = 'arrival'
        historic!.updated_at = new Date()
      })

      Alert.alert('Chegada', 'Chegada registrada com sucesso')

      goBack()
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar a chegada do veículo.')
    }
  }

  useEffect(() => {
    getLastSyncTimestamp().then((lastSync) =>
      setDataNotSynced(historic!.updated_at.getTime() > lastSync),
    )
  }, [historic])

  return (
    <Container>
      <Header title={title} />
      <Content>
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
