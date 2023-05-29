import { Container, Input, Label } from './styles'
import { TextInputProps, TextInput } from 'react-native'
import { useTheme } from 'styled-components/native'
import { forwardRef } from 'react'

type Props = TextInputProps & {
  label: string
}

// eslint-disable-next-line react/display-name
const LicensePlateInput = forwardRef<TextInput, Props>(
  ({ label, ...rest }, ref) => {
    const { COLORS } = useTheme()

    return (
      <Container>
        <Label>{label}</Label>

        <Input
          ref={ref}
          maxLength={7}
          autoCapitalize="characters"
          placeholderTextColor={COLORS.GRAY_400}
          {...rest}
        />
      </Container>
    )
  },
)

export { LicensePlateInput }
