import { Container, Slogan, Title } from './styles'
import backgroundImg from '@assets/background.png'
import { Button } from '@components/Button'

import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import { ANDROID_CLIENT_ID, IOS_CLIENT_ID } from '@env'
import { useEffect, useState } from 'react'
import { Realm, useApp } from '@realm/react'
import { Alert } from 'react-native'

WebBrowser.maybeCompleteAuthSession()

export function SignIn() {
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const app = useApp()

  const [_, response, googleSignIn] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    scopes: ['profile', 'email'],
  })

  function handleGoogleSignIn() {
    setIsAuthenticating(true)

    googleSignIn().then((response) => {
      if (response.type !== 'success') {
        setIsAuthenticating(false)
      }
    })
  }

  useEffect(() => {
    if (response?.type === 'success') {
      if (response.authentication?.idToken) {
        const credentials = Realm.Credentials.jwt(
          response.authentication?.idToken,
        )

        app.logIn(credentials).catch((error) => {
          Alert.alert('Entrar', error.message)
          setIsAuthenticating(false)
        })
      } else {
        Alert.alert(
          'Entrar',
          'Não foi possível conectar com a sua conta do Google',
        )
        setIsAuthenticating(false)
      }
    }
  }, [response, app])

  return (
    <Container source={backgroundImg}>
      <Title>Ignite Fleet</Title>
      <Slogan>Gestão de uso de veículos</Slogan>

      <Button
        isLoading={isAuthenticating}
        onPress={handleGoogleSignIn}
        title="Entrar com Google"
      />
    </Container>
  )
}
