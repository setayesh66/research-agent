export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.6} color="#e8f4ff" />
      <directionalLight
        position={[3, 5, 2]}
        intensity={1.4}
        color="#ffffff"
      />
      <pointLight
        position={[-4, -2, -3]}
        intensity={0.8}
        color="#bfe3ff"
      />
    </>
  );
}