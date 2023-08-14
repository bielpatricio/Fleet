import { IconBox } from '@components/IconBox'
import { Car, FlagCheckered } from 'phosphor-react-native'
import { useRef } from 'react'
import MapView, {
  PROVIDER_GOOGLE,
  LatLng,
  MapViewProps,
  Marker,
  Polyline,
} from 'react-native-maps'
import { useTheme } from 'styled-components'

type Props = MapViewProps & {
  coordinates: LatLng[]
}

// show mini map
export function Map({ coordinates, ...rest }: Props) {
  const mapRef = useRef<MapView>(null)
  const lastCoordinates = coordinates[coordinates.length - 1]

  const { COLORS } = useTheme()

  async function onMapLoaded() {
    if (coordinates.length > 1) {
      mapRef.current?.fitToSuppliedMarkers(['departure', 'arrival'], {
        edgePadding: { top: 50, left: 50, right: 50, bottom: 50 },
      })
    }
  }

  return (
    <MapView
      ref={mapRef}
      {...rest}
      provider={PROVIDER_GOOGLE}
      style={{ width: '100%', height: 200 }}
      region={{
        latitude: lastCoordinates.latitude,
        longitude: lastCoordinates.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }}
      onMapLoaded={onMapLoaded}
    >
      <Marker identifier="departure" coordinate={coordinates[0]}>
        <IconBox size="SMALL" icon={Car} />
      </Marker>

      {coordinates.length > 1 && (
        <>
          <Marker identifier="arrival" coordinate={lastCoordinates}>
            <IconBox size="SMALL" icon={FlagCheckered} />
          </Marker>

          <Polyline
            coordinates={[...coordinates]}
            strokeColor={COLORS.BRAND_LIGHT}
            strokeWidth={7}
          />
        </>
      )}
    </MapView>
  )
}
