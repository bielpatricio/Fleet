import { TouchableOpacityProps } from 'react-native'
import { Container, Loading, Title } from './styles'

type Props = TouchableOpacityProps & {
  title: string
  isLoading?: boolean
}

export function Button({ title, isLoading = false, ...rest }: Props) {
  return (
    <Container disabled={isLoading} activeOpacity={0.7} {...rest}>
      {isLoading ? <Loading /> : <Title>{title}</Title>}
    </Container>
  )
}
