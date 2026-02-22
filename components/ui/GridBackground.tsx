export default function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 grid-background opacity-40" />
      <div className="absolute inset-0 bg-gradient-radial from-refinex-cyan/5 via-transparent to-transparent" />
    </div>
  )
}
