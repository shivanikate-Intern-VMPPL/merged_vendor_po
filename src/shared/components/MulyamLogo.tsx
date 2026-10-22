import logoImage from '../../assets/Mulyam_logo.svg'
// If using PNG instead, change the line above to:
// import logoImage from '../../assets/mulyam-logo.png'

interface MulyamLogoProps {
  size?: number
  src?: string
}

export function MulyamLogo({ size = 64, src }: MulyamLogoProps) {
  const imageSrc = src ?? logoImage
  return (
    <img
      src={imageSrc}
      alt="Mulyam"
      style={{
        height: size,
        width: 'auto',
        display: 'block',
      }}
    />
  )
}

export function MulyamLogoSmall({ src }: { src?: string }) {
  return <MulyamLogo size={36} src={src} />
}

// Wordmark, matching "MULYAM" horizontal lockup
export function MulyamWordmark({ fontSize = 28 }: { fontSize?: number }) {
  return (
    <span
      style={{
        color: '#004B8B',
        fontWeight: 800,
        fontSize,
        fontFamily: '"Poppins", sans-serif',
        letterSpacing: -0.5,
      }}
    >
      Mulyam
    </span>
  )
}