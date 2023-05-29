import React, { forwardRef } from 'react'
import { Container, Input, Label } from './styles'
import { TextInput, TextInputProps } from 'react-native'
import { useTheme } from 'styled-components/native'

type Props = TextInputProps & {
  label: string
}

// eslint-disable-next-line
const TextAreaInput = forwardRef<TextInput, Props>(
  ({ label, ...rest }, ref) => {
    const { COLORS } = useTheme()

    return (
      <Container>
        <Label>{label}</Label>

        <Input
          ref={ref}
          multiline
          autoCapitalize="sentences"
          placeholderTextColor={COLORS.GRAY_400}
          {...rest}
        />
      </Container>
    )
  },
)

export { TextAreaInput }
