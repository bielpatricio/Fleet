import { useRef, useState } from 'react'
import { Container, Content } from './styles'
import { Header } from '@components/Header'
import { LicensePlateInput } from '@components/LicensePlateInput'
import { TextAreaInput } from '@components/TextAreaInput'
import { Button } from '@components/Button'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native'

import { licensePlateValidate } from '@utils/licensePlateValidate'
import { useRealm } from '@libs/realm'
import { Historic } from '@libs/realm/schemas/Historic'
import { useUser } from '@realm/react'
import { useNavigation } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const keyboardAvoidingView = Platform.OS === 'android' ? 'height' : 'position'

export function Departure() {
  const [description, setDescription] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  const descriptionRef = useRef<TextInput>(null)
  const licensePlateRef = useRef<TextInput>(null)

  const realm = useRealm()
  const user = useUser()

  const { goBack } = useNavigation()

  function handleDepartureRegister() {
    try {
      if (!licensePlateValidate(licensePlate)) {
        licensePlateRef.current?.focus()
        return Alert.alert(
          'Placa inválida',
          'A placa informada não é válida. Por favor, verifique e tente novamente.',
        )
      }

      if (description.trim().length === 0) {
        descriptionRef.current?.focus()
        return Alert.alert(
          'Finalidade',
          'Por favor, informe a finalidade da utilização do veículo.',
        )
      }

      setIsRegistering(true)

      realm.write(() => {
        realm.create(
          'Historic',
          Historic.generate({
            license_plate: licensePlate.toUpperCase(),
            user_id: user!.id,
            description,
          }),
        )
      })

      Alert.alert(
        'Saída registrada',
        'A saída do veículo foi registrada com sucesso.',
      )

      goBack()
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Não foi possível registrar a saída do veículo.')
      setIsRegistering(false)
    }
  }

  return (
    <Container>
      <Header title="Saída" />

      {/* <KeyboardAvoidingView style={{ flex: 1 }} behavior={keyboardAvoidingView}> */}
      <KeyboardAwareScrollView extraHeight={100}>
        <ScrollView style={{ flex: 1 }}>
          <Content>
            <LicensePlateInput
              ref={licensePlateRef}
              onSubmitEditing={() => descriptionRef.current?.focus()}
              returnKeyType="next"
              label="Placa do veículo"
              placeholder="BRA0001"
              onChangeText={setLicensePlate}
            />

            <TextAreaInput
              ref={descriptionRef}
              label="Finalidade"
              placeholder="Vou utilizar o veiculo para..."
              onSubmitEditing={handleDepartureRegister}
              returnKeyType="send"
              blurOnSubmit
              onChangeText={setDescription}
            />

            <Button
              disabled={isRegistering}
              title="Registrar saída"
              onPress={handleDepartureRegister}
            />
          </Content>
        </ScrollView>
      </KeyboardAwareScrollView>
      {/* </KeyboardAvoidingView> */}
    </Container>
  )
}
